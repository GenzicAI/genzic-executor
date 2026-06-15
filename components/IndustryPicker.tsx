"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { NICHES, getNiche } from "@/lib/niches";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Industry picker as a single dropdown. Reads straight from the niche
 * registry, so adding a 5th–30th niche needs no change here.
 */
export function IndustryPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("");
  const niche = selected ? getNiche(selected) : undefined;

  const go = () => {
    if (selected) router.push(`/dashboard/${selected}`);
  };

  return (
    <div className="space-y-4">
      <div
        style={niche ? ({ ["--niche" as string]: niche.accent } as React.CSSProperties) : undefined}
      >
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="h-14 text-base" aria-label="Choose your industry">
            <SelectValue placeholder="Select your industry…" />
          </SelectTrigger>
          <SelectContent>
            {NICHES.map((n) => (
              <SelectItem key={n.id} value={n.id} className="py-2.5 text-base">
                <span className="flex items-center gap-2.5">
                  <span className="text-lg">{n.emoji}</span>
                  {n.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {niche && (
          <p className="mt-2 px-1 text-sm text-muted-foreground">{niche.tagline}</p>
        )}
      </div>

      <Button
        onClick={go}
        disabled={!selected}
        size="lg"
        className="w-full"
        variant={niche ? "niche" : "default"}
      >
        Open dashboard
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
