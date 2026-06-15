"use client";

import { MapPin, Send, Sparkles, Clock } from "lucide-react";
import type { Lead, NicheConfig } from "@/lib/niches/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: Lead;
  niche: NicheConfig;
  onContact: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

const STATUS_STYLE: Record<Lead["status"], { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-sky-500/15 text-sky-400" },
  qualified: { label: "Qualified", cls: "bg-niche/15 text-niche" },
  contacted: { label: "Contacted", cls: "bg-amber-500/15 text-amber-400" },
  converted: { label: "Converted", cls: "bg-violet-500/15 text-violet-400" },
};

function scoreColor(score: number) {
  if (score >= 85) return "text-niche";
  if (score >= 70) return "text-amber-400";
  return "text-muted-foreground";
}

export function LeadCard({ lead, niche, onContact, onView }: LeadCardProps) {
  const status = STATUS_STYLE[lead.status];

  return (
    <Card className="overflow-hidden transition-colors hover:border-niche/40">
      <div className="flex gap-4 p-4">
        {niche.showLeadImage && lead.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lead.image}
            alt=""
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
          />
        ) : (
          <Avatar className="h-14 w-14">
            <AvatarImage src={lead.avatar} alt={lead.name} />
            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">{lead.name}</h3>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", status.cls)}>
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {lead.location}
                <span className="mx-1">·</span>
                <Clock className="h-3 w-3" /> {lead.createdAgo}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <div className={cn("flex items-center gap-1 text-lg font-bold", scoreColor(lead.score))}>
                <Sparkles className="h-4 w-4" />
                {lead.score}
              </div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">AI Score</p>
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{lead.summary}</p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {lead.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-[11px]">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
        <Button
          size="sm"
          variant="niche"
          className="flex-1"
          onClick={() => onContact(lead)}
        >
          <Send className="h-4 w-4" /> Contact
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(lead)}>
          View profile
        </Button>
      </div>
    </Card>
  );
}
