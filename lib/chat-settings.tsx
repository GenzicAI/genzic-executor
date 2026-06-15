"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Live-chat (Tawk.to) configuration, persisted on the device. Kept separate
 * from the user profile so chat setup is self-contained and easy to extend
 * with other chat providers later.
 */
export interface ChatSettings {
  /** Tawk.to Property ID (from the Tawk.to dashboard widget code). */
  tawkPropertyId: string;
  /** Optional Tawk.to Widget ID; defaults to "default" when blank. */
  tawkWidgetId: string;
  /** Whether the widget should load on dashboard pages. */
  enabled: boolean;
}

export const EMPTY_CHAT: ChatSettings = {
  tawkPropertyId: "",
  tawkWidgetId: "",
  enabled: false,
};

const STORAGE_KEY = "nichelead.chat";

/** A Tawk.to Property ID looks like a 24-char hex id, e.g. 5f...e1. */
export function isValidTawkPropertyId(id: string) {
  return /^[a-f0-9]{20,30}$/i.test(id.trim());
}

interface ChatContextValue {
  chat: ChatSettings;
  setChat: (patch: Partial<ChatSettings>) => void;
  ready: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatSettingsProvider({ children }: { children: ReactNode }) {
  const [chat, setChatState] = useState<ChatSettings>(EMPTY_CHAT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChatState({ ...EMPTY_CHAT, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  const setChat = (patch: Partial<ChatSettings>) => {
    setChatState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — keep in-memory
      }
      return next;
    });
  };

  const value = useMemo<ChatContextValue>(
    () => ({ chat, setChat, ready }),
    [chat, ready],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatSettings() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatSettings must be used within a ChatSettingsProvider");
  return ctx;
}
