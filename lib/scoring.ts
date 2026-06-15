import type { Lead } from "@/lib/niches/types";
import { seeded } from "@/lib/utils";

export interface ScoreFactor {
  label: string;
  /** 0-100 contribution weight for display. */
  weight: number;
  positive: boolean;
}

/**
 * Produces a deterministic, human-readable breakdown of an AI lead score.
 * In production this would come from Abacus.AI; here it is derived from the
 * lead's own attributes so the explanation is stable and plausible.
 */
export function scoreBreakdown(lead: Lead): ScoreFactor[] {
  const rng = seeded(Number(lead.id.replace(/\D/g, "")) || lead.score);
  const intentSignals = [
    "Engagement intent",
    "Budget fit",
    "Timeline urgency",
    "Profile completeness",
    "Channel responsiveness",
  ];
  const factors = intentSignals.map((label, i) => {
    const base = Math.round((lead.score / 100) * (60 + rng() * 40));
    const jitter = Math.round((rng() - 0.5) * 30);
    const weight = Math.max(8, Math.min(98, base + jitter - i * 4));
    return { label, weight, positive: weight >= 55 };
  });
  return factors.sort((a, b) => b.weight - a.weight);
}

export function scoreTier(score: number): { label: string; tone: string } {
  if (score >= 85) return { label: "Hot lead", tone: "text-niche" };
  if (score >= 70) return { label: "Warm lead", tone: "text-amber-400" };
  return { label: "Nurture", tone: "text-muted-foreground" };
}
