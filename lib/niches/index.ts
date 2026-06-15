import type { NicheConfig } from "./types";
import { personalTrainer } from "./personal-trainer";
import { esthetician } from "./esthetician";
import { roofing } from "./roofing";
import { realtor } from "./realtor";

/**
 * Central niche registry. Adding a new niche is a one-line change here:
 * build a NicheConfig in its own file and append it below. The Industry
 * Selector, routing, dashboards, filters, and templates all read from this
 * registry, so no other code needs to change to support 30+ niches.
 */
export const NICHES: NicheConfig[] = [
  personalTrainer,
  esthetician,
  roofing,
  realtor,
];

export const NICHE_MAP: Record<string, NicheConfig> = Object.fromEntries(
  NICHES.map((n) => [n.id, n]),
);

export function getNiche(id: string): NicheConfig | undefined {
  return NICHE_MAP[id];
}

export type { NicheConfig };
export * from "./types";
