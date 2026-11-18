import type { JobPosting } from "../matching/types.ts";

// Alla annonser och arbetsgivare nedan är fiktiva demonstrationsdata.
export const sampleJobs: JobPosting[] = [
  {
    id: "demo-ai-assistant",
    title: "Junior AI-utvecklare",
    company: "Exempelbolaget Nord",
    location: "Stockholm / hybrid",
    summary: "Hjälp teamet att bygga och utvärdera AI-funktioner för en digital tjänst.",
    requiredSkills: ["TypeScript", "Node.js", "Git"],
    preferredSkills: ["AI API", "testning", "REST API"],
    interests: ["AI", "jobbmatchning", "produktutveckling"],
    workModes: ["hybrid", "teamarbete"]
  },
  {
    id: "demo-data-analyst",
    title: "Junior dataanalytiker",
    company: "Exempelbolaget Tall",
    location: "Göteborg / på plats",
    summary: "Utforska data, skapa tydliga rapporter och samarbeta med produktteamet.",
    requiredSkills: ["Excel", "analytiskt tänkande", "kommunikation"],
    preferredSkills: ["SQL", "visualisering", "Python"],
    interests: ["data", "samhällsnytta", "problemlösning"],
    workModes: ["på plats", "teamarbete"]
  },
  {
    id: "demo-product-support",
    title: "Teknisk kundsupport, junior",
    company: "Exempelbolaget Ljus",
    location: "Distans inom Sverige",
    summary: "Hjälp användare, undersök problem och förmedla återkoppling till utvecklarna.",
    requiredSkills: ["kommunikation", "problemlösning", "svenska"],
    preferredSkills: ["teknisk support", "felsökning", "ärendehantering"],
    interests: ["teknik", "människor", "kundupplevelse"],
    workModes: ["distans", "självständigt arbete"]
  }
];
