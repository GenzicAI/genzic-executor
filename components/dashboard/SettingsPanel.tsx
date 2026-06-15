"use client";

import { ShieldCheck, Sparkles, MessageCircle, Info, CheckCircle2 } from "lucide-react";
import type { NicheConfig } from "@/lib/niches/types";
import { useChatSettings, isValidTawkPropertyId } from "@/lib/chat-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProfileForm } from "./ProfileForm";

interface SettingsPanelProps {
  niche: NicheConfig;
}

export function SettingsPanel({ niche }: SettingsPanelProps) {
  const { chat, setChat } = useChatSettings();
  const idValid = isValidTawkPropertyId(chat.tawkPropertyId);
  const live = chat.enabled && idValid;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Your profile and workspace for {niche.label}.
        </p>
      </div>

      <ProfileForm />

      {/* ── Live Chat Integration (Tawk.to) ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4 text-niche" />
              Live Chat Integration
            </CardTitle>
            <Badge variant={live ? "success" : "outline"}>{live ? "Live" : "Off"}</Badge>
          </div>
          <CardDescription>Add a Tawk.to live-chat widget to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <Label htmlFor="tawk-enabled" className="text-sm font-medium">
                Enable live chat widget
              </Label>
              <p className="text-xs text-muted-foreground">
                Shows the chat bubble in the bottom-right corner.
              </p>
            </div>
            <Switch
              id="tawk-enabled"
              checked={chat.enabled}
              onCheckedChange={(v) => setChat({ enabled: v })}
              aria-label="Enable live chat widget"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tawk-property">Tawk.to Property ID</Label>
            <Input
              id="tawk-property"
              value={chat.tawkPropertyId}
              onChange={(e) => setChat({ tawkPropertyId: e.target.value.trim() })}
              placeholder="e.g. 5f9a1b2c3d4e5f6a7b8c9d0e"
              spellCheck={false}
            />
            {chat.tawkPropertyId.trim() && !idValid && (
              <p className="text-xs text-amber-400">
                That doesn&apos;t look like a valid Property ID — copy it from your Tawk.to widget
                code.
              </p>
            )}
            {chat.enabled && idValid && (
              <p className="flex items-center gap-1 text-xs text-niche">
                <CheckCircle2 className="h-3.5 w-3.5" /> Widget active on all dashboard pages.
              </p>
            )}
          </div>

          {/* Optional widget id — defaults to "default" when blank */}
          <div className="space-y-2">
            <Label htmlFor="tawk-widget">
              Widget ID <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="tawk-widget"
              value={chat.tawkWidgetId}
              onChange={(e) => setChat({ tawkWidgetId: e.target.value.trim() })}
              placeholder="default"
              spellCheck={false}
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-niche/30 bg-niche/[0.06] p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-niche" />
            <p className="text-xs text-muted-foreground">
              Leads do not need a Tawk.to account. This widget will appear on your own website for
              live chat.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Everything else is pre-wired through our backend — no setup required. */}
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
