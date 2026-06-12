import type { LucideIcon } from "lucide-react";

export type FilterType = "select" | "multi" | "range";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  /** Stable key used in the filters state object. */
  id: string;
  label: string;
  type: FilterType;
  /** For select / multi filters. */
  options?: FilterOption[];
  /** For range filters. */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface StatDef {
  id: string;
  label: string;
  /** Key on a lead that contributes to this stat, or a precomputed value. */
  kind: "leads" | "qualified" | "contacted" | "converted" | "revenue" | "custom";
  icon: LucideIcon;
  /** A fixed mock value (used for revenue / booked style metrics). */
  value?: number;
  format?: "number" | "currency";
}

export interface TemplateDef {
  id: string;
  channel: "email" | "sms";
  name: string;
  subject?: string;
  body: string;
}

/** A single lead in a niche feed. */
export interface Lead {
  id: string;
  name: string;
  location: string;
  avatar: string;
  /** AI score 0-100. */
  score: number;
  status: "new" | "qualified" | "contacted" | "converted";
  /** Niche-specific tag chips shown on the card. */
  tags: string[];
  /** One-line summary / concern / detail. */
  summary: string;
  /** Optional property / client image. */
  image?: string;
  /** Raw attribute map used for client-side filtering. */
  attrs: Record<string, string | number>;
  createdAgo: string;
  /** Free-form notes added by the user (CRM). */
  notes?: string;
}

export interface NicheConfig {
  id: string;
  /** Short label, e.g. "Personal Trainer". */
  label: string;
  /** Marketing tagline shown in the dashboard header. */
  tagline: string;
  icon: LucideIcon;
  emoji: string;
  /** HSL triplet "H S% L%" used to theme the dashboard accent. */
  accent: string;
  /** Whether lead cards should surface the lead image prominently. */
  showLeadImage: boolean;
  stats: StatDef[];
  filters: FilterDef[];
  templates: TemplateDef[];
  /** Generates a deterministic mock feed for the niche. */
  generateLeads: (count: number) => Lead[];
}
