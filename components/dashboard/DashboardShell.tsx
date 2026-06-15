"use client";

import { useMemo, useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Megaphone,
  BarChart3,
  Settings,
  SlidersHorizontal,
  Send,
  Search,
  ChevronLeft,
  CheckCircle2,
  UserRound,
} from "lucide-react";
import type { Lead } from "@/lib/niches/types";
import { getNiche } from "@/lib/niches";
import { useProfile } from "@/lib/profile";
import { Logo } from "@/components/Logo";
import type { FiltersState } from "./types";
import { StatCard } from "./StatCard";
import { LeadCard } from "./LeadCard";
import { FilterSheet } from "./FilterSheet";
import { TemplatePanel } from "./TemplatePanel";
import { LeadDetailSheet } from "./LeadDetailSheet";
import { PipelineBoard } from "./PipelineBoard";
import { CampaignsPanel } from "./CampaignsPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TabId = "dashboard" | "leads" | "pipeline" | "campaigns" | "analytics" | "settings";

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: KanbanSquare },
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
  const { profile, isComplete, ready } = useProfile();

  // ── Single source of truth for all interactive state ──
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({});
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [sendTarget, setSendTarget] = useState<Lead | null>(null);
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Mutable lead store for this niche (CRM state lives here).
  const [leads, setLeads] = useState<Lead[]>(() => niche.generateLeads(24));

  // Keep the open detail sheet in sync with the latest lead data.
  const detailLead = useMemo(
    () => leads.find((l) => l.id === detailLeadId) ?? null,
    [leads, detailLeadId],
  );

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
    return leads.filter((lead) => {
      if (location.trim() && !lead.location.toLowerCase().includes(location.trim().toLowerCase())) {
        return false;
      }
      if (search.trim()) {
        const hay = `${lead.name} ${lead.summary} ${lead.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(search.trim().toLowerCase())) return false;
      }
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
  }, [leads, location, search, filters, niche.filters]);

  // Headline stats as a funnel computed from live lead state.
  const statValues = useMemo(() => {
    const rank: Record<Lead["status"], number> = {
      new: 0,
      qualified: 1,
      contacted: 2,
      converted: 3,
    };
    const atLeast = (s: Lead["status"]) => leads.filter((l) => rank[l.status] >= rank[s]).length;
    return {
      found: leads.length,
      qualified: atLeast("qualified"),
      contacted: atLeast("contacted"),
      converted: atLeast("converted"),
    };
  }, [leads]);

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

  // ── Mutators ──
  const updateLeadStatus = (id: string, status: Lead["status"]) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

  const saveNotes = (id: string, notes: string) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));

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
  const handleViewLead = (lead: Lead) => {
    setDetailLeadId(lead.id);
    setDetailOpen(true);
  };
  const resetFilters = () => {
    setFilters({});
    setLocation("");
  };
  const handleSent = ({ leadId, message }: { leadId: string | null; message: string }) => {
    if (leadId) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId && l.status === "new" ? { ...l, status: "contacted" } : l)),
      );
    }
    setToast(message);
  };

  const NicheIcon = niche.icon;

  const profileInitials = (() => {
    const source = profile.fullName.trim() || profile.businessName.trim();
    if (!source) return "";
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  })();

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
          <LeadCard
            key={lead.id}
            lead={lead}
            niche={niche}
            onContact={handleContact}
            onView={handleViewLead}
          />
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
            {/* Genzic.AI brand mark */}
            <Logo size={36} className="h-9 w-9" />
            <div className="min-w-0">
              <h1 className="flex items-center gap-1.5 truncate text-base font-semibold leading-tight">
                <NicheIcon className="h-3.5 w-3.5 shrink-0 text-niche" />
                {niche.label}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {profile.businessName.trim() || "NicheLead AI"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Profile button — always available, primary entry on mobile */}
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              aria-label="Your profile & settings"
              className={cn(
                "relative grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors lg:hidden",
                activeTab === "settings"
                  ? "border-niche bg-niche/15 text-niche"
                  : "border-border bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {profileInitials ? (
                profileInitials
              ) : (
                <UserRound className="h-4.5 w-4.5" />
              )}
              {ready && !isComplete && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-niche" />
              )}
            </button>

            {/* Desktop tab nav */}
            <nav className="hidden items-center gap-1 lg:flex">
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
        </div>
      </header>

      {/* ── Main ── */}
      <main className="container relative z-10 pb-28 pt-5 lg:pb-12">
        {(activeTab === "dashboard" || activeTab === "leads") && (
          <div className="space-y-5">
            {ready && !isComplete && (
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="flex w-full items-center gap-3 rounded-xl border border-niche/30 bg-niche/[0.06] p-3 text-left transition-colors hover:bg-niche/[0.1]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-niche/15 text-niche">
                  <UserRound className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">Finish setting up your profile</span>
                  <span className="block text-xs text-muted-foreground">
                    Add your name, business & email to auto-personalize every message.
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium text-niche">Set up →</span>
              </button>
            )}

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

        {activeTab === "pipeline" && (
          <PipelineBoard
            niche={niche}
            leads={leads}
            onOpenLead={handleViewLead}
            onAdvance={updateLeadStatus}
          />
        )}
        {activeTab === "campaigns" && (
          <CampaignsPanel niche={niche} onNewCampaign={openTemplatesGeneric} />
        )}
        {activeTab === "analytics" && <AnalyticsPanel niche={niche} leads={leads} />}
        {activeTab === "settings" && <SettingsPanel niche={niche} />}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="pb-safe grid grid-cols-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[9px] font-medium transition-colors",
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
      <LeadDetailSheet
        niche={niche}
        lead={detailLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={updateLeadStatus}
        onSaveNotes={saveNotes}
        onContact={handleContact}
      />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 lg:bottom-6">
          <div className="flex items-center gap-2 rounded-full border border-niche/40 bg-card px-4 py-2.5 text-sm shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-niche" />
            <span className="max-w-[80vw] truncate">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
