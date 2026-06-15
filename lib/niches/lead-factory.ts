import type { Lead } from "./types";
import { pick, seeded } from "@/lib/utils";

const FIRST = [
  "Ava", "Liam", "Maya", "Noah", "Sofia", "Ethan", "Isla", "Mason",
  "Zoe", "Lucas", "Mia", "Caleb", "Nora", "Owen", "Lily", "Jaxon",
  "Ruby", "Eli", "Hazel", "Leo", "Aria", "Finn", "Cora", "Miles",
];
const LAST = [
  "Carter", "Reyes", "Nguyen", "Patel", "Brooks", "Okafor", "Rivera",
  "Hughes", "Bennett", "Sato", "Flores", "Coleman", "Wright", "Khan",
  "Murphy", "Diaz", "Foster", "Park", "Sullivan", "Greene",
];
const CITIES = [
  "Austin, TX", "Tampa, FL", "Denver, CO", "Phoenix, AZ", "Nashville, TN",
  "Charlotte, NC", "Columbus, OH", "Sacramento, CA", "Raleigh, NC",
  "Boise, ID", "Mesa, AZ", "Plano, TX", "Henderson, NV", "Frisco, TX",
];
const AGOS = ["2m ago", "18m ago", "1h ago", "3h ago", "5h ago", "Today", "Yesterday", "2d ago"];

export interface LeadSpec {
  /** Stable seed offset so each niche produces a different feed. */
  seedBase: number;
  /** Builds the niche-specific fields for a single lead. */
  decorate: (rng: () => number) => Pick<Lead, "tags" | "summary" | "attrs"> & {
    image?: string;
  };
}

export function buildLeads(count: number, spec: LeadSpec): Lead[] {
  const leads: Lead[] = [];
  for (let i = 0; i < count; i++) {
    const rng = seeded(spec.seedBase + i * 97 + 13);
    const first = pick(rng, FIRST);
    const last = pick(rng, LAST);
    const score = Math.round(45 + rng() * 54); // 45-99
    const status: Lead["status"] =
      score > 88 ? "qualified" : score > 72 ? "contacted" : score < 55 ? "new" : "new";
    const decorated = spec.decorate(rng);
    leads.push({
      id: `${spec.seedBase}-${i}`,
      name: `${first} ${last}`,
      location: pick(rng, CITIES),
      avatar: `https://i.pravatar.cc/120?img=${(spec.seedBase + i) % 70}`,
      score,
      status,
      createdAgo: pick(rng, AGOS),
      ...decorated,
    });
  }
  // Highest-intent leads first.
  return leads.sort((a, b) => b.score - a.score);
}

export { pick };
