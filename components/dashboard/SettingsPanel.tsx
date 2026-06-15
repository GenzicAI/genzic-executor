"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import type { NicheConfig } from "@/lib/niches/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./ProfileForm";

interface SettingsPanelProps {
  niche: NicheConfig;
}

export function SettingsPanel({ niche }: SettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Your profile and workspace for {niche.label}.
        </p>
      </div>

      <ProfileForm />

      {/* Everything is pre-wired through our backend — no setup required. */}
      <Card className="border-niche/30 bg-niche/[0.05]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-niche" />
              Workspace status
            </CardTitle>
            <Badge variant="success">Connected</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your workspace is fully configured. Lead discovery, AI scoring, and email & SMS
            outreach are managed for you by the NicheLead backend — there&apos;s nothing to set
            up or connect.
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-niche">
            <Sparkles className="h-4 w-4" />
            All systems operational
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
