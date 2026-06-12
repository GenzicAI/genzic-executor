import { Home, Users, UserCheck, Map, CalendarCheck } from "lucide-react";
import type { NicheConfig } from "./types";
import { buildLeads, pick } from "./lead-factory";

const INTENT = ["Looking to Buy", "Looking to Sell", "Land Deal"];
const BUDGET = ["$150k-$300k", "$300k-$500k", "$500k-$750k", "$750k-$1M", "$1M+"];
const TIMELINE = ["ASAP", "1-3 months", "3-6 months", "6-12 months"];
const LIFE = ["New Job", "Growing Family", "Relocating", "Downsizing", "Divorce", "Inheritance", "First-Time Buyer"];
const PHOTOS = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=60",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=60",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=60",
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=400&q=60",
];

export const realtor: NicheConfig = {
  id: "realtor",
  label: "Realtor",
  tagline: "Connect with motivated buyers, sellers, and land owners first.",
  icon: Home,
  emoji: "🔑",
  accent: "217 91% 60%",
  showLeadImage: true,
  stats: [
    { id: "buyers", label: "Buyers Found", kind: "leads", icon: Users },
    { id: "sellers", label: "Sellers Found", kind: "qualified", icon: UserCheck },
    { id: "land", label: "Land Deals", kind: "custom", icon: Map, value: 12 },
    { id: "appts", label: "Appointments Booked", kind: "converted", icon: CalendarCheck },
  ],
  filters: [
    {
      id: "intent",
      label: "Looking to",
      type: "select",
      options: INTENT.map((i) => ({ label: i, value: i })),
    },
    {
      id: "budget",
      label: "Budget Range",
      type: "select",
      options: BUDGET.map((b) => ({ label: b, value: b })),
    },
    {
      id: "timeline",
      label: "Timeline",
      type: "select",
      options: TIMELINE.map((t) => ({ label: t, value: t })),
    },
    {
      id: "life",
      label: "Life Events",
      type: "multi",
      options: LIFE.map((l) => ({ label: l, value: l })),
    },
  ],
  templates: [
    {
      id: "re-buyer",
      channel: "email",
      name: "Buyer Consultation",
      subject: "{{name}}, let's find your next home",
      body:
        "Hi {{name}},\n\nI saw you're {{intent}} in the {{budget}} range with a {{timeline}} timeline. I have a few listings that may be a great fit — and some that aren't even on the market yet.\n\nCan we hop on a quick call this week to map out your search?\n\n— {{agent}}, Realtor®",
    },
    {
      id: "re-seller",
      channel: "email",
      name: "Free Home Valuation",
      subject: "What's your home worth today, {{name}}?",
      body:
        "Hi {{name}},\n\nInventory is tight and motivated buyers are active in your area. I'd love to send you a free, no-obligation valuation so you know exactly what your home could sell for.\n\nWant me to put it together?\n\n— {{agent}}, Realtor®",
    },
    {
      id: "re-sms",
      channel: "sms",
      name: "SMS — Quick Touch",
      body:
        "Hi {{name}}, it's {{agent}} (Realtor®). You mentioned {{intent}} on a {{timeline}} timeline — I've got options that fit. Free to chat this week? Reply YES.",
    },
  ],
  generateLeads: (count) =>
    buildLeads(count, {
      seedBase: 4040,
      decorate: (rng) => {
        const intent = pick(rng, INTENT);
        const budget = pick(rng, BUDGET);
        const timeline = pick(rng, TIMELINE);
        const life = pick(rng, LIFE);
        const isLand = intent === "Land Deal";
        return {
          tags: [intent, budget, timeline, life],
          summary: isLand
            ? `Motivated land owner — ${budget} range, ready ${timeline}. Trigger: ${life}.`
            : `${intent} in the ${budget} range, ${timeline}. Life event: ${life}.`,
          image: pick(rng, PHOTOS),
          attrs: { intent, budget, timeline, life },
        };
      },
    }),
};
