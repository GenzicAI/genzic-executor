"use client";

import { useEffect } from "react";

/**
 * Tawk.to live-chat placeholder. Loads the widget only when
 * NEXT_PUBLIC_TAWKTO_PROPERTY_ID and NEXT_PUBLIC_TAWKTO_WIDGET_ID are set,
 * so it is a no-op until you wire up a real Tawk.to property.
 */
export function TawkTo() {
  const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID;

  useEffect(() => {
    if (!propertyId || !widgetId) return;
    if (document.getElementById("tawkto-script")) return;

    const s = document.createElement("script");
    s.id = "tawkto-script";
    s.async = true;
    s.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    document.body.appendChild(s);
  }, [propertyId, widgetId]);

  return null;
}
