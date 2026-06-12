"use client";

import { TrendingUp, Target, Sparkles } from "lucide-react";
import type { Lead, NicheConfig } from "@/lib/niches/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seeded } from "@/lib/utils";

interface AnalyticsPanelProps {
  niche: NicheConfig;
  leads: Lead[];
}

export function AnalyticsPanel({ niche, leads }: AnalyticsPanelProps) {
  const rng = seeded(niche.id.length * 53 + 11);
  const weeks = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const series = weeks.map((d) => ({ d, v: Math.round(20 + rng() * 80) }));
  const maxV = Math.max(...series.map((s) => s.v));

  const avgScore = leads.length
    ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length)
    : 0;
  const hot = leads.filter((l) => l.score >= 85).length;
  const conversion = leads.length ? Math.round((hot / leads.length) * 100) : 0;

  const cards = [
    { label: "Avg AI Score", value: avgScore, icon: Sparkles },
    { label: "Hot Leads (85+)", value: hot, icon: Target },
    { label: "Qualify Rate", value: `${conversion}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Lead quality and pipeline performance for {niche.label}.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-4">
              <Icon className="h-4 w-4 text-niche" />
              <p className="mt-2 text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads discovered this week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-44 items-end gap-2">
            {series.map((s) => (
              <div key={s.d} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-niche/80 transition-all"
                    style={{ height: `${(s.v / maxV) * 100}%` }}
                    title={`${s.v} leads`}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{s.d}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "85-100 · Hot", min: 85, max: 100, cls: "bg-niche" },
            { label: "70-84 · Warm", min: 70, max: 84, cls: "bg-amber-400" },
            { label: "Below 70 · Nurture", min: 0, max: 69, cls: "bg-muted-foreground/60" },
          ].map((band) => {
            const n = leads.filter((l) => l.score >= band.min && l.score <= band.max).length;
            const pct = leads.length ? Math.round((n / leads.length) * 100) : 0;
            return (
              <div key={band.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{band.label}</span>
                  <span className="font-medium">{n} ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${band.cls}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
