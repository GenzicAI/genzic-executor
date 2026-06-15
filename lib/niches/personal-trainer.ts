import { Dumbbell, Users, CheckCircle2, Send, Trophy } from "lucide-react";
import type { NicheConfig } from "./types";
import { buildLeads, pick } from "./lead-factory";

const GOALS = ["Weight Loss", "Muscle Gain", "Wedding Prep", "Postpartum", "Athletic Performance", "General Fitness"];
const AGES = ["18-24", "25-34", "35-44", "45-54", "55+"];

export const personalTrainer: NicheConfig = {
  id: "personal-trainer",
  label: "Personal Trainer",
  tagline: "Find motivated clients ready to commit to their fitness goals.",
  icon: Dumbbell,
  emoji: "🏋️",
  accent: "152 100% 39%",
  showLeadImage: false,
  stats: [
    { id: "found", label: "Leads Found", kind: "leads", icon: Users },
    { id: "qualified", label: "Qualified", kind: "qualified", icon: CheckCircle2 },
    { id: "contacted", label: "Contacted", kind: "contacted", icon: Send },
    { id: "converted", label: "Converted", kind: "converted", icon: Trophy },
  ],
  filters: [
    {
      id: "age",
      label: "Age Range",
      type: "select",
      options: AGES.map((a) => ({ label: a, value: a })),
    },
    {
      id: "goal",
      label: "Fitness Goal",
      type: "multi",
      options: GOALS.map((g) => ({ label: g, value: g })),
    },
    { id: "radius", label: "Distance", type: "range", min: 1, max: 50, step: 1, unit: "mi" },
  ],
  templates: [
    {
      id: "pt-consult",
      channel: "email",
      name: "Free Consultation Offer",
      subject: "Your free fitness assessment is ready, {{name}} 💪",
      body:
        "Hi {{name}},\n\nI noticed you're focused on {{goal}} — that's exactly what I help clients achieve. I'd love to offer you a complimentary 30-minute assessment where we'll map out a plan tailored to you.\n\nWhat day works best this week?\n\n— Coach {{trainer}}",
    },
    {
      id: "pt-challenge",
      channel: "email",
      name: "6-Week Transformation",
      subject: "Ready for a 6-week transformation, {{name}}?",
      body:
        "Hi {{name}},\n\nMy 6-week transformation program is opening 3 new spots. It's built for {{goal}} and includes custom workouts, nutrition coaching, and weekly check-ins.\n\nWant me to hold a spot for you?\n\n— Coach {{trainer}}",
    },
    {
      id: "pt-sms",
      channel: "sms",
      name: "SMS — Quick Intro",
      body:
        "Hey {{name}}! Coach {{trainer}} here. Saw you're working toward {{goal}} — I've got a free assessment slot open this week. Want it? Reply YES 💪",
    },
  ],
  generateLeads: (count) =>
    buildLeads(count, {
      seedBase: 1010,
      decorate: (rng) => {
        const goal = pick(rng, GOALS);
        const age = pick(rng, AGES);
        return {
          tags: [goal, `Age ${age}`],
          summary: `Looking for a trainer to help with ${goal.toLowerCase()}. Prefers early-morning sessions.`,
          attrs: { goal, age },
        };
      },
    }),
};
