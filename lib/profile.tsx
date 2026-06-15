"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Profile {
  fullName: string;
  businessName: string;
  email: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  x: string;
}

export const EMPTY_PROFILE: Profile = {
  fullName: "",
  businessName: "",
  email: "",
  instagram: "",
  tiktok: "",
  facebook: "",
  x: "",
};

const STORAGE_KEY = "nichelead.profile";

interface ProfileContextValue {
  profile: Profile;
  setProfile: (patch: Partial<Profile>) => void;
  /** True once at least name or business is filled in. */
  isComplete: boolean;
  /** Hydrated from localStorage yet? Avoids a flash of empty inputs. */
  ready: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);
  const [ready, setReady] = useState(false);

  // Load once on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfileState({ ...EMPTY_PROFILE, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  const setProfile = (patch: Partial<Profile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage may be unavailable (private mode) — keep in-memory state
      }
      return next;
    });
  };

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      setProfile,
      ready,
      // "Complete" means the essentials are filled, so the finish-profile
      // prompt persists until name, business, and email are all set.
      isComplete: Boolean(
        profile.fullName.trim() && profile.businessName.trim() && profile.email.trim(),
      ),
    }),
    [profile, ready],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}

/** First name, for friendly sign-offs. */
export function firstName(p: Profile) {
  return p.fullName.trim().split(/\s+/)[0] ?? "";
}

/** Normalizes a handle to a leading-@ form for IG / TikTok / X. */
function at(handle: string) {
  const h = handle.trim().replace(/^@+/, "");
  return h ? `@${h}` : "";
}

/** A compact "follow us" footer built from whichever handles are filled in. */
export function socialFooter(p: Profile): string {
  const parts: string[] = [];
  if (p.instagram.trim()) parts.push(`Instagram ${at(p.instagram)}`);
  if (p.tiktok.trim()) parts.push(`TikTok ${at(p.tiktok)}`);
  if (p.facebook.trim()) parts.push(`Facebook ${p.facebook.trim()}`);
  if (p.x.trim()) parts.push(`X ${at(p.x)}`);
  return parts.join("  ·  ");
}

/** Token map merged into template hydration so {{business}}, {{instagram}}, … resolve. */
export function profileTokens(p: Profile): Record<string, string> {
  return {
    business: p.businessName.trim(),
    email: p.email.trim(),
    instagram: at(p.instagram),
    tiktok: at(p.tiktok),
    facebook: p.facebook.trim(),
    x: at(p.x),
  };
}
