import assert from "node:assert/strict";
import test from "node:test";
import { sampleJobs } from "../src/data/jobs.ts";
import { matchJob, matchJobs } from "../src/matching/matcher.ts";
import type { UserProfile } from "../src/matching/types.ts";

const sampleProfile: UserProfile = {
  skills: ["TypeScript", "Node.js", "Git"],
  interests: ["AI", "jobbmatchning"],
  preferredWorkModes: ["hybrid", "teamarbete"]
};

test("högre poäng ges när baskrav och önskemål matchar", () => {
  const goodMatch = matchJob(sampleProfile, sampleJobs[0]);
  const weakerMatch = matchJob(sampleProfile, sampleJobs[1]);
  assert.ok(goodMatch.score > weakerMatch.score);
  assert.equal(goodMatch.score, 80);
});

test("visar saknade baskrav och övningsförslag", () => {
  const result = matchJob({ skills: [], interests: [], preferredWorkModes: [] }, sampleJobs[0]);
  assert.deepEqual(result.skillGaps, ["TypeScript", "Node.js", "Git"]);
  assert.equal(result.nextSteps.length, 3);
  assert.match(result.reasons[0], /Ingen tydlig träff/);
  assert.equal(result.score, 0);
});

test("jämför färdigheter utan att skilja på stora och små bokstäver", () => {
  const result = matchJob(
    { skills: ["typescript", "NODE.JS", "git"], interests: [], preferredWorkModes: [] },
    sampleJobs[0]
  );
  assert.equal(result.score, 60);
  assert.deepEqual(result.skillGaps, []);
});

test("förklarar intresse-, arbetssätts- och meriterande träffar", () => {
  const result = matchJob(
    { skills: ["TypeScript", "AI API"], interests: ["AI"], preferredWorkModes: ["hybrid"] },
    sampleJobs[0]
  );
  assert.ok(result.reasons.some((reason) => reason.includes("AI API")));
  assert.ok(result.reasons.some((reason) => reason.includes("AI.")));
  assert.ok(result.reasons.some((reason) => reason.includes("hybrid")));
});

test("sorterar annonser efter poäng, högst först", () => {
  const results = matchJobs(sampleProfile, sampleJobs);
  assert.equal(results[0].job.id, "demo-ai-assistant");
  assert.ok(results[0].score >= results[1].score);
  assert.ok(results[1].score >= results[2].score);
});

test("tom profil ger noll poäng och visar alla baskrav som luckor", () => {
  const result = matchJob({ skills: [], interests: [], preferredWorkModes: [] }, sampleJobs[1]);
  assert.equal(result.score, 0);
  assert.deepEqual(result.skillGaps, sampleJobs[1].requiredSkills);
});

test("extra blanksteg runt värden ignoreras", () => {
  const result = matchJob(
    { skills: ["  TypeScript  ", " Node.js "], interests: [" AI "], preferredWorkModes: [" hybrid "] },
    sampleJobs[0]
  );
  assert.equal(result.scoreBreakdown.requiredSkills.matched, 2);
  assert.equal(result.scoreBreakdown.interests.matched, 1);
  assert.equal(result.scoreBreakdown.workModes.matched, 1);
});

test("dubbla profilvärden ger inte extra poäng", () => {
  const oneCopy = matchJob({ skills: ["Git"], interests: [], preferredWorkModes: [] }, sampleJobs[0]);
  const duplicates = matchJob({ skills: ["Git", "Git", "git"], interests: [], preferredWorkModes: [] }, sampleJobs[0]);
  assert.equal(duplicates.score, oneCopy.score);
  assert.equal(duplicates.scoreBreakdown.requiredSkills.matched, 1);
});

test("okända värden matchar inte annonserna", () => {
  const result = matchJob(
    { skills: ["Rymdjuridik"], interests: ["Undervattensdans"], preferredWorkModes: ["Månbas"] },
    sampleJobs[0]
  );
  assert.equal(result.score, 0);
  assert.deepEqual(result.skillGaps, sampleJobs[0].requiredSkills);
});

test("lika poäng sorteras efter jobbtitel", () => {
  const results = matchJobs({ skills: [], interests: [], preferredWorkModes: [] }, sampleJobs);
  assert.deepEqual(results.map((result) => result.job.title), [...sampleJobs]
    .map((job) => job.title)
    .sort((a, b) => a.localeCompare(b, "sv-SE")));
});
