"use client";

import { Mail, MessageSquare, Plus, Play, Pause, Zap } from "lucide-react";
import type { NicheConfig } from "@/lib/niches/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { seeded } from "@/lib/utils";

interface CampaignsPanelProps {
  niche: NicheConfig;
  onNewCampaign: () => void;
}

export function CampaignsPanel({ niche, onNewCampaign }: CampaignsPanelProps) {
  const rng = seeded(niche.id.length * 137 + 7);
  const campaigns = niche.templates.map((t, i) => {
    const sent = Math.round(120 + rng() * 480);
    const replyRate = Math.round(8 + rng() * 26);
    const running = i % 2 === 0;
    return { t, sent, replyRate, running };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Automated outreach sequences, powered by Zapier.
          </p>
        </div>
        <Button variant="niche" size="sm" onClick={onNewCampaign}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <Card className="border-niche/30 bg-niche/5">
        <CardContent className="flex items-center gap-3 p-4">
          <Zap className="h-5 w-5 text-niche" />
          <p className="text-sm">
            Outreach is fully automated — every campaign sends email & SMS for you through the
            NicheLead backend. Just write your message and hit send.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {campaigns.map(({ t, sent, replyRate, running }) => (
          <Card key={t.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  {t.channel === "email" ? (
                    <Mail className="h-4 w-4 text-niche" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-niche" />
                  )}
                  {t.name}
                </CardTitle>
                <Badge variant={running ? "success" : "outline"}>
                  {running ? "Active" : "Paused"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sent</span>
                <span className="font-medium">{sent.toLocaleString()}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reply rate</span>
                  <span className="font-medium text-niche">{replyRate}%</span>
                </div>
                <Progress value={replyRate} />
              </div>
              <Button size="sm" variant="outline" className="w-full">
                {running ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
