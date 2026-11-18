import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sampleJobs } from "./data/jobs.ts";
import { matchJobs } from "./matching/matcher.ts";
import type { UserProfile } from "./matching/types.ts";

const projectDirectory = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicDirectory = join(projectDirectory, "public");
const maxRequestBytes = 16 * 1024;

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxRequestBytes) {
      throw new Error("Förfrågan är för stor. Håll dig under 16 KB.");
    }
    chunks.push(buffer);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Uppgifterna kunde inte läsas. Kontrollera profilen och försök igen.");
  }
}

function readList(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length > 20) {
    throw new Error(`Fältet ${fieldName} måste vara en lista med högst 20 värden.`);
  }

  return value.map((item) => {
    if (typeof item !== "string" || item.trim().length === 0 || item.length > 60) {
      throw new Error(`Varje värde i ${fieldName} måste vara text på 1–60 tecken.`);
    }
    return item.trim();
  });
}

function parseProfile(body: unknown): UserProfile {
  if (typeof body !== "object" || body === null) {
    throw new Error("Skicka profilen som ett JSON-objekt.");
  }

  const record = body as Record<string, unknown>;
  return {
    skills: readList(record.skills, "skills"),
    interests: readList(record.interests, "interests"),
    preferredWorkModes: readList(record.preferredWorkModes, "preferredWorkModes")
  };
}

async function serveStaticFile(request: IncomingMessage, response: ServerResponse, pathname: string): Promise<void> {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, { error: "Ogiltig adress." });
    return;
  }

  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = resolve(publicDirectory, `.${requestedPath}`);
  const pathFromPublic = relative(publicDirectory, filePath);
  if (pathFromPublic.startsWith(`..${sep}`) || pathFromPublic === ".." || filePath === publicDirectory) {
    sendJson(response, 403, { error: "Den filen kan inte hämtas." });
    return;
  }

  try {
    await access(filePath);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      sendJson(response, 404, { error: "Filen hittades inte." });
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:"
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch {
    sendJson(response, 404, { error: "Filen hittades inte." });
  }
}

export function createAppServer() {
  return createHttpServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    if (url.pathname === "/api/jobs" && request.method === "GET") {
      sendJson(response, 200, sampleJobs);
      return;
    }

    if (url.pathname === "/api/matches" && request.method === "POST") {
      try {
        const profile = parseProfile(await readJson(request));
        sendJson(response, 200, matchJobs(profile, sampleJobs));
      } catch (error) {
        sendJson(response, 400, {
          error: error instanceof Error ? error.message : "Kunde inte läsa profilen."
        });
      }
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "API-adressen finns inte." });
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveStaticFile(request, response, url.pathname);
      return;
    }

    sendJson(response, 405, { error: "Metoden stöds inte." });
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createAppServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`Jobbkompassen körs på http://127.0.0.1:${port}`);
  });
}
