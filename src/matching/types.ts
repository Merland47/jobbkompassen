export interface UserProfile {
  skills: string[];
  interests: string[];
  preferredWorkModes: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  interests: string[];
  workModes: string[];
}

export interface JobMatch {
  job: JobPosting;
  score: number;
  scoreBreakdown: {
    requiredSkills: { points: number; weight: number; matched: number; total: number };
    preferredSkills: { points: number; weight: number; matched: number; total: number };
    interests: { points: number; weight: number; matched: number; total: number };
    workModes: { points: number; weight: number; matched: number; total: number };
  };
  reasons: string[];
  skillGaps: string[];
  nextSteps: string[];
}
