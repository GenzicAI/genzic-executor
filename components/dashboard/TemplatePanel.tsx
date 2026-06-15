"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, Send, Loader2, Check, Copy } from "lucide-react";
import type { NicheConfig, Lead, TemplateDef } from "@/lib/niches/types";
import { dispatchOutreach } from "@/lib/integrations";
import {
  useProfile,
  firstName,
  profileTokens,
  socialFooter,
  type Profile,
} from "@/lib/profile";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TemplatePanelProps {
  niche: NicheConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lead the outreach is aimed at; null = generic preview. */
  lead: Lead | null;
  onSent: (result: { leadId: string | null; channel: string; message: string }) => void;
}

/**
 * Fills {{token}} placeholders from the lead + the user's profile.
 * Sender tokens ({{trainer}}, {{agent}}, {{company}}, {{business}}, …) and
 * social handles ({{instagram}}, …) come from the profile so every message is
 * personalized; lead attributes ({{goal}}, {{concern}}, …) come from the lead.
 */
function hydrate(text: string, lead: Lead | null, profile: Profile) {
  // Use the user's complete name in sign-offs so nothing is dropped.
  const senderName = profile.fullName.trim();
  const business = profile.businessName.trim();
  const map: Record<string, string> = {
    name: lead?.name?.split(" ")[0] ?? "there",
    // Sender name tokens used across niches all resolve to the user's full name.
    trainer: senderName || "Alex",
    esthetician: senderName || "Jordan",
    agent: senderName || "Sam",
    sender: senderName || "your coach",
    firstName: firstName(profile) || senderName,
    // Business name tokens.
    company: business || "Apex",
    ...profileTokens(profile),
    business: business || "our team",
    // Lead-derived attributes.
    goal: String(lead?.attrs?.goal ?? "your goals"),
    concern: String(lead?.attrs?.concern ?? "your skin concerns"),
    service: String(lead?.attrs?.service ?? "treatment"),
    damage: String(lead?.attrs?.damage ?? "roof damage"),
    property: String(lead?.attrs?.property ?? "home"),
    intent: String(lead?.attrs?.intent ?? "your move"),
    budget: String(lead?.attrs?.budget ?? "your budget"),
    timeline: String(lead?.attrs?.timeline ?? "your timeline"),
  };
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => map[k] ?? `{{${k}}}`);
}

/**
 * Appends a business + social-handle footer to email bodies, using whichever
 * profile fields are filled in. SMS stays short, so it is skipped there.
 */
function withSignature(body: string, channel: "email" | "sms", profile: Profile) {
  if (channel !== "email") return body;
  const footer = socialFooter(profile);
  const business = profile.businessName.trim();
  const email = profile.email.trim();
  const lines: string[] = [];
  if (business) lines.push(business);
  if (email) lines.push(email);
  if (footer) lines.push(footer);
  return lines.length ? `${body}\n\n${lines.join("\n")}` : body;
}

export function TemplatePanel({
  niche,
  open,
  onOpenChange,
  lead,
  onSent,
}: TemplatePanelProps) {
  const { profile, isComplete } = useProfile();
  const [activeId, setActiveId] = useState<string>(niche.templates[0]?.id ?? "");
  const active: TemplateDef | undefined = useMemo(
    () => niche.templates.find((t) => t.id === activeId) ?? niche.templates[0],
    [niche.templates, activeId],
  );

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Re-hydrate the editor whenever the template, target lead, niche, or the
  // user's profile changes — so personalization stays in sync.
  useEffect(() => {
    if (!active) return;
    setSubject(active.subject ? hydrate(active.subject, lead, profile) : "");
    setBody(withSignature(hydrate(active.body, lead, profile), active.channel, profile));
    setSent(false);
  }, [active, lead, profile]);

  // Reset to the first template each time the niche changes.
  useEffect(() => {
    setActiveId(niche.templates[0]?.id ?? "");
  }, [niche.id, niche.templates]);

  const handleCopy = async () => {
    if (!active) return;
    const text =
      active.channel === "email" && subject ? `Subject: ${subject}\n\n${body}` : body;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without async clipboard access.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleSend = async () => {
    if (!active) return;
    setSending(true);
    const result = await dispatchOutreach({
      channel: active.channel,
      niche: niche.id,
      leadId: lead?.id ?? "broadcast",
      leadName: lead?.name ?? "your list",
      subject: active.channel === "email" ? subject : undefined,
      body,
      templateId: active.id,
    });
    setSending(false);
    setSent(true);
    onSent({ leadId: lead?.id ?? null, channel: active.channel, message: result.message });
    setTimeout(() => onOpenChange(false), 900);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-niche" />
            Outreach Templates
          </SheetTitle>
          <SheetDescription>
            {lead ? (
              <>
                Reaching out to <span className="font-medium text-foreground">{lead.name}</span>
              </>
            ) : (
              <>Pick a template and personalize before sending.</>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {!isComplete && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Tip: add your name, business, and social handles in{" "}
              <span className="font-semibold">Settings → Your Profile</span> to auto-fill these
              messages.
            </div>
          )}

          {/* Template chooser */}
          <div className="flex flex-wrap gap-2">
            {niche.templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  t.id === activeId
                    ? "border-niche bg-niche/15 text-niche"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {t.channel === "email" ? (
                  <Mail className="h-3.5 w-3.5" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                {t.name}
              </button>
            ))}
          </div>

          {active && (
            <>
              <Badge variant="niche" className="uppercase tracking-wide">
                {active.channel === "email" ? "Email" : "SMS"}
              </Badge>

              {active.channel === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="tpl-subject">Subject</Label>
                  <Input
                    id="tpl-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tpl-body">Message</Label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-niche" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <Textarea
                  id="tpl-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[220px] font-[450] leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  {active.channel === "sms"
                    ? `${body.length} characters · ~${Math.max(1, Math.ceil(body.length / 160))} SMS segment(s)`
                    : "Tokens like {{name}} are auto-filled per lead at send time."}
                </p>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-row gap-3 border-t border-border p-5">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="niche"
            className="flex-1"
            onClick={handleSend}
            disabled={sending || sent || !active}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : sent ? (
              <>
                <Check className="h-4 w-4" /> Sent!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {active?.channel === "sms" ? "Send SMS" : "Send Email"}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
