import type { JobMatch, JobPosting, UserProfile } from "./types.ts";

const WEIGHTS = {
  requiredSkills: 60,
  preferredSkills: 15,
  interests: 15,
  workModes: 10
} as const;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("sv-SE");
}

function matchingItems(userItems: string[], jobItems: string[]): string[] {
  const userSet = new Set(userItems.map(normalize).filter(Boolean));
  return jobItems.filter((item) => userSet.has(normalize(item)));
}

function categoryScore(matchedCount: number, totalCount: number, weight: number): number {
  if (totalCount === 0) return 0;
  return (matchedCount / totalCount) * weight;
}

function buildNextSteps(skillGaps: string[]): string[] {
  return skillGaps.map(
    (skill) => `Öva på ${skill} genom en liten övning eller ett eget miniprojekt.`
  );
}

export function matchJob(profile: UserProfile, job: JobPosting): JobMatch {
  const requiredMatches = matchingItems(profile.skills, job.requiredSkills);
  const preferredMatches = matchingItems(profile.skills, job.preferredSkills);
  const interestMatches = matchingItems(profile.interests, job.interests);
  const workModeMatches = matchingItems(profile.preferredWorkModes, job.workModes);

  const scoreBreakdown = {
    requiredSkills: {
      points: categoryScore(requiredMatches.length, job.requiredSkills.length, WEIGHTS.requiredSkills),
      weight: WEIGHTS.requiredSkills,
      matched: requiredMatches.length,
      total: job.requiredSkills.length
    },
    preferredSkills: {
      points: categoryScore(preferredMatches.length, job.preferredSkills.length, WEIGHTS.preferredSkills),
      weight: WEIGHTS.preferredSkills,
      matched: preferredMatches.length,
      total: job.preferredSkills.length
    },
    interests: {
      points: categoryScore(interestMatches.length, job.interests.length, WEIGHTS.interests),
      weight: WEIGHTS.interests,
      matched: interestMatches.length,
      total: job.interests.length
    },
    workModes: {
      points: categoryScore(workModeMatches.length, job.workModes.length, WEIGHTS.workModes),
      weight: WEIGHTS.workModes,
      matched: workModeMatches.length,
      total: job.workModes.length
    }
  };
  const rawScore = Object.values(scoreBreakdown).reduce((sum, category) => sum + category.points, 0);

  const skillGaps = job.requiredSkills.filter(
    (skill) => !requiredMatches.some((match) => normalize(match) === normalize(skill))
  );

  const reasons: string[] = [];
  if (requiredMatches.length > 0) {
    reasons.push(`Du matchar ${requiredMatches.length} av ${job.requiredSkills.length} baskrav: ${requiredMatches.join(", ")}.`);
  }
  if (preferredMatches.length > 0) {
    reasons.push(`Du har även meriterande färdigheter: ${preferredMatches.join(", ")}.`);
  }
  if (interestMatches.length > 0) {
    reasons.push(`Jobbets inriktning passar dina intressen: ${interestMatches.join(", ")}.`);
  }
  if (workModeMatches.length > 0) {
    reasons.push(`Arbetssättet stämmer med dina önskemål: ${workModeMatches.join(", ")}.`);
  }
  if (reasons.length === 0) {
    reasons.push("Ingen tydlig träff hittades ännu. Lägg till fler färdigheter eller intressen för en bättre jämförelse.");
  }

  return {
    job,
    score: Math.round(rawScore),
    scoreBreakdown,
    reasons,
    skillGaps,
    nextSteps: buildNextSteps(skillGaps)
  };
}

export function matchJobs(profile: UserProfile, jobs: JobPosting[]): JobMatch[] {
  return jobs
    .map((job) => matchJob(profile, job))
    .sort((a, b) => b.score - a.score || a.job.title.localeCompare(b.job.title, "sv-SE"));
}
