"use client";

import { UserRound, Check } from "lucide-react";
import { useProfile, socialFooter } from "@/lib/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SOCIALS: { key: "instagram" | "tiktok" | "facebook" | "x"; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
  { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
  { key: "facebook", label: "Facebook", placeholder: "Your Page name" },
  { key: "x", label: "X (Twitter)", placeholder: "@yourhandle" },
];

export function ProfileForm() {
  const { profile, setProfile, isComplete } = useProfile();
  const footerPreview = socialFooter(profile);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-4 w-4 text-niche" />
            Your Profile
          </CardTitle>
          {isComplete && (
            <Badge variant="success">
              <Check className="mr-1 h-3 w-3" /> Saved
            </Badge>
          )}
        </div>
        <CardDescription>
          Used to personalize every email & message. Saved on this device automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-name">Full name</Label>
            <Input
              id="pf-name"
              value={profile.fullName}
              onChange={(e) => setProfile({ fullName: e.target.value })}
              placeholder="Jordan Rivera"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-business">Business name</Label>
            <Input
              id="pf-business"
              value={profile.businessName}
              onChange={(e) => setProfile({ businessName: e.target.value })}
              placeholder="Glow Studio"
              autoComplete="organization"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pf-email">Email address</Label>
          <Input
            id="pf-email"
            type="email"
            inputMode="email"
            value={profile.email}
            onChange={(e) => setProfile({ email: e.target.value })}
            placeholder="you@yourbusiness.com"
            autoComplete="email"
          />
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Social handles
          </Label>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {SOCIALS.map((s) => (
              <div key={s.key} className="space-y-1.5">
                <Label htmlFor={`pf-${s.key}`} className="text-xs font-normal text-muted-foreground">
                  {s.label}
                </Label>
                <Input
                  id={`pf-${s.key}`}
                  value={profile[s.key]}
                  onChange={(e) => setProfile({ [s.key]: e.target.value })}
                  placeholder={s.placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {(profile.fullName.trim() || profile.businessName.trim() || profile.email.trim() || footerPreview) && (
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email signature preview
            </p>
            <p className="text-sm">
              {profile.fullName.trim() && (
                <span className="block font-medium">{profile.fullName.trim()}</span>
              )}
              {profile.businessName.trim() && (
                <span className="block text-muted-foreground">{profile.businessName.trim()}</span>
              )}
              {profile.email.trim() && (
                <span className="block text-muted-foreground">{profile.email.trim()}</span>
              )}
              {footerPreview && <span className="block text-muted-foreground">{footerPreview}</span>}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Tokens available in templates:{" "}
          <code className="rounded bg-muted px-1 py-0.5">{"{{name}}"}</code>{" "}
          <code className="rounded bg-muted px-1 py-0.5">{"{{business}}"}</code>{" "}
          <code className="rounded bg-muted px-1 py-0.5">{"{{email}}"}</code>{" "}
          <code className="rounded bg-muted px-1 py-0.5">{"{{instagram}}"}</code>{" "}
          <code className="rounded bg-muted px-1 py-0.5">{"{{tiktok}}"}</code>
        </p>
      </CardContent>
    </Card>
  );
}
