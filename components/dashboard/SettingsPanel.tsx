"use client";

import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import type { NicheConfig } from "@/lib/niches/types";
import { integrationStatus } from "@/lib/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./ProfileForm";

interface SettingsPanelProps {
  niche: NicheConfig;
}

const INTEGRATIONS: {
  key: keyof ReturnType<typeof integrationStatus>;
  name: string;
  role: string;
  env: string;
}[] = [
  { key: "supabase", name: "Supabase", role: "Database & auth", env: "NEXT_PUBLIC_SUPABASE_URL" },
  { key: "zapier", name: "Zapier", role: "Automation hub (email + SMS fan-out)", env: "NEXT_PUBLIC_ZAPIER_CATCH_HOOK_URL" },
  { key: "abacus", name: "Abacus.AI", role: "AI lead scoring & enrichment", env: "ABACUS_AI_API_KEY" },
  { key: "resend", name: "Resend", role: "Transactional email", env: "RESEND_API_KEY" },
  { key: "twilio", name: "Twilio", role: "SMS outreach", env: "TWILIO_ACCOUNT_SID" },
  { key: "tawkto", name: "Tawk.to", role: "Live chat widget", env: "NEXT_PUBLIC_TAWKTO_PROPERTY_ID" },
];

export function SettingsPanel({ niche }: SettingsPanelProps) {
  const status = integrationStatus();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Profile, integrations, and workspace configuration for your {niche.label} workspace.
        </p>
      </div>

      <ProfileForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {INTEGRATIONS.map((it, i) => {
            const connected = status[it.key];
            return (
              <div key={it.key}>
                {i > 0 && <Separator className="my-1" />}
                <div className="flex items-center gap-3 py-2.5">
                  {connected ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-niche" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{it.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{it.role}</p>
                  </div>
                  <Badge variant={connected ? "success" : "outline"}>
                    {connected ? "Connected" : "Placeholder"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How automation works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            NicheLead AI keeps automation simple: all outbound actions POST to one Zapier Catch
            Hook. From there, Zapier routes to Resend for email, Twilio for SMS, and writes the lead
            into your CRM. Set <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_ZAPIER_CATCH_HOOK_URL</code> to go live.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://zapier.com/apps/webhook/integrations" target="_blank" rel="noreferrer">
              Open Zapier <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
