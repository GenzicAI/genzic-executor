"use client";

import { useMemo, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  SlidersHorizontal,
  Send,
  Search,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import type { Lead } from "@/lib/niches/types";
import { getNiche } from "@/lib/niches";
import type { FiltersState } from "./types";
import { StatCard } from "./StatCard";
import { LeadCard } from "./LeadCard";
import { FilterSheet } from "./FilterSheet";
import { TemplatePanel } from "./TemplatePanel";
import { CampaignsPanel } from "./CampaignsPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TabId = "dashboard" | "leads" | "campaigns" | "analytics" | "settings";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

interface DashboardShellProps {
  /** Niche id; the full config (icons + generators) is resolved client-side. */
  nicheId: string;
}

export function DashboardShell({ nicheId }: DashboardShellProps) {
  const niche = getNiche(nicheId)!;

  // ── Single source of truth for all interactive state ──
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({});
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [sendTarget, setSendTarget] = useState<Lead | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set());

  // Stable mock feed for this niche.
  const allLeads = useMemo(() => niche.generateLeads(24), [niche]);

  // Reset transient state whenever the niche changes (defensive — the page
  // remounts per niche, but this keeps the component correct if reused).
  useEffect(() => {
    setFilters({});
    setLocation("");
    setSearch("");
    setActiveTab("dashboard");
    setContactedIds(new Set());
  }, [niche.id]);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const activeFilterCount = useMemo(() => {
    let n = location.trim() ? 1 : 0;
    for (const f of niche.filters) {
      const v = filters[f.id];
      if (Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "") n++;
    }
    return n;
  }, [filters, location, niche.filters]);

  const filteredLeads = useMemo(() => {
    const decorated = allLeads.map((l) =>
      contactedIds.has(l.id) && l.status === "new"
        ? { ...l, status: "contacted" as const }
        : l,
    );
    return decorated.filter((lead) => {
      // Location (substring match on city/state).
      if (location.trim() && !lead.location.toLowerCase().includes(location.trim().toLowerCase())) {
        return false;
      }
      // Free-text search across name, summary and tags.
      if (search.trim()) {
        const hay = `${lead.name} ${lead.summary} ${lead.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(search.trim().toLowerCase())) return false;
      }
      // Niche filters (select + multi apply against lead.attrs; range is informational).
      for (const f of niche.filters) {
        const v = filters[f.id];
        if (f.type === "select" && typeof v === "string" && v) {
          if (String(lead.attrs[f.id]) !== v) return false;
        }
        if (f.type === "multi" && Array.isArray(v) && v.length > 0) {
          if (!v.includes(String(lead.attrs[f.id]))) return false;
        }
      }
      return true;
    });
  }, [allLeads, contactedIds, location, search, filters, niche.filters]);

  // Headline stats computed from the full feed.
  const statValues = useMemo(() => {
    const found = allLeads.length;
    const qualified = allLeads.filter((l) => l.status === "qualified").length;
    const contacted =
      allLeads.filter((l) => l.status === "contacted").length + contactedIds.size;
    const converted = allLeads.filter((l) => l.status === "converted").length;
    return { found, qualified, contacted, converted };
  }, [allLeads, contactedIds]);

  const valueForStat = (kind: string, fallback?: number) => {
    switch (kind) {
      case "leads":
        return statValues.found;
      case "qualified":
        return statValues.qualified;
      case "contacted":
        return statValues.contacted;
      case "converted":
        return statValues.converted;
      default:
        return fallback ?? 0;
    }
  };

  // ── Handlers (explicit & stable) ──
  const openFiltersSheet = () => setFilterOpen(true);
  const openTemplatesGeneric = () => {
    setSendTarget(null);
    setTplOpen(true);
  };
  const handleContact = (lead: Lead) => {
    setSendTarget(lead);
    setTplOpen(true);
  };
  const resetFilters = () => {
    setFilters({});
    setLocation("");
  };
  const handleSent = ({ leadId, message }: { leadId: string | null; message: string }) => {
    if (leadId) {
      setContactedIds((prev) => new Set(prev).add(leadId));
    }
    setToast(message);
  };

  const NicheIcon = niche.icon;

  const rootStyle = {
    "--niche": niche.accent,
    "--niche-foreground": "240 10% 6%",
  } as CSSProperties;

  const leadFeed = (
    <div className="space-y-3">
      {filteredLeads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">No leads match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try widening your criteria.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        filteredLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} niche={niche} onContact={handleContact} />
        ))
      )}
    </div>
  );

  return (
    <div style={rootStyle} className="min-h-dvh bg-background">
      {/* Ambient niche glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 niche-gradient" />

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/" aria-label="Back to industry selector">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-niche/15 text-niche">
              <NicheIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-tight">{niche.label}</h1>
              <p className="truncate text-xs text-muted-foreground">NicheLead AI</p>
            </div>
          </div>

          {/* Desktop tab nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === t.id
                      ? "bg-niche/15 text-niche"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="container relative z-10 pb-28 pt-5 md:pb-12">
        {(activeTab === "dashboard" || activeTab === "leads") && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {activeTab === "dashboard" ? "Overview" : "Lead Feed"}
              </h2>
              <p className="text-sm text-muted-foreground">{niche.tagline}</p>
            </div>

            {activeTab === "dashboard" && (
              <div
                className={cn(
                  "grid gap-3",
                  niche.stats.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4",
                )}
              >
                {niche.stats.map((s) => (
                  <StatCard key={s.id} stat={s} value={valueForStat(s.kind, s.value)} />
                ))}
              </div>
            )}

            {/* Toolbar: search + filters + templates */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search leads…"
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={openFiltersSheet} className="relative">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeFilterCount > 0 && (
                  <Badge variant="niche" className="ml-1 px-1.5 py-0">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <Button variant="niche" onClick={openTemplatesGeneric}>
                <Send className="h-4 w-4" /> Templates
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
                {activeFilterCount > 0 ? " (filtered)" : ""}
              </span>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-niche hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {leadFeed}
          </div>
        )}

        {activeTab === "campaigns" && (
          <CampaignsPanel niche={niche} onNewCampaign={openTemplatesGeneric} />
        )}
        {activeTab === "analytics" && <AnalyticsPanel niche={niche} leads={allLeads} />}
        {activeTab === "settings" && <SettingsPanel niche={niche} />}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="pb-safe grid grid-cols-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-niche" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Controlled overlays (always mounted; visibility driven by state) ── */}
      <FilterSheet
        niche={niche}
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        location={location}
        onLocationChange={setLocation}
        resultCount={filteredLeads.length}
      />
      <TemplatePanel
        niche={niche}
        open={tplOpen}
        onOpenChange={setTplOpen}
        lead={sendTarget}
        onSent={handleSent}
      />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:bottom-6">
          <div className="flex items-center gap-2 rounded-full border border-niche/40 bg-card px-4 py-2.5 text-sm shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-niche" />
            <span className="max-w-[80vw] truncate">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
