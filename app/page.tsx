import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { NICHES } from "@/lib/niches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function IndustrySelectorPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(120%_120%_at_50%_0%,hsl(152_100%_39%/0.18)_0%,transparent_55%)]" />

      <div className="container relative z-10 flex min-h-dvh flex-col py-10">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Genzic.AI
        </div>

        {/* Hero */}
        <header className="mx-auto mt-8 max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            AI-Powered Lead Generation
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            NicheLead AI
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground sm:text-lg">
            Pick your industry to launch a dashboard built for how you actually find,
            score, and close leads.
          </p>
        </header>

        {/* Industry selector */}
        <section className="mx-auto mt-10 w-full max-w-3xl flex-1">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Choose your industry
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {NICHES.map((niche) => {
              const Icon = niche.icon;
              return (
                <Link
                  key={niche.id}
                  href={`/dashboard/${niche.id}`}
                  className="group focus:outline-none"
                  style={{ ["--niche" as string]: niche.accent }}
                >
                  <Card className="relative h-full overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-niche/50 group-focus-visible:ring-2 group-focus-visible:ring-niche">
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-niche/15 text-2xl">
                        {niche.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-niche" />
                          <h3 className="font-semibold">{niche.label}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{niche.tagline}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-niche" />
                    </div>
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-niche/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  </Card>
                </Link>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            More niches coming soon — the platform is built to scale to 30+ industries.
          </p>
        </section>

        {/* Footer CTAs */}
        <footer className="mx-auto mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="flex-1">
            <a href="https://genzic.ai" target="_blank" rel="noreferrer">
              Visit Genzic.AI <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1">
            <a href="https://tanxusa.com/" target="_blank" rel="noreferrer">
              Visit TanXUSA <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </footer>
      </div>
    </main>
  );
}
