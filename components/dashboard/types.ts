import type { Lead } from "@/lib/niches/types";

/** Filters state shape: keyed by FilterDef.id. */
export type FiltersState = Record<string, string | string[] | number>;

export interface SendContext {
  lead: Lead | null;
  templateId?: string;
}
