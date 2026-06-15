"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import type { NicheConfig } from "@/lib/niches/types";
import type { FiltersState } from "./types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSheetProps {
  niche: NicheConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  onReset: () => void;
  location: string;
  onLocationChange: (value: string) => void;
  resultCount: number;
}

export function FilterSheet({
  niche,
  open,
  onOpenChange,
  filters,
  onChange,
  onReset,
  location,
  onLocationChange,
  resultCount,
}: FilterSheetProps) {
  const setValue = (id: string, value: string | string[] | number) => {
    onChange({ ...filters, [id]: value });
  };

  const toggleMulti = (id: string, value: string) => {
    const current = Array.isArray(filters[id]) ? (filters[id] as string[]) : [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(id, next);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-niche" />
            Filter Leads
          </SheetTitle>
          <SheetDescription>
            Narrow your {niche.label} feed. Changes apply live.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Location is shared across every niche. */}
          <div className="space-y-2">
            <Label htmlFor="filter-location">Location</Label>
            <Input
              id="filter-location"
              placeholder="City, state or ZIP"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>

          {niche.filters.map((f) => (
            <div key={f.id} className="space-y-3">
              <Label>{f.label}</Label>

              {f.type === "select" && (
                <Select
                  value={(filters[f.id] as string) || ""}
                  onValueChange={(v) => setValue(f.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Any ${f.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {f.type === "multi" && (
                <div className="grid grid-cols-1 gap-2">
                  {f.options?.map((o) => {
                    const selected =
                      Array.isArray(filters[f.id]) &&
                      (filters[f.id] as string[]).includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleMulti(f.id, o.value)}
                        className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                      >
                        <Checkbox checked={selected} className="pointer-events-none" />
                        <span>{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {f.type === "range" && (
                <div className="space-y-2 pt-1">
                  <Slider
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={[(filters[f.id] as number) ?? f.max ?? 0]}
                    onValueChange={(v) => setValue(f.id, v[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    Within{" "}
                    <span className="font-medium text-foreground">
                      {(filters[f.id] as number) ?? f.max} {f.unit}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <SheetFooter className="flex-row gap-3 border-t border-border p-5">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="niche" className="flex-1" onClick={() => onOpenChange(false)}>
            Show {resultCount} {resultCount === 1 ? "lead" : "leads"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
