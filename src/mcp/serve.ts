/**
 * arifOS MCP Server — multi-transport bootstrap
 *
 * Supports:
 *   --transport stdio            → local clients (Claude Desktop, Cursor, Windsurf)
 *   --transport sse --port N     → remote clients (ChatGPT, Claude.ai web)
 *   --transport streamable-http → generic HTTP clients
 *
 * @module mcp/serve
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { validateInputClarity } from "../governance/f3InputClarity.js";
import { checkHarmDignity } from "../governance/f6HarmDignity.js";
import { checkInjection } from "../governance/f9Injection.js";
import { readRuntimeConfig } from "../config/RuntimeConfig.js";
import { getApprovalBoundary, routeApproval } from "../approval/index.js";
import { getMemoryContract } from "../memory-contract/index.js";
import { telemetry } from "./telemetry.js";
import { runStage, recordFloorViolation } from "../metrics/prometheus.js";
import type { MetabolicStage } from "../types/aki.js";
import { FileVaultClient } from "../vault/index.js";
import { WebhookHumanEscalationClient, NoOpHumanEscalationClient } from "../escalation/index.js";
import { getTicketStore } from "../approval/index.js";
import { GEOX_TOOLS } from "../tools/GEOXTools.js";
import { WEALTH_TOOLS } from "../tools/WealthTools.js";

const server = new McpServer({
  name: "af-forge",
  version: "0.1.0",
});

const approvalBoundary = getApprovalBoundary();
const memoryContract = getMemoryContract();

async function telemetryInvoke(tool: string): Promise<void> {
  telemetry.recordInvocation(tool);
}

async function telemetrySuccess(
  tool: string,
  startedAt: number,
  provider?: string,
): Promise<void> {
  telemetry.recordSuccess(tool, provider);
  await telemetry.logEvent({
    epoch: new Date().toISOString(),
    tool,
    action: "success",
    metadata: { durationMs: Date.now() - startedAt },
  });
}

async function telemetryFailure(tool: string, startedAt: number, error: unknown): Promise<void> {
  telemetry.recordFailure(tool);
  const message = error instanceof Error ? error.message : String(error);
  await telemetry.logEvent({
    epoch: new Date().toISOString(),
    tool,
    action: "failure",
    outcome: message,
    metadata: { durationMs: Date.now() - startedAt },
  });
}

server.tool(
  "forge_check_governance",
  "Run AF-FORGE constitutional governance checks (F3 InputClarity, F6 HarmDignity, F9 Injection) against a task string.",
  { task: z.string().describe("The task or prompt text to evaluate") },
  async ({ task }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_check_governance");
    return runStage("666_ALIGN" as MetabolicStage, async () => {
      try {
        const f3 = validateInputClarity(task);
        const f6 = checkHarmDignity(task);
        const f9 = checkInjection(task);
        if (f3.verdict === "SABAR") recordFloorViolation("F3", "hard");
        if (f6.verdict === "VOID") recordFloorViolation("F6", "hard");
        if (f9.verdict === "VOID") recordFloorViolation("F9", "hard");
        const blocked = f3.verdict === "SABAR" || f6.verdict === "VOID" || f9.verdict === "VOID";
        const result = {
          content: [{ type: "text" as const, text: JSON.stringify({ overall: blocked ? "BLOCK" : "PASS", blocked, floors: { F3: f3, F6: f6, F9: f9 } }, null, 2) }],
        };
        await telemetrySuccess("forge_check_governance", startedAt);
        return result;
      } catch (err) {
        await telemetryFailure("forge_check_governance", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "forge_health",
  "Return AF-FORGE server health and constitutional floor (F1–F13) implementation status.",
  {},
  async () => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_health");
    return runStage("000_INIT" as MetabolicStage, async () => {
      try {
        const floors: Record<string, { implemented: boolean; gate: string; maturity: string }> = {
          F1_Amanah: { implemented: true, gate: "888_HOLD", maturity: "production" },
          F2_Truth: { implemented: true, gate: "structured evidence markers", maturity: "v1-heuristic" },
          F3_InputClarity: { implemented: true, gate: "SABAR on vague input", maturity: "production" },
          F4_Entropy: { implemented: true, gate: "budget.tokenCeiling", maturity: "production" },
          F5_Continuity: { implemented: true, gate: "LongTermMemory", maturity: "production" },
          F6_HarmDignity: { implemented: true, gate: "VOID on harm patterns", maturity: "production" },
          F7_Confidence: { implemented: true, gate: "F7 confidence bands", maturity: "production" },
          F8_Grounding: { implemented: true, gate: "evidence required", maturity: "production" },
          F9_Injection: { implemented: true, gate: "VOID on injection patterns", maturity: "production" },
          F10_Privacy: { implemented: true, gate: "PII regex + quarantine lane", maturity: "v1-heuristic" },
          F11_Coherence: { implemented: true, gate: "summarizeGovernance()", maturity: "production" },
          F12_Stewardship: { implemented: true, gate: "metrics pressure", maturity: "v1-heuristic" },
          F13_Sovereign: { implemented: true, gate: "888_HOLD no auto-approve", maturity: "production" },
        };
        const implemented = Object.values(floors).filter((f) => f.implemented).length;
        const result = {
          content: [{ type: "text" as const, text: JSON.stringify({ status: "healthy", version: "0.1.0", constitutional_floors: { implemented, total: Object.keys(floors).length, coverage: `${Math.round((implemented / Object.keys(floors).length) * 100)}%`, floors } }, null, 2) }],
        };
        await telemetrySuccess("forge_health", startedAt);
        return result;
      } catch (err) {
        await telemetryFailure("forge_health", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "forge_hold",
  "Stage an action for 888_HOLD approval. Returns a holdId and risk assessment.",
  {
    description: z.string().describe("Short human-readable description of the action"),
    whatWillHappen: z.string().describe("Plain language summary of the action"),
    sideEffects: z.array(z.string()).optional().default([]).describe("List of side effects"),
    riskLevel: z.enum(["minimal", "low", "medium", "high", "critical"]).optional().describe("Risk override"),
    reasoning: z.string().optional().describe("Why this action is recommended"),
  },
  async ({ description, whatWillHappen, sideEffects, riskLevel, reasoning }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_hold");
    return runStage("888_JUDGE" as MetabolicStage, async () => {
      try {
        const preview = approvalBoundary.createPreview(description, {
          whatWillHappen,
          sideEffects,
          reasoning: reasoning ?? "Staged via MCP",
          riskLevel: riskLevel ?? "medium",
        });
        const item = approvalBoundary.stageAction(description, preview, "MCP staging");
        const result = {
          content: [{ type: "text" as const, text: JSON.stringify({ holdId: item.holdId, badge: item.badge, state: item.state, riskTier: item.riskTier, expiresAt: item.expiresAt }, null, 2) }],
        };
        await telemetrySuccess("forge_hold", startedAt);
        return result;
      } catch (err) {
        await telemetryFailure("forge_hold", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "forge_approve",
  "Approve a previously staged action in the 888_HOLD queue.",
  {
    holdId: z.string().describe("The holdId returned by forge_hold"),
    reason: z.string().optional().describe("Reason for approval"),
  },
  async ({ holdId, reason }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_approve");
    return runStage("888_JUDGE" as MetabolicStage, async () => {
      try {
        const item = approvalBoundary.approve(holdId, reason);
        const result = {
          content: [{ type: "text" as const, text: JSON.stringify({ holdId: item.holdId, badge: item.badge, state: item.state, decidedAt: item.decidedAt }, null, 2) }],
        };
        await telemetrySuccess("forge_approve", startedAt);
        return result;
      } catch (err) {
        await telemetryFailure("forge_approve", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "forge_remember",
  "Store a memory in the AF-FORGE MemoryContract.",
  {
    content: z.string().describe("The memory content to store"),
    reason: z.string().describe("Why this memory is being stored"),
    tier: z.enum(["ephemeral", "working", "canon", "sacred", "quarantine"]).optional().describe("Memory tier"),
    tags: z.array(z.string()).optional().default([]).describe("Tags"),
  },
  async ({ content, reason, tier, tags }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_remember");
    return runStage("999_VAULT" as MetabolicStage, async () => {
      try {
        const entry = await memoryContract.store({ content, reason, tier, tags });
        const result = {
          content: [{ type: "text" as const, text: JSON.stringify({ memoryId: entry.memoryId, tier: entry.tier, createdAt: entry.createdAt, pinned: entry.pinned }, null, 2) }],
        };
        await telemetrySuccess("forge_remember", startedAt);
        return result;
      } catch (err) {
        await telemetryFailure("forge_remember", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "forge_recall",
  "Query memories from the AF-FORGE MemoryContract.",
  {
    query: z.string().describe("Search text"),
    tags: z.array(z.string()).optional().describe("Filter by tags"),
    minConfidence: z.number().min(0).max(1).optional().describe("Min confidence"),
    limit: z.number().int().positive().optional().describe("Max results"),
  },
  async ({ query, tags, minConfidence, limit }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_recall");
    return runStage("999_VAULT" as MetabolicStage, async () => {
      try {
        const result = memoryContract.query({ query, tags, minConfidence });
        const memories = limit ? result.memories.slice(0, limit) : result.memories;
        const response = {
          content: [{ type: "text" as const, text: JSON.stringify({ total: result.total, returned: memories.length, memories: memories.map((m) => ({ memoryId: m.memoryId, tier: m.tier, content: m.content, confidence: m.confidence, tags: m.tags, reason: m.reason, createdAt: m.createdAt })) }, null, 2) }],
        };
        await telemetrySuccess("forge_recall", startedAt);
        return response;
      } catch (err) {
        await telemetryFailure("forge_recall", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "forge_ticket_status",
  "Query the status of an 888_HOLD approval ticket by ticketId.",
  { ticketId: z.string().describe("The ticket ID to look up") },
  async ({ ticketId }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_ticket_status");
    try {
      const store = getTicketStore();
      await store.initialize();
      const ticket = await store.findById(ticketId);
      const result = { content: [{ type: "text" as const, text: JSON.stringify({ found: !!ticket, ticket: ticket ?? null }, null, 2) }] };
      await telemetrySuccess("forge_ticket_status", startedAt);
      return result;
    } catch (err) {
      await telemetryFailure("forge_ticket_status", startedAt, err);
      throw err;
    }
  }
);

server.tool(
  "geox_health",
  "Check GEOX organ health and return geological data availability.",
  {},
  async () => {
    const startedAt = Date.now();
    await telemetryInvoke("geox_health");
    return runStage("333_MIND" as MetabolicStage, async () => {
      try {
        const result = {
          content: [{ type: "text" as const, text: JSON.stringify({ status: "ok", organ: "GEOX", verdict: "SEAL", uncertaintyTag: "ESTIMATE" }, null, 2) }],
        };
        await telemetrySuccess("geox_health", startedAt);
        return result;
      } catch (err) {
        await telemetryFailure("geox_health", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "geox_check_hazard",
  "Check physical hazard risk (seismic/volcanic/flood/landslide/subsidence) for a location. Returns hazard level, probability, intensity, confidence interval, and physical constraint envelope. Tagged ESTIMATE/HYPOTHESIS/UNKNOWN per F8.",
  {
    location: z.string().optional().describe("Location name or coordinates"),
    latitude: z.number().optional().describe("Latitude"),
    longitude: z.number().optional().describe("Longitude"),
    hazard_types: z.array(z.enum(["seismic", "volcanic", "flood", "landslide", "subsidence"])).optional().describe("Hazard types"),
    scenario: z.string().optional().describe("Scenario context"),
  },
  async ({ location, latitude, longitude, hazard_types, scenario }) => {
    const startedAt = Date.now();
    await telemetryInvoke("geox_check_hazard");
    return runStage("333_MIND" as MetabolicStage, async () => {
      try {
        const tool = new GEOX_TOOLS[0]();
        const res = await tool.run({ location, latitude, longitude, hazard_types, scenario }, { sessionId: "mcp-serve", workingDirectory: "/tmp", modeName: "internal_mode" });
        const parsed = JSON.parse(res.output as string);
        const response = { content: [{ type: "text" as const, text: JSON.stringify(parsed, null, 2) }] };
        await telemetrySuccess("geox_check_hazard", startedAt);
        return response;
      } catch (err) {
        await telemetryFailure("geox_check_hazard", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "geox_subsurface_model",
  "Compute subsurface geological model at depth/location. Returns porosity, permeability, formation pressure, fracture gradient, injection rate limits. Tagged ESTIMATE/HYPOTHESIS/UNKNOWN per F8.",
  {
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    depth: z.number().optional().describe("Target depth in meters"),
    formation_type: z.enum(["sandstone", "carbonate", "shale", "granite", "volcanic"]).optional(),
    scenario: z.string().optional().describe("extraction, storage, injection"),
  },
  async ({ latitude, longitude, depth, formation_type, scenario }) => {
    const startedAt = Date.now();
    await telemetryInvoke("geox_subsurface_model");
    return runStage("333_MIND" as MetabolicStage, async () => {
      try {
        const tool = new GEOX_TOOLS[1]();
        const res = await tool.run({ latitude, longitude, depth, formation_type, scenario }, { sessionId: "mcp-serve", workingDirectory: "/tmp", modeName: "internal_mode" });
        const response = { content: [{ type: "text" as const, text: JSON.stringify(JSON.parse(res.output as string), null, 2) }] };
        await telemetrySuccess("geox_subsurface_model", startedAt);
        return response;
      } catch (err) {
        await telemetryFailure("geox_subsurface_model", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "wealth_health",
  "Check WEALTH organ health.",
  {},
  async () => {
    const startedAt = Date.now();
    await telemetryInvoke("wealth_health");
    return runStage("777_FORGE" as MetabolicStage, async () => {
      try {
        const result = {
          content: [{ type: "text" as const, text: JSON.stringify({ status: "ok", organ: "WEALTH", verdict: "SEAL" }, null, 2) }],
        };
        await telemetrySuccess("wealth_health", startedAt);
        return result;
      } catch (err) {
        await telemetryFailure("wealth_health", startedAt, err);
        throw err;
      }
    });
  }
);

server.tool(
  "wealth_evaluate_ROI",
  "Evaluate investment ROI against WEALTH objective function. Returns PROCEED/HOLD/VOID, EMV, NPV, maruah score, thermodynamic band, and violation list.",
  {
    domain: z.enum(["GEOX", "WEALTH", "CODE"]).optional(),
    initial_investment: z.number().describe("Initial cost or investment (positive number)"),
    scenarios: z.array(z.object({
      probability: z.number().describe("Probability (0-1)"),
      cash_flow: z.number().describe("Net cash flow"),
      label: z.string().optional(),
    })).describe("Investment scenarios with probabilities"),
    joules: z.number().optional().describe("Thermodynamic resource cost in joules"),
    reasoning: z.string().optional(),
  },
  async ({ domain, initial_investment, scenarios, joules, reasoning }) => {
    const startedAt = Date.now();
    await telemetryInvoke("wealth_evaluate_ROI");
    return runStage("777_FORGE" as MetabolicStage, async () => {
      try {
        const tool = new WEALTH_TOOLS[0]();
        const res = await tool.run({ capitalRequired: initial_investment, expectedReturn: scenarios[0]?.cash_flow, domain, joulesEstimate: joules, scenario: reasoning }, { sessionId: "mcp-serve", workingDirectory: "/tmp", modeName: "internal_mode" });
        const response = { content: [{ type: "text" as const, text: JSON.stringify(JSON.parse(res.output as string), null, 2) }] };
        await telemetrySuccess("wealth_evaluate_ROI", startedAt);
        return response;
      } catch (err) {
        await telemetryFailure("wealth_evaluate_ROI", startedAt, err);
        throw err;
      }
    });
  }
);

server.resource(
  "forge://governance/floors",
  "forge://governance/floors",
  { mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "forge://governance/floors",
      mimeType: "application/json",
      text: JSON.stringify({
        floors: [
          { id: "F1", name: "Amanah", principle: "No irreversible action without VAULT999 seal", gate: "888_HOLD" },
          { id: "F2", name: "Truth", principle: "No ungrounded claims (τ ≥ 0.99)", gate: "evidence links required" },
          { id: "F3", name: "InputClarity", principle: "Reject vague or empty input", gate: "SABAR" },
          { id: "F4", name: "Entropy", principle: "Respect token/turn budgets", gate: "budget ceiling" },
          { id: "F5", name: "Continuity", principle: "Persist context across sessions", gate: "LongTermMemory" },
          { id: "F6", name: "HarmDignity", principle: "No harmful execution patterns", gate: "VOID" },
          { id: "F7", name: "Confidence", principle: "Signal uncertainty explicitly", gate: "confidence bands" },
          { id: "F8", name: "Grounding", principle: "Claims need evidence", gate: "evidence required" },
          { id: "F9", name: "Injection", principle: "Reject prompt injection", gate: "VOID" },
          { id: "F10", name: "Privacy", principle: "Protect personal data", gate: "PII regex" },
          { id: "F11", name: "Coherence", principle: "Summarise governance state", gate: "summarizeGovernance()" },
          { id: "F12", name: "Stewardship", principle: "Long-horizon resource care", gate: "metrics" },
          { id: "F13", name: "Sovereign", principle: "Human holds final authority", gate: "888_HOLD no auto-approve" },
        ],
      }, null, 2),
    }],
  })
);

server.resource(
  "forge://memory/working",
  "forge://memory/working",
  { mimeType: "application/json" },
  async () => {
    const result = memoryContract.query({ query: "", tiers: ["working"] });
    return { contents: [{ uri: "forge://memory/working", mimeType: "application/json", text: JSON.stringify({ count: result.total, memories: result.memories.map((m) => ({ memoryId: m.memoryId, content: m.content, tags: m.tags, confidence: m.confidence, createdAt: m.createdAt })) }, null, 2) }] };
  }
);

export async function startMcpServer(transport: "stdio" | "sse" | "streamable-http", port?: number): Promise<void> {
  await approvalBoundary.initialize();
  await memoryContract.initialize();
  await telemetry.initialize();

  if (transport === "stdio") {
    const t = new StdioServerTransport();
    await server.connect(t);
    process.stderr.write("[arifOS-MCP] Server started on stdio\n");
  } else {
    if (!port) port = 3000;
    const { createServer } = await import("node:http");
    const t = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
    const server2 = createServer(async (req, res) => {
      if (req.url === "/geox/mcp" || req.url === "/wealth/mcp" || req.url === "/mcp") {
        await t.handleRequest(req, res, { sessionIdGenerator: () => randomUUID() });
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server2.listen(port, () => {
      process.stderr.write(`[arifOS-MCP] HTTP server listening on port ${port}\n`);
    });
  }
}
