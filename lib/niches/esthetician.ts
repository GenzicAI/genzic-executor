import { Sparkles, Users, CalendarCheck, DollarSign } from "lucide-react";
import type { NicheConfig } from "./types";
import { buildLeads, pick } from "./lead-factory";

const CONCERNS = ["Acne", "Aging / Fine Lines", "Dry Skin", "Hyperpigmentation", "Redness", "Dull Skin"];
const SERVICES = ["Facial", "Lash Lift", "Chemical Peel", "Microdermabrasion", "Dermaplaning"];
const DEMOS = ["Gen Z", "Millennial", "Gen X", "Bridal", "New Mom"];
const PHOTOS = [
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=60",
  "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=60",
  "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=60",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=60",
];

export const esthetician: NicheConfig = {
  id: "esthetician",
  label: "Esthetician",
  tagline: "Book more clients by reaching people ready to invest in their skin.",
  icon: Sparkles,
  emoji: "✨",
  accent: "330 81% 60%",
  showLeadImage: true,
  stats: [
    { id: "found", label: "Leads Found", kind: "leads", icon: Users },
    { id: "booked", label: "Appointments Booked", kind: "converted", icon: CalendarCheck },
    { id: "revenue", label: "Revenue Generated", kind: "revenue", icon: DollarSign, value: 18450, format: "currency" },
  ],
  filters: [
    {
      id: "concern",
      label: "Skin Concern",
      type: "multi",
      options: CONCERNS.map((c) => ({ label: c, value: c })),
    },
    {
      id: "service",
      label: "Service Type",
      type: "select",
      options: SERVICES.map((s) => ({ label: s, value: s })),
    },
    {
      id: "demo",
      label: "Target Demographic",
      type: "select",
      options: DEMOS.map((d) => ({ label: d, value: d })),
    },
  ],
  templates: [
    {
      id: "es-consult",
      channel: "email",
      name: "Complimentary Skin Consult",
      subject: "{{name}}, let's clear up that {{concern}} ✨",
      body:
        "Hi {{name}},\n\nI specialize in treating {{concern}} and I'd love to offer you a complimentary skin consultation. We'll build a custom plan and I'll recommend the right {{service}} for your goals.\n\nWhich day this week works for you?\n\nWarmly,\n{{esthetician}}",
    },
    {
      id: "es-promo",
      channel: "email",
      name: "New Client Promo",
      subject: "20% off your first {{service}}, {{name}}",
      body:
        "Hi {{name}},\n\nAs a new client, your first {{service}} is 20% off this month. It's the perfect way to start addressing {{concern}} and reveal glowing skin.\n\nReady to book? Just reply and I'll find you a time.\n\nXO,\n{{esthetician}}",
    },
    {
      id: "es-sms",
      channel: "sms",
      name: "SMS — Booking Reminder",
      body:
        "Hi {{name}}! ✨ It's {{esthetician}}. I have openings this week for a {{service}} to help with your {{concern}}. Want me to save you a spot? Reply YES!",
    },
  ],
  generateLeads: (count) =>
    buildLeads(count, {
      seedBase: 2020,
      decorate: (rng) => {
        const concern = pick(rng, CONCERNS);
        const service = pick(rng, SERVICES);
        const demo = pick(rng, DEMOS);
        return {
          tags: [concern, service, demo],
          summary: `Interested in a ${service.toLowerCase()} to address ${concern.toLowerCase()}.`,
          image: pick(rng, PHOTOS),
          attrs: { concern, service, demo },
        };
      },
    }),
};
