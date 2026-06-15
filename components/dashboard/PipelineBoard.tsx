"use client";

import { Sparkles, ChevronRight, MapPin } from "lucide-react";
import type { Lead, NicheConfig } from "@/lib/niches/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COLUMNS: { id: Lead["status"]; label: string; accent: string }[] = [
  { id: "new", label: "New", accent: "bg-sky-500/15 text-sky-400" },
  { id: "qualified", label: "Qualified", accent: "bg-niche/15 text-niche" },
  { id: "contacted", label: "Contacted", accent: "bg-amber-500/15 text-amber-400" },
  { id: "converted", label: "Converted", accent: "bg-violet-500/15 text-violet-400" },
];

const NEXT: Record<Lead["status"], Lead["status"] | null> = {
  new: "qualified",
  qualified: "contacted",
  contacted: "converted",
  converted: null,
};

interface PipelineBoardProps {
  niche: NicheConfig;
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onAdvance: (id: string, status: Lead["status"]) => void;
}

export function PipelineBoard({ niche, leads, onOpenLead, onAdvance }: PipelineBoardProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          Move {niche.label} leads through your sales stages. Tap a card for details.
        </p>
      </div>

      {/* Horizontal scroll on mobile, 4 columns on desktop */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {COLUMNS.map((col) => {
          const items = leads.filter((l) => l.status === col.id);
          return (
            <div key={col.id} className="w-[80vw] shrink-0 sm:w-72 md:w-auto">
              <div className="mb-2 flex items-center justify-between">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", col.accent)}>
                  {col.label}
                </span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                    No leads
                  </div>
                )}
                {items.map((lead) => {
                  const next = NEXT[lead.status];
                  return (
                    <Card key={lead.id} className="p-3">
                      <button
                        type="button"
                        onClick={() => onOpenLead(lead)}
                        className="block w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">{lead.name}</span>
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-niche">
                            <Sparkles className="h-3 w-3" />
                            {lead.score}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {lead.location}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {lead.tags.slice(0, 2).map((t) => (
                            <Badge key={t} variant="outline" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </button>
                      {next && (
                        <button
                          type="button"
                          onClick={() => onAdvance(lead.id, next)}
                          className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          Move to {COLUMNS.find((c) => c.id === next)?.label}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
