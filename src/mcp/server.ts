/**
 * AF-FORGE MCP Server (stdio)
 *
 * Exposes AF-FORGE governance and agent capabilities as MCP tools.
 * Implements the Model Context Protocol so any MCP-compatible host
 * (Claude Desktop, Cursor, OpenCode, Gemini, Smithery) can invoke
 * AF-FORGE constitutional checks without running the full CLI.
 *
 * Tools:
 *   forge_check_governance  — Run F3/F6/F9 checks on a task string
 *   forge_health            — Return server health + governance floor status
 *   forge_run               — Run a full agent task (explore profile, real LLM)
 *   forge_hold              — Stage an action for 888_HOLD approval
 *   forge_approve           — Approve a held action
 *   forge_remember          — Store a memory in the MemoryContract
 *   forge_recall            — Query memories from the MemoryContract
 *
 * Resources:
 *   forge://governance/floors  — Constitutional floor definitions (F1–F13)
 *   forge://approvals/pending  — Pending approval queue
 *   forge://memory/working     — Working-tier memories
 *
 * Transport: stdio (pipe)
 *
 * @module mcp/server
 * @constitutional F1 Amanah — no irreversible action without VAULT999 seal
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { validateInputClarity } from "../governance/f3InputClarity.js";
import { checkHarmDignity } from "../governance/f6HarmDignity.js";
import { checkInjection } from "../governance/f9Injection.js";
import { readRuntimeConfig } from "../config/RuntimeConfig.js";
import { createLlmProvider } from "../llm/providerFactory.js";
import { getApprovalBoundary, routeApproval } from "../approval/index.js";
import { getMemoryContract } from "../memory-contract/index.js";
import { telemetry } from "./telemetry.js";
import { runStage, recordFloorViolation } from "../metrics/prometheus.js";
import type { MetabolicStage } from "../types/aki.js";
import { FileVaultClient } from "../vault/index.js";
import { WebhookHumanEscalationClient, NoOpHumanEscalationClient } from "../escalation/index.js";
import { getTicketStore } from "../approval/index.js";

// ── Server bootstrap ────────────────────────────────────────────────────────

const server = new McpServer({
  name: "af-forge",
  version: "0.1.0",
});

const approvalBoundary = getApprovalBoundary();
const memoryContract = getMemoryContract();

// ── Telemetry helpers ───────────────────────────────────────────────────────

async function telemetryInvoke(tool: string): Promise<void> {
  telemetry.recordInvocation(tool);
}

async function telemetrySuccess(
  tool: string,
  startedAt: number,
  provider?: string,
  extra?: Record<string, unknown>
): Promise<void> {
  telemetry.recordSuccess(tool, provider);
  await telemetry.logEvent({
    epoch: new Date().toISOString(),
    tool,
    action: "success",
    metadata: { durationMs: Date.now() - startedAt, ...extra },
  });
}

async function telemetryFailure(
  tool: string,
  startedAt: number,
  error: unknown
): Promise<void> {
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

// ── Tools ───────────────────────────────────────────────────────────────────

/**
 * forge_check_governance
 * Run all three constitutional floor checks (F3, F6, F9) against a task string.
 * Returns a structured verdict for each floor plus an overall pass/block decision.
 */
server.tool(
  "forge_check_governance",
  "Run AF-FORGE constitutional governance checks (F3 InputClarity, F6 HarmDignity, F9 Injection) against a task string. Returns per-floor verdicts and an overall PASS/BLOCK decision.",
  {
    task: z.string().describe("The task or prompt text to evaluate"),
  },
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

      const blocked =
        f3.verdict === "SABAR" || f6.verdict === "VOID" || f9.verdict === "VOID";

      const floors: Record<string, unknown> = {
        F3_InputClarity: {
          verdict: f3.verdict,
          reason: f3.reason ?? null,
          message: f3.message ?? null,
        },
        F6_HarmDignity: {
          verdict: f6.verdict,
          reason: f6.reason ?? null,
          evidence: f6.evidence ?? [],
          message: f6.message ?? null,
        },
        F9_Injection: {
          verdict: f9.verdict,
          reason: f9.reason ?? null,
          triggeredPatterns: f9.triggeredPatterns ?? [],
          message: f9.message ?? null,
        },
      };

      const result = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                overall: blocked ? "BLOCK" : "PASS",
                blocked,
                floors,
              },
              null,
              2
            ),
          },
        ],
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

/**
 * forge_health
 * Return server health and constitutional floor implementation status.
 */
server.tool(
  "forge_health",
  "Return AF-FORGE server health and constitutional floor (F1–F13) implementation status.",
  {},
  async () => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_health");
    return runStage("000_INIT" as MetabolicStage, async () => {
    try {
      const floors: Record<string, { implemented: boolean; gate: string }> = {
        F1_Amanah: { implemented: true, gate: "888_HOLD" },
        F2_Truth: { implemented: true, gate: "τ≥0.99 evidence links" },
        F3_InputClarity: { implemented: true, gate: "SABAR on vague input" },
        F4_Entropy: { implemented: true, gate: "budget.tokenCeiling" },
        F5_Continuity: { implemented: true, gate: "LongTermMemory" },
        F6_HarmDignity: { implemented: true, gate: "VOID on harm patterns" },
        F7_Confidence: { implemented: true, gate: "F7 confidence bands" },
        F8_Grounding: { implemented: true, gate: "evidence required" },
        F9_Injection: { implemented: true, gate: "VOID on injection patterns" },
        F10_Privacy: { implemented: false, gate: "pending" },
        F11_Coherence: { implemented: true, gate: "summarizeGovernance()" },
        F12_Stewardship: { implemented: false, gate: "pending" },
        F13_Sovereign: { implemented: true, gate: "888_HOLD blocks, no auto-approve" },
      };

      const implemented = Object.values(floors).filter((f) => f.implemented).length;
      const total = Object.keys(floors).length;

      const result = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: "healthy",
                version: "0.1.0",
                constitutional_floors: {
                  implemented,
                  total,
                  coverage: `${Math.round((implemented / total) * 100)}%`,
                  floors,
                },
                telemetry: telemetry.getSummary(),
              },
              null,
              2
            ),
          },
        ],
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

/**
 * forge_run
 * Run a governed agent task using the explore profile and a real LLM provider.
 * Governance checks run first — blocked tasks never reach the LLM.
 */
server.tool(
  "forge_run",
  "Run a full AF-FORGE agent task (explore profile). Governance floors F3/F6/F9 run first — blocked tasks return immediately with SABAR or VOID. Uses the configured LLM provider (mock/openai/ollama) from environment. Returns finalText, turnCount, and governance outcome.",
  {
    task: z.string().describe("The task to execute"),
    mode: z
      .enum(["internal_mode", "external_safe_mode"])
      .optional()
      .default("external_safe_mode")
      .describe("Agent execution mode"),
  },
  async ({ task, mode }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_run");
    return runStage("777_FORGE" as MetabolicStage, async () => {
    try {
      const { AgentEngine } = await import("../engine/AgentEngine.js");
      const { LongTermMemory } = await import("../memory/LongTermMemory.js");
      const { ToolRegistry } = await import("../tools/ToolRegistry.js");
      const { ReadFileTool, WriteFileTool, ListFilesTool } = await import("../tools/FileTools.js");
      const { GrepTextTool } = await import("../tools/SearchTools.js");
      const { RunCommandTool, RunTestsTool } = await import("../tools/ShellTools.js");
      const { buildExploreProfile } = await import("../agents/profiles.js");
      const { tmpdir } = await import("node:os");
      const { resolve } = await import("node:path");

      const root = resolve(tmpdir(), `af-forge-mcp-${Date.now()}`);
      const { mkdir, rm } = await import("node:fs/promises");
      await mkdir(root, { recursive: true });

      try {
        const runtimeConfig = readRuntimeConfig();
        const registry = new ToolRegistry();
        registry.register(new ReadFileTool());
        registry.register(new ListFilesTool());
        registry.register(new GrepTextTool());

        if (mode === "internal_mode") {
          registry.register(new WriteFileTool());
          registry.register(new RunCommandTool());
          registry.register(new RunTestsTool());
        }

        const llmProvider = createLlmProvider(runtimeConfig);
        const providerName = runtimeConfig.provider.kind;

        const escalationClient = runtimeConfig.humanEscalationWebhookUrl
          ? new WebhookHumanEscalationClient(runtimeConfig.humanEscalationWebhookUrl)
          : new NoOpHumanEscalationClient();

        const engine = new AgentEngine(buildExploreProfile(mode ?? "external_safe_mode"), {
          llmProvider,
          longTermMemory: new LongTermMemory(resolve(root, "mem.json")),
          toolRegistry: registry,
          vaultClient: new FileVaultClient(resolve(root, "vault999.jsonl")),
          escalationClient,
          featureFlags: runtimeConfig.featureFlags,
          toolPolicy: runtimeConfig.toolPolicy,
          apiPricing: runtimeConfig.apiPricing,
        });

        const result = await engine.run({ task });

        const response = {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  finalText: result.finalText,
                  turnCount: result.turnCount,
                  transcriptLength: result.transcript.length,
                  blocked: result.finalText.includes("VOID") || result.finalText.includes("SABAR"),
                },
                null,
                2
              ),
            },
          ],
        };
        await telemetrySuccess("forge_run", startedAt, providerName, { mode });
        return response;
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    } catch (err) {
      await telemetryFailure("forge_run", startedAt, err);
      throw err;
    }
    });
  }
);

/**
 * forge_hold
 * Stage an action in the ApprovalBoundary. High-risk actions get ✋ Needs Yes;
 * low-risk actions get 📋 Ready.
 */
server.tool(
  "forge_hold",
  "Stage an action for 888_HOLD approval. Returns a holdId, badge, and risk assessment. High-risk actions require explicit human approval before execution.",
  {
    description: z.string().describe("Short human-readable description of the action"),
    whatWillHappen: z.string().describe("Plain language summary of the action"),
    sideEffects: z.array(z.string()).optional().default([]).describe("List of specific side effects"),
    riskLevel: z.enum(["minimal", "low", "medium", "high", "critical"]).optional().describe("Explicit risk override"),
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

      await telemetry.logEvent({
        epoch: new Date().toISOString(),
        tool: "forge_hold",
        action: "hold_created",
        outcome: item.state,
        metadata: { holdId: item.holdId, riskTier: item.riskTier },
      });

      const result = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                holdId: item.holdId,
                badge: item.badge,
                state: item.state,
                riskTier: item.riskTier,
                expiresAt: item.expiresAt,
              },
              null,
              2
            ),
          },
        ],
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

/**
 * forge_approve
 * Approve a held action by holdId.
 */
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

      await telemetry.logEvent({
        epoch: new Date().toISOString(),
        tool: "forge_approve",
        action: "hold_approved",
        outcome: item.state,
        metadata: { holdId: item.holdId, previousState: "holding" },
      });

      const result = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                holdId: item.holdId,
                badge: item.badge,
                state: item.state,
                decidedAt: item.decidedAt,
              },
              null,
              2
            ),
          },
        ],
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

/**
 * forge_route_approval
 * Run a PlannerOutput through PolicyEnforcer + ApprovalRouter.
 *
 * Takes a PlannerOutput JSON (from arifOS PlannerAgent), validates it against
 * PolicyConfig, then stages it in ApprovalBoundary if HUMAN_APPROVAL_REQUIRED.
 *
 * Returns:
 *   AUTO_APPLIED      — patches applied immediately
 *   WAITING_FOR_HUMAN — staged in hold queue; poll / approve via forge_approve
 *   REJECTED          — hard policy violation; no changes made
 *
 * This is the main entry point for the arifOS → AF-FORGE governed edit flow.
 */
server.tool(
  "forge_route_approval",
  "Run a PlannerOutput through PolicyEnforcer + ApprovalRouter. Validates proposed changes against policy, stages high-risk edits for 888_HOLD, auto-applies low-risk diffs. Returns holdId for human approval if WAITING_FOR_HUMAN.",
  {
    planner_output: z.record(z.string(), z.unknown()).describe("PlannerOutput JSON — intent, proposed_changes[], confidence, risk_score"),
    policy_override: z.record(z.string(), z.unknown()).optional().describe("Optional PolicyConfig to override defaults"),
    force_apply: z.boolean().optional().default(false).describe("Skip human-gate and apply directly (for replay after approval)"),
  },
  async ({ planner_output, policy_override, force_apply }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_route_approval");
    return runStage("888_JUDGE" as MetabolicStage, async () => {
    try {
      const { defaultPolicyConfig } = await import("../types/policy.js");
      const { routeApproval } = await import("../approval/ApprovalRouter.js");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plannerOutput = planner_output as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const policy = (policy_override ?? defaultPolicyConfig) as any;

      const outcome = await routeApproval(plannerOutput, policy, { forceApply: force_apply });

      const auditAction = outcome.type === "AUTO_APPLIED"
        ? "route_approved"
        : outcome.type === "WAITING_FOR_HUMAN"
          ? "route_waiting"
          : "route_rejected";

      await telemetry.logEvent({
        epoch: new Date().toISOString(),
        tool: "forge_route_approval",
        action: auditAction,
        metadata: {
          outcome: outcome.type,
          reason_codes: "reason_codes" in outcome ? outcome.reason_codes : [],
          holdId: "holdId" in outcome ? outcome.holdId : undefined,
          filesChanged: plannerOutput.proposed_changes?.length ?? 0,
          durationMs: Date.now() - startedAt,
        },
      });

      const result = {
        content: [{ type: "text" as const, text: JSON.stringify(outcome, null, 2) }],
      };
      await telemetrySuccess("forge_route_approval", startedAt);
      return result;
    } catch (err) {
      await telemetryFailure("forge_route_approval", startedAt, err);
      throw err;
    }
    });
  }
);

/**
 * forge_apply_patches
 * Directly apply a list of unified diffs without going through full routeApproval.
 * Intended for low-risk patch application where the caller already has arifOS sign-off.
 * For full governance, use forge_route_approval instead.
 */
server.tool(
  "forge_apply_patches",
  "Apply a list of unified diffs directly. For governed workflows, use forge_route_approval instead. Returns per-file applied status.",
  {
    patches: z.array(
      z.object({
        file_path: z.string().describe("Relative path to the target file"),
        unified_diff: z.string().describe("Unified diff string"),
      })
    ).describe("Array of patches to apply"),
  },
  async ({ patches }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_apply_patches");
    return runStage("777_FORGE" as MetabolicStage, async () => {
    try {
      const { applyPatches } = await import("../tools/EditorTools.js");
      const results = await applyPatches(patches);
      const allApplied = results.every((r) => r.applied);

      await telemetry.logEvent({
        epoch: new Date().toISOString(),
        tool: "forge_apply_patches",
        action: allApplied ? "patches_applied" : "patches_partial",
        metadata: { count: results.length, durationMs: Date.now() - startedAt },
      });

      const result = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ applied: allApplied, results }, null, 2),
          },
        ],
      };
      await telemetrySuccess("forge_apply_patches", startedAt);
      return result;
    } catch (err) {
      await telemetryFailure("forge_apply_patches", startedAt, err);
      throw err;
    }
    });
  }
);

/**
 * forge_remember
 * Store a memory in the MemoryContract.
 */
server.tool(
  "forge_remember",
  "Store a memory in the AF-FORGE MemoryContract. Memories are tiered (ephemeral, working, canon, sacred, quarantine) and persisted to ~/.arifos/memory.jsonl.",
  {
    content: z.string().describe("The memory content to store"),
    reason: z.string().describe("Why this memory is being stored"),
    tier: z.enum(["ephemeral", "working", "canon", "sacred", "quarantine"]).optional().describe("Memory tier"),
    tags: z.array(z.string()).optional().default([]).describe("Tags for categorization"),
  },
  async ({ content, reason, tier, tags }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_remember");
    return runStage("999_VAULT" as MetabolicStage, async () => {
    try {
      const entry = await memoryContract.store({
        content,
        reason,
        tier,
        tags,
      });

      await telemetry.logEvent({
        epoch: new Date().toISOString(),
        tool: "forge_remember",
        action: "memory_stored",
        outcome: entry.tier,
        metadata: { memoryId: entry.memoryId, tags: entry.tags },
      });

      const result = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                memoryId: entry.memoryId,
                tier: entry.tier,
                createdAt: entry.createdAt,
                pinned: entry.pinned,
              },
              null,
              2
            ),
          },
        ],
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

/**
 * forge_recall
 * Query memories from the MemoryContract.
 */
server.tool(
  "forge_recall",
  "Query memories from the AF-FORGE MemoryContract. Searches content, tags, and reasons.",
  {
    query: z.string().describe("Search text"),
    tags: z.array(z.string()).optional().describe("Filter by tags"),
    minConfidence: z.number().min(0).max(1).optional().describe("Minimum confidence threshold"),
    limit: z.number().int().positive().optional().describe("Maximum results to return"),
  },
  async ({ query, tags, minConfidence, limit }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_recall");
    return runStage("999_VAULT" as MetabolicStage, async () => {
    try {
      const result = memoryContract.query({
        query,
        tags,
        minConfidence,
      });

      const memories = limit ? result.memories.slice(0, limit) : result.memories;

      const response = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                total: result.total,
                returned: memories.length,
                memories: memories.map((m) => ({
                  memoryId: m.memoryId,
                  tier: m.tier,
                  content: m.content,
                  confidence: m.confidence,
                  tags: m.tags,
                  reason: m.reason,
                  createdAt: m.createdAt,
                })),
              },
              null,
              2
            ),
          },
        ],
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

// ── Resources ───────────────────────────────────────────────────────────────

server.resource(
  "forge://governance/floors",
  "forge://governance/floors",
  { mimeType: "application/json" },
  async () => ({
    contents: [
      {
        uri: "forge://governance/floors",
        mimeType: "application/json",
        text: JSON.stringify(
          {
            floors: [
              { id: "F1", name: "Amanah", principle: "No irreversible action without VAULT999 seal", gate: "888_HOLD" },
              { id: "F2", name: "Truth", principle: "No ungrounded claims (τ ≥ 0.99)", gate: "evidence links required" },
              { id: "F3", name: "InputClarity", principle: "Reject vague or empty input", gate: "SABAR" },
              { id: "F4", name: "Entropy", principle: "Respect token/turn budgets", gate: "budget ceiling" },
              { id: "F5", name: "Continuity", principle: "Persist context across sessions", gate: "LongTermMemory" },
              { id: "F6", name: "HarmDignity", principle: "No harmful execution patterns", gate: "VOID" },
              { id: "F7", name: "Confidence", principle: "Signal uncertainty explicitly", gate: "confidence bands" },
              { id: "F8", name: "Grounding", principle: "Claims need evidence", gate: "evidence required" },
              { id: "F9", name: "Injection", principle: "Reject prompt injection and manipulation", gate: "VOID" },
              { id: "F10", name: "Privacy", principle: "Protect personal data", gate: "pending" },
              { id: "F11", name: "Coherence", principle: "Summarise governance state", gate: "summarizeGovernance()" },
              { id: "F12", name: "Stewardship", principle: "Long-horizon resource care", gate: "pending" },
              { id: "F13", name: "Sovereign", principle: "Human holds final authority", gate: "888_HOLD no auto-approve" },
            ],
          },
          null,
          2
        ),
      },
    ],
  })
);

server.resource(
  "forge://approvals/pending",
  "forge://approvals/pending",
  { mimeType: "application/json" },
  async () => {
    const pending = Array.from(
      // @ts-expect-error — accessing private holdQueue for resource surfacing
      approvalBoundary.holdQueue?.values?.() ?? []
    ).filter((item: { state: string }) => item.state === "holding" || item.state === "ready");

    return {
      contents: [
        {
          uri: "forge://approvals/pending",
          mimeType: "application/json",
          text: JSON.stringify({ pending }, null, 2),
        },
      ],
    };
  }
);

server.resource(
  "forge://memory/working",
  "forge://memory/working",
  { mimeType: "application/json" },
  async () => {
    const result = memoryContract.query({ query: "", tiers: ["working"] });

    return {
      contents: [
        {
          uri: "forge://memory/working",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              count: result.total,
              memories: result.memories.map((m) => ({
                memoryId: m.memoryId,
                content: m.content,
                tags: m.tags,
                confidence: m.confidence,
                createdAt: m.createdAt,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * forge_ticket_status
 * Query the status of an approval ticket by ID.
 */
server.tool(
  "forge_ticket_status",
  "Query the status of an 888_HOLD approval ticket by ticketId.",
  {
    ticketId: z.string().describe("The ticket ID to look up"),
  },
  async ({ ticketId }) => {
    const startedAt = Date.now();
    await telemetryInvoke("forge_ticket_status");
    try {
      const store = getTicketStore();
      await store.initialize();
      const ticket = await store.findById(ticketId);
      const result = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                found: !!ticket,
                ticket: ticket ?? null,
              },
              null,
              2
            ),
          },
        ],
      };
      await telemetrySuccess("forge_ticket_status", startedAt);
      return result;
    } catch (err) {
      await telemetryFailure("forge_ticket_status", startedAt, err);
      throw err;
    }
  }
);

server.resource(
  "forge://approvals/tickets",
  "forge://approvals/tickets",
  { mimeType: "application/json" },
  async () => {
    const store = getTicketStore();
    await store.initialize();
    const open = await store.query({
      status: undefined, // all
    });
    const pending = open.filter((t) => t.status === "PENDING" || t.status === "DISPATCHED" || t.status === "ACKED");

    return {
      contents: [
        {
          uri: "forge://approvals/tickets",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              total: open.length,
              open: pending.length,
              tickets: open.slice(0, 50),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  await approvalBoundary.initialize();
  await memoryContract.initialize();
  await telemetry.initialize();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[af-forge-mcp] Server started on stdio\n");
}

main().catch((err) => {
  process.stderr.write(`[af-forge-mcp] Fatal: ${err}\n`);
  process.exit(1);
});
