import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IndustryPicker } from "@/components/IndustryPicker";
import { Logo } from "@/components/Logo";

export default function IndustrySelectorPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(120%_120%_at_50%_0%,hsl(152_100%_39%/0.18)_0%,transparent_55%)]" />

      <div className="container relative z-10 flex min-h-dvh flex-col py-10">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 text-base font-semibold">
          <Logo size={40} className="h-10 w-10 drop-shadow-lg" />
          <span className="text-muted-foreground">Genzic.AI</span>
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

        {/* Industry selector — a single dropdown that scales to 30+ niches */}
        <section className="mx-auto mt-10 w-full max-w-md flex-1">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Choose your industry
          </h2>
          <IndustryPicker />
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
              Visit TanXUSA.com <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </footer>
      </div>
    </main>
  );
}
