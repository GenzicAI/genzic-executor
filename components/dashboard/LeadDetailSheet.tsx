"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Sparkles, Send, Save, Check } from "lucide-react";
import type { Lead, NicheConfig } from "@/lib/niches/types";
import { scoreBreakdown, scoreTier } from "@/lib/scoring";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const STATUS_FLOW: Lead["status"][] = ["new", "qualified", "contacted", "converted"];
const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "New",
  qualified: "Qualified",
  contacted: "Contacted",
  converted: "Converted",
};

interface LeadDetailSheetProps {
  niche: NicheConfig;
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: Lead["status"]) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onContact: (lead: Lead) => void;
}

export function LeadDetailSheet({
  niche,
  lead,
  open,
  onOpenChange,
  onStatusChange,
  onSaveNotes,
  onContact,
}: LeadDetailSheetProps) {
  const [notes, setNotes] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setNotes(lead?.notes ?? "");
    setSavedFlash(false);
  }, [lead]);

  if (!lead) return null;
  const tier = scoreTier(lead.score);
  const factors = scoreBreakdown(lead);

  const handleSave = () => {
    onSaveNotes(lead.id, notes);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle>Lead profile</SheetTitle>
          <SheetDescription>{niche.label} pipeline</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={lead.avatar} alt={lead.name} />
              <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold">{lead.name}</h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {lead.location}
                <span className="mx-1">·</span>
                <Clock className="h-3.5 w-3.5" /> {lead.createdAgo}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className={cn("h-5 w-5", tier.tone)} />
                <span className={cn("text-2xl font-bold", tier.tone)}>{lead.score}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <Badge variant="niche">{tier.label}</Badge>
            </div>
            <Separator className="my-3" />
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              AI score factors
            </p>
            <div className="space-y-2">
              {factors.map((f) => (
                <div key={f.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className={f.positive ? "text-niche" : "text-muted-foreground"}>
                      {f.weight}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full", f.positive ? "bg-niche" : "bg-muted-foreground/50")}
                      style={{ width: `${f.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + attributes */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Summary</Label>
            <p className="mt-1.5 text-sm">{lead.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lead.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[11px]">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pipeline stage */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Pipeline stage
            </Label>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(lead.id, s)}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                    lead.status === s
                      ? "border-niche bg-niche/15 text-niche"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="lead-notes" className="text-xs uppercase tracking-wide text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context, call outcomes, follow-up reminders…"
              className="min-h-[100px]"
            />
            <Button size="sm" variant="outline" onClick={handleSave}>
              {savedFlash ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {savedFlash ? "Saved" : "Save notes"}
            </Button>
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 border-t border-border p-5">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="niche"
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              onContact(lead);
            }}
          >
            <Send className="h-4 w-4" /> Contact
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
