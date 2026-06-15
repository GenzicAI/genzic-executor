/**
 * Integration placeholders.
 *
 * NicheLead AI is wired to send all real-world side effects (email, SMS,
 * CRM sync, AI scoring) through external services. For the MVP these are
 * stubbed so the UI is fully functional without credentials. Each function
 * reads its key from the environment and, when unconfigured, logs the
 * payload and resolves successfully so flows can be demoed end to end.
 *
 * Automation strategy: **Zapier only**. Outreach + CRM writes POST to a
 * single Zapier Catch Hook, which fans out to Resend (email), Twilio (SMS),
 * the CRM, and Abacus.AI for enrichment/scoring.
 */

export type OutreachChannel = "email" | "sms";

export interface OutreachPayload {
  channel: OutreachChannel;
  niche: string;
  leadId: string;
  leadName: string;
  to?: string;
  subject?: string;
  body: string;
  templateId: string;
}

interface DispatchResult {
  ok: boolean;
  provider: string;
  simulated: boolean;
  message: string;
}

const ZAPIER_HOOK = process.env.NEXT_PUBLIC_ZAPIER_CATCH_HOOK_URL;

/** Send an outreach message via the Zapier Catch Hook (single automation entrypoint). */
export async function dispatchOutreach(
  payload: OutreachPayload,
): Promise<DispatchResult> {
  const provider = payload.channel === "email" ? "Resend (via Zapier)" : "Twilio (via Zapier)";

  if (!ZAPIER_HOOK) {
    // Simulated mode — no Zapier hook configured yet.
    if (typeof window !== "undefined") {
      console.info("[NicheLead] Simulated outreach →", provider, payload);
    }
    return {
      ok: true,
      provider,
      simulated: true,
      message: `Simulated ${payload.channel} to ${payload.leadName}. Configure NEXT_PUBLIC_ZAPIER_CATCH_HOOK_URL to send for real.`,
    };
  }

  try {
    await fetch(ZAPIER_HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, sentAt: new Date().toISOString() }),
    });
    return {
      ok: true,
      provider,
      simulated: false,
      message: `Queued ${payload.channel} to ${payload.leadName} via Zapier → ${provider}.`,
    };
  } catch {
    return {
      ok: false,
      provider,
      simulated: false,
      message: `Failed to reach Zapier hook. Check NEXT_PUBLIC_ZAPIER_CATCH_HOOK_URL.`,
    };
  }
}

/**
 * Placeholder for Abacus.AI lead enrichment / re-scoring. In production this
 * would call an Abacus.AI deployment endpoint; here it returns the existing
 * score so the UI behaves consistently offline.
 */
export async function scoreLeadWithAbacus(existingScore: number): Promise<number> {
  const configured = Boolean(process.env.ABACUS_AI_API_KEY);
  if (!configured) return existingScore;
  // Real call would go here.
  return existingScore;
}

export const integrationStatus = () => ({
  supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  zapier: Boolean(ZAPIER_HOOK),
  abacus: Boolean(process.env.ABACUS_AI_API_KEY),
  resend: Boolean(process.env.RESEND_API_KEY),
  twilio: Boolean(process.env.TWILIO_ACCOUNT_SID),
  tawkto: Boolean(process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID),
});
