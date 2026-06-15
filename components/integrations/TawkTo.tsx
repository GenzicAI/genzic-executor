"use client";

import { useEffect } from "react";
import { useChatSettings, isValidTawkPropertyId } from "@/lib/chat-settings";

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

/**
 * Tawk.to live-chat loader.
 *
 * Reads configuration from the in-app chat settings (Settings → Live Chat
 * Integration). The widget loads on every page only when:
 *   1. the toggle is enabled, AND
 *   2. a valid Tawk.to Property ID is provided.
 *
 * Note: this widget appears on the user's OWN site for live chat — leads do
 * not need a Tawk.to account.
 */
export function TawkTo() {
  const { chat, ready } = useChatSettings();
  const propertyId = chat.tawkPropertyId.trim();
  const widgetId = chat.tawkWidgetId.trim() || "default";
  const active = ready && chat.enabled && isValidTawkPropertyId(propertyId);

  useEffect(() => {
    if (!active) {
      // If a widget was previously injected, hide it when disabled.
      window.Tawk_API?.hideWidget?.();
      return;
    }

    // Avoid injecting the same property's script twice.
    const existing = document.getElementById("tawkto-script") as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.propertyId === propertyId && existing.dataset.widgetId === widgetId) {
        window.Tawk_API?.showWidget?.();
        return;
      }
      // Property/widget changed — reload the page to swap widgets cleanly.
      existing.remove();
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s = document.createElement("script");
    s.id = "tawkto-script";
    s.async = true;
    s.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    s.dataset.propertyId = propertyId;
    s.dataset.widgetId = widgetId;
    document.body.appendChild(s);
  }, [active, propertyId, widgetId]);

  return null;
}
