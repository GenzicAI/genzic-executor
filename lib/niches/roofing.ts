import { HardHat, Users, FileText, Hammer, DollarSign } from "lucide-react";
import type { NicheConfig } from "./types";
import { buildLeads, pick } from "./lead-factory";

const DAMAGE = ["Storm Damage", "Active Leak", "Missing Shingles", "Hail Damage", "Aging Roof", "Flashing Failure"];
const PROPERTY = ["Single Family", "Multi-Family", "Commercial", "Townhome"];
const URGENCY = ["Emergency", "High", "Medium", "Planning"];
const AGES = ["0-5 yrs", "6-10 yrs", "11-15 yrs", "16-20 yrs", "20+ yrs"];
const PHOTOS = [
  "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=400&q=60",
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&q=60",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&q=60",
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=400&q=60",
];

export const roofing: NicheConfig = {
  id: "roofing",
  label: "Roofing Contractor",
  tagline: "Catch homeowners the moment their roof needs attention.",
  icon: HardHat,
  emoji: "🏠",
  accent: "24 95% 53%",
  showLeadImage: true,
  stats: [
    { id: "found", label: "Leads Found", kind: "leads", icon: Users },
    { id: "quotes", label: "Quotes Sent", kind: "contacted", icon: FileText },
    { id: "jobs", label: "Jobs Won", kind: "converted", icon: Hammer },
    { id: "revenue", label: "Revenue", kind: "revenue", icon: DollarSign, value: 142300, format: "currency" },
  ],
  filters: [
    {
      id: "age",
      label: "Roof Age",
      type: "select",
      options: AGES.map((a) => ({ label: a, value: a })),
    },
    {
      id: "damage",
      label: "Damage Type",
      type: "multi",
      options: DAMAGE.map((d) => ({ label: d, value: d })),
    },
    {
      id: "property",
      label: "Property Type",
      type: "select",
      options: PROPERTY.map((p) => ({ label: p, value: p })),
    },
    {
      id: "urgency",
      label: "Urgency Level",
      type: "select",
      options: URGENCY.map((u) => ({ label: u, value: u })),
    },
  ],
  templates: [
    {
      id: "rf-inspect",
      channel: "email",
      name: "Free Roof Inspection",
      subject: "Free roof inspection for your {{property}}, {{name}}",
      body:
        "Hi {{name}},\n\nWith the recent weather, we're offering free roof inspections in your area. Given the {{damage}} reported nearby, it's worth a quick look before it gets worse.\n\nWe can stop by this week — no obligation. What day works?\n\n— {{company}} Roofing",
    },
    {
      id: "rf-insurance",
      channel: "email",
      name: "Insurance Claim Assist",
      subject: "We'll handle your insurance claim, {{name}}",
      body:
        "Hi {{name}},\n\nIf your roof has {{damage}}, you may be eligible for a fully-covered replacement. We work directly with your insurance and handle the paperwork start to finish.\n\nWant a free claim assessment? Reply and we'll set it up.\n\n— {{company}} Roofing",
    },
    {
      id: "rf-sms",
      channel: "sms",
      name: "SMS — Storm Follow-up",
      body:
        "Hi {{name}}, {{company}} Roofing here. We're inspecting roofs in your neighborhood after the storm — free of charge. Want us to check yours? Reply YES.",
    },
  ],
  generateLeads: (count) =>
    buildLeads(count, {
      seedBase: 3030,
      decorate: (rng) => {
        const damage = pick(rng, DAMAGE);
        const property = pick(rng, PROPERTY);
        const urgency = pick(rng, URGENCY);
        const age = pick(rng, AGES);
        return {
          tags: [damage, urgency, age],
          summary: `${property} with ${damage.toLowerCase()} — roof is ${age} old. Urgency: ${urgency}.`,
          image: pick(rng, PHOTOS),
          attrs: { damage, property, urgency, age },
        };
      },
    }),
};
