const form = document.querySelector("#profile-form");
const skillsInput = document.querySelector("#skills");
const interestsInput = document.querySelector("#interests");
const workModesInput = document.querySelector("#work-modes");
const message = document.querySelector("#form-message");
const resultsSection = document.querySelector("#results-section");
const resultsContainer = document.querySelector("#results");
const submitButton = document.querySelector("#submit-button");

function splitValues(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function addTextList(card, title, items, emptyText) {
  const heading = document.createElement("h4");
  heading.textContent = title;
  card.append(heading);

  if (!items.length) {
    const note = document.createElement("p");
    note.className = "job-summary";
    note.textContent = emptyText;
    card.append(note);
    return;
  }

  const list = document.createElement("ul");
  for (const item of items) {
    const row = document.createElement("li");
    row.textContent = item;
    list.append(row);
  }
  card.append(list);
}

function addScoreBreakdown(card, breakdown) {
  const section = document.createElement("section");
  section.className = "score-breakdown";
  section.setAttribute("aria-label", "Delpoäng per kategori");
  const heading = document.createElement("h4");
  heading.textContent = "Så räknas poängen";
  section.append(heading);

  const categories = [
    ["Baskrav", breakdown.requiredSkills],
    ["Meriterande färdigheter", breakdown.preferredSkills],
    ["Intressen", breakdown.interests],
    ["Arbetssätt", breakdown.workModes]
  ];

  for (const [label, result] of categories) {
    const row = document.createElement("div");
    row.className = "score-row";
    const name = document.createElement("span");
    name.textContent = label;
    const detail = document.createElement("span");
    const points = Number.isInteger(result.points) ? result.points : result.points.toFixed(1);
    detail.textContent = `${result.matched} av ${result.total} · ${points}/${result.weight} p`;
    row.append(name, detail);
    section.append(row);
  }

  card.append(section);
}

function createJobCard(match) {
  const card = document.createElement("article");
  card.className = "job-card";

  const top = document.createElement("div");
  top.className = "job-topline";
  const titleGroup = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = match.job.title;
  const company = document.createElement("p");
  company.className = "job-company";
  company.textContent = match.job.company;
  const location = document.createElement("p");
  location.className = "job-location";
  location.textContent = match.job.location;
  titleGroup.append(title, company, location);

  const score = document.createElement("div");
  score.className = "score";
  score.append(document.createTextNode(String(match.score)));
  const percent = document.createElement("small");
  percent.textContent = "% match";
  score.append(percent);
  top.append(titleGroup, score);
  card.append(top);

  const summary = document.createElement("p");
  summary.className = "job-summary";
  summary.textContent = match.job.summary;
  card.append(summary);
  addScoreBreakdown(card, match.scoreBreakdown);
  addTextList(card, "Varför det kan passa", match.reasons, "Lägg till fler uppgifter för att hitta tydligare träffar.");

  if (match.skillGaps.length) {
    const heading = document.createElement("h4");
    heading.textContent = "Kompetensluckor att utforska";
    card.append(heading);
    const tags = document.createElement("div");
    tags.className = "tags";
    for (const gap of match.skillGaps) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = gap;
      tags.append(tag);
    }
    card.append(tags);
    addTextList(card, "Ett möjligt nästa steg", match.nextSteps, "");
  }

  return card;
}

document.querySelector("#example-button").addEventListener("click", () => {
  skillsInput.value = "TypeScript, Node.js, Git";
  interestsInput.value = "AI, jobbmatchning";
  workModesInput.value = "hybrid, teamarbete";
  message.textContent = "Påhittad exempelprofil ifylld.";
  skillsInput.focus();
});

document.querySelector("#clear-button").addEventListener("click", () => {
  form.reset();
  resultsContainer.replaceChildren();
  resultsSection.hidden = true;
  message.textContent = "Profil och resultat rensade.";
  skillsInput.focus();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";

  const profile = {
    skills: splitValues(skillsInput.value),
    interests: splitValues(interestsInput.value),
    preferredWorkModes: splitValues(workModesInput.value)
  };

  const hasProfileValues = Object.values(profile).some((values) => values.length > 0);
  if (!hasProfileValues) {
    resultsContainer.replaceChildren();
    resultsSection.hidden = true;
    message.textContent = "Skriv minst ett värde i något fält för att göra en jämförelse.";
    skillsInput.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Jämför profilen …";

  try {
    const response = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Servern skickade ett svar som appen inte kunde läsa. Försök igen.");
    }
    if (!response.ok) throw new Error(payload.error || "Kunde inte göra matchningen.");
    if (!Array.isArray(payload)) throw new Error("Servern skickade ett oväntat svar. Försök igen.");
    resultsContainer.replaceChildren(...payload.map(createJobCard));
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    message.textContent = error instanceof TypeError
      ? "Kunde inte nå Jobbkompassen. Kontrollera att servern kör och försök igen."
      : error instanceof Error ? error.message : "Något gick fel. Försök igen.";
    message.focus();
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Visa mina jobbförslag <span aria-hidden="true">→</span>';
  }
});

