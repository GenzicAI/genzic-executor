# NicheLead AI

AI-powered, niche-specific lead generation by **Genzic.AI**. Pick an industry and
get a dashboard purpose-built for how that business finds, scores, and closes leads.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase**.

> The legacy `index.html` (Genzic Autonomous Execution Dashboard) is kept at the
> repo root for reference and is not part of the Next.js app.

## Niches (MVP)

| Niche | Accent | Highlights |
| --- | --- | --- |
| 🏋️ Personal Trainer | green | Goal/age/distance filters, consultation templates |
| ✨ Esthetician | pink | Skin-concern/service filters, client photos, booking templates |
| 🏠 Roofing Contractor | orange | Damage/urgency filters, property photos, inspection + insurance templates |
| 🔑 Realtor | blue | Buy/sell/land intent, budget/timeline filters, valuation templates |

## Core features

- **Industry Selector** — first screen, 4 niches + links to genzic.ai & tanxusa.com.
- **Dynamic dashboards** — stats, filters, lead feed, and templates all driven per niche.
- **Lead discovery & AI scoring** — scored, sortable, filterable lead feed.
- **Automated outreach** — email & SMS templates with live token personalization.
- **Simple CRM & analytics** — campaigns, score distribution, weekly trends.
- **Fully responsive** — desktop tab nav + mobile bottom nav with iOS safe-area support.

## Architecture — built to scale to 30+ niches

Everything niche-specific lives in [`lib/niches`](lib/niches). Each niche is a single
`NicheConfig` object (stats, filters, templates, lead generator). To add a niche:

1. Create `lib/niches/<niche>.ts` exporting a `NicheConfig`.
2. Add it to the array in [`lib/niches/index.ts`](lib/niches/index.ts).

That's it — the selector, routing (`/dashboard/[niche]`), dashboard, filters, and
templates all read from the registry.

## Integrations (placeholders)

The UI is fully functional on mock data. Real side-effects are wired through
environment variables (see [`.env.example`](.env.example)):

- **Supabase** — database + auth ([`supabase/schema.sql`](supabase/schema.sql))
- **Zapier (only)** — single Catch Hook fans out to email + SMS + CRM
- **Abacus.AI** — lead scoring / enrichment
- **Resend** — email · **Twilio** — SMS (both invoked via Zapier)
- **Tawk.to** — live chat widget

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — runs on mock data without it
npm run dev                  # http://localhost:3000
```

## Deploy

Push to GitHub and import into **Vercel**. Add the env vars from `.env.example`
in the Vercel project settings, then deploy.

---

_Powered by TanXUSA · Built for 10X Execution._
