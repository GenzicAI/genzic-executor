// Genzic Executor's MCP door (door 2 on the Command Center tree). A plain
// Vercel Node Function, not Next.js — this repo is (and stays) a static
// index.html dashboard with zero build step, so this file is the ONLY
// server-side code here, added without touching the dashboard at all.
//
// Mirrors genzic-official's app/api/mcp/route.ts (Genzic HQ's MCP door 1):
// same per-agent bearer keys, same stateless-per-request McpServer, same
// "read fixture/backend data, never fabricate" rule. The one structural
// difference is the transport — HQ is a Next.js route handler (fetch
// Request/Response, so it uses WebStandardStreamableHTTPServerTransport);
// this is a raw Vercel Node Function (req/res are plain
// http.IncomingMessage/ServerResponse), so it uses the SDK's Node-flavored
// StreamableHTTPServerTransport instead. Same protocol on the wire either way.
//
// Only two tools are real: draft_email and send_email, both proxying to the
// SAME Google Apps Script "Execution Engine" the dashboard's own
// generateEmail()/sendEmail() call (see index.html's API_URL) — that Apps
// Script endpoint is the actual backend; this route does not reimplement it.
// The other seven tools the Brigitte prompt asked for (list_inboxes,
// search_email, get_email, list_drafts, reply_email, label_email,
// archive_email) have no backing implementation anywhere yet, so they
// return a clear "not implemented" error instead of fabricated data —
// confirmed with Tan 2026-09-01: ship only what's real this pass.

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
const { timingSafeEqual } = require("crypto");

// Same Apps Script the dashboard's own index.html posts to (its API_URL
// constant) — this route is a second caller of that endpoint, not a
// replacement for it.
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyFZqgLtSR5sXoDpND5EHEs5GErtnK9AHglvS0VIezXTfXUSxnJgawEdN9fnlunGVMzkw/exec";

// One key per Command Center agent, same reasoning as HQ_MCP_KEY_*: revoking
// one agent's Executor access (rotate/delete EXECUTOR_MCP_KEY_MAX in Vercel)
// can never take the others down with it. Set these in Vercel → Settings →
// Environment Variables before door 2 goes live — there is no default.
const AGENT_KEYS = {
  max: process.env.EXECUTOR_MCP_KEY_MAX || "",
  victoria: process.env.EXECUTOR_MCP_KEY_VICTORIA || "",
  brittany: process.env.EXECUTOR_MCP_KEY_BRITTANY || "",
  brigitte: process.env.EXECUTOR_MCP_KEY_BRIGITTE || "",
};

// This route is genuinely cross-origin from the Command Center (genzic.ai
// calling a separate genzic-executor.vercel.app deployment) — unlike HQ's
// same-origin /api/mcp, so, unlike HQ, this needs real CORS handling.
const ALLOWED_ORIGINS = ["https://genzic.ai", "https://www.genzic.ai", "http://localhost:3000"];

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Returns the matching agent name ("max", "victoria", ...) or null. */
function authorizedAgent(req) {
  const header = req.headers["authorization"] || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const token = match[1];
  for (const [agent, expected] of Object.entries(AGENT_KEYS)) {
    if (expected && safeEqual(token, expected)) return agent;
  }
  return null;
}

function logCall(agent, tool, extra) {
  // Best-effort audit trail via Vercel's function logs — "who, what, when"
  // per Tan's spec. Not a durable/queryable log store (no DB wired up this
  // pass); Vercel's own log retention is the only history this has right now.
  console.log(JSON.stringify({ ts: new Date().toISOString(), agent, tool, ...extra }));
}

async function callAppsScript(formFields) {
  const body = Object.entries(formFields)
    .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v ?? ""))
    .join("&");
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // The dashboard's own "fire" call never reads a response at all (posted
    // with mode:'no-cors' from the browser) — this endpoint was never
    // contracted to return JSON on every path. A non-JSON 200 here is
    // treated as success rather than an error on a format it doesn't owe us.
    return { status: res.ok ? "ok" : "error", raw: text };
  }
}

function notImplemented(name) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text:
          name +
          " is not implemented yet — the Executor backend only supports drafting and sending a new outbound email today, not reading an inbox.",
      },
    ],
  };
}

const STUB_TOOLS = [
  ["list_inboxes", "List the inboxes the Executor can see."],
  ["search_email", "Search email by sender, subject, or body."],
  ["get_email", "Get one email by id."],
  ["list_drafts", "List drafts waiting in the Executor."],
  ["reply_email", "Reply to an existing email thread."],
  ["label_email", "Apply a label to an email."],
  ["archive_email", "Archive an email."],
];

function buildServer(agent) {
  const server = new McpServer({ name: "genzic-executor", version: "1.0.0" });

  server.registerTool(
    "draft_email",
    {
      description:
        "Draft a new outbound email through the Execution Engine. Returns a subject/body for review — never sends by itself.",
      inputSchema: {
        prompt: z.string().describe("What the email should say, in plain language"),
        recipient: z.string().describe("Recipient email address or name"),
        agent_name: z.string().describe("Sending persona's display name, e.g. Victoria"),
        agent_email: z.string().describe("Sending persona's email address"),
        agent_role: z.string().optional().describe("Sending persona's role/title"),
      },
    },
    async ({ prompt, recipient, agent_name, agent_email, agent_role }) => {
      logCall(agent, "draft_email", { recipient });
      const data = await callAppsScript({
        action: "generate",
        prompt,
        recipient,
        agentName: agent_name,
        agentEmail: agent_email,
        agentRole: agent_role || "Executive",
      });
      if (data.status === "error") {
        return { isError: true, content: [{ type: "text", text: "Draft failed: " + (data.message || "Execution Engine error") }] };
      }
      if (data.status !== "generated") {
        return { isError: true, content: [{ type: "text", text: "Unexpected Execution Engine response: " + JSON.stringify(data) }] };
      }
      const draft = { from: data.from, to: data.to, subject: data.subject, body: data.body, reason: data.reason };
      return { content: [{ type: "text", text: JSON.stringify(draft, null, 2) }] };
    }
  );

  server.registerTool(
    "send_email",
    {
      description:
        'Send a previously drafted email through the Execution Engine. Requires confirmed=true — only set this when the user\'s own words explicitly confirmed the send in this turn ("send it", "send that", "yes send"). Never call this speculatively.',
      inputSchema: {
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        from: z.string(),
        reason: z.string().optional(),
        confirmed: z.boolean().describe("Must be true. Set only when the user's own words explicitly confirmed the send in this turn."),
      },
    },
    async ({ to, subject, body, from, reason, confirmed }) => {
      if (!confirmed) {
        // Server-side gate, not just client-side — a client bug must not be
        // able to turn into a silent send. No Apps Script call happens below
        // this line unless confirmed is literally true.
        return { isError: true, content: [{ type: "text", text: "Refused: send_email called without confirmed=true. No email was sent." }] };
      }
      const safeReason = (reason && reason.trim()) || "Autonomous C-Suite Dispatch — " + from;
      logCall(agent, "send_email", { to, subject });
      const data = await callAppsScript({ to, subject, body, from, reason: safeReason });
      return { content: [{ type: "text", text: JSON.stringify({ dispatched: true, to, subject, engineResponse: data }, null, 2) }] };
    }
  );

  for (const [name, description] of STUB_TOOLS) {
    server.registerTool(name, { description: description + " (not implemented yet.)", inputSchema: {} }, async () => notImplemented(name));
  }

  return server;
}

function setCors(req, res) {
  const origin = req.headers["origin"];
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null }));
    return;
  }

  const agent = authorizedAgent(req);
  if (!agent) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  const server = buildServer(agent);
  try {
    // sessionIdGenerator: undefined + enableJsonResponse: true — same
    // stateless-per-request pattern as HQ's route.ts, for the same reason:
    // this runs as a Vercel serverless function, not a long-lived process.
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null }));
    }
  }
};
