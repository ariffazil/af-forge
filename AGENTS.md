<!-- AGENTS.md — AF-FORGE Agent Workbench -->

# AF-FORGE Agent Workbench — AGENTS.md

> **For AI coding agents working on this codebase.**  
> **Motto:** *Ditempa Bukan Diberi* — Forged, Not Given [ΔΩΨ | ARIF]

---

## Project Overview

AF-FORGE is a **constitutional, event-sourced agent runtime** written in TypeScript. It implements a **Planner/Executor/Verifier triad** architecture with built-in policy gates, governed memory, and human sovereignty controls (888_HOLD).

**Key Philosophy:**
- State is explicit (state machine, not chat loop)
- Memory is governed (single gateway service)
- Tools are risk-scored (reversibility labels)
- Everything is replayable (append-only event log)

**arifOS 000-999 Pipeline:** INIT → SENSE → MIND → HEART → ASI → JUDGE → FORGE → VAULT

The project includes:
- A **Sense/Judge policy layer** (111/888) with F7 confidence estimation
- An **Approval Boundary** system with first-class hold queues
- A **Memory Contract** with 5 memory tiers
- A **PlanValidator** for structural validation of agent plan DAGs
- An **MCP stdio server** exposing governance and agent tools
- An **HTTP bridge server** (Express) for Sense/Judge operations
- A **Personal OS v2** with a 6-verb human interface

---

## Workspace Structure

**The repository root (`/root`) is the active AF-FORGE runtime.**

> **Important:** When older documentation references a path like `AF-FORGE/`, it means the repository root (`/root`), not a nested folder. There is a stale copy at `agent-workbench/` from earlier development — **do not use it**; the canonical source lives directly under `/root/src/`.

**Sibling directories are separate subprojects** and are not governed by this `AGENTS.md`:
- `arifOS/` — Python constitutional kernel (F1–F13) and VAULT999
- `GEOX/` — Wrapper/launcher layer for geospatial services
- `geox/` — Shared geospatial contracts and domain logic
- `geox-gui/` — React cockpit UI
- `geox-site/` — Static web presence
- `control_plane/` — Routing and coordination services
- `execution_plane/` — Calculation and engine services

If work is confined to `arifOS/`, read `arifOS/AGENTS.md` first.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.8+ |
| Module System | ESM (NodeNext resolution) |
| Runtime | Node.js 22+ |
| Test Framework | Built-in `node:test` + `node:assert/strict` |
| Build Tool | `tsc` (TypeScript compiler) |
| Package Manager | npm |
| HTTP Bridge | Express (port 7071, configurable via `AF_FORGE_PORT`) |
| MCP Transport | `@modelcontextprotocol/sdk` (stdio server in `src/mcp/server.ts`) |
| Schema Validation | `zod` (used in MCP server) |

**Key Dependencies (from `package.json`):**
- `express` — HTTP bridge server
- `@modelcontextprotocol/sdk` — MCP server implementation
- `zod` — Schema validation
- `pyright`, `yaml-language-server` — Language services

---

## Build and Test Commands

```bash
# Install dependencies
npm install

# Compile TypeScript → dist/
npm run build

# Run the main test suite (node:test built-in runner)
npm test
# Equivalent to: node dist/test/AgentEngine.test.js

# Run other AF-FORGE test files manually
node dist/test/PlanValidator.test.js
node dist/test/confidence.test.js
node dist/test/governanceViolation.test.js
node dist/test/sense.test.js

# Run a single test and filter output
node dist/test/AgentEngine.test.js 2>&1 | grep -A5 "test name"

# Run example
npm run example:explore
# Equivalent to: node dist/examples/runExploreExample.js

# CLI usage
node dist/src/cli.js <command> [options]

# Start HTTP bridge server
node dist/src/server.js

# Start MCP stdio server
node dist/src/mcp/server.js

# Full trust mode (root-key equivalent — disables all sandboxing)
AGENT_WORKBENCH_TRUST_LOCAL_VPS=1 node dist/src/cli.js explore "scan this repo"
```

**Important:** Always rebuild (`npm run build`) before running tests after making changes. There is no watch mode.

**Directory distinction:**
- `test/` (singular) — AF-FORGE TypeScript tests
- `tests/` (plural) — Python tests for GEOX surfaces; run with `pytest tests/ -v`

---

## Project Structure

Source code lives directly under `src/` (project root is `/root`).

```
src/
├── agents/              # Agent profiles and orchestration
│   ├── CoordinatorAgent.ts    # Planner/Coordinator for multi-agent tasks
│   ├── WorkerAgent.ts         # Worker agent executor
│   └── profiles.ts            # Profile builders (explore, fix, test, coordinator, worker)
├── approval/            # P0.5 Approval Boundary system
│   ├── ApprovalBoundary.ts    # Hold queue, previews, execution records
│   └── index.ts
├── cli/                 # Command-line interface
│   ├── commands.ts            # CLI command implementations
│   └── parseArgs.ts           # Argument parsing
├── cli.ts               # CLI entry point
├── config/              # Runtime configuration
│   └── RuntimeConfig.ts       # Environment-driven config (env vars, paths, policies)
├── continuity/          # P0.1 Session continuity across restarts
│   ├── ContinuityStore.ts     # Persistent session snapshots
│   └── index.ts
├── discovery/           # P0.2 A2A discovery and MCP manifest
│   ├── A2ACard.ts             # Agent card and health status
│   └── index.ts
├── engine/              # Core execution loop
│   ├── AgentEngine.ts         # Main agent loop (LLM calls, tool execution, memory)
│   ├── BudgetManager.ts       # Token and turn budget tracking
│   ├── RunReporter.ts         # Metrics reporting to scoreboard
│   └── redact.ts              # External mode data redaction
├── flags/               # Feature flags and runtime modes
│   ├── featureFlags.ts        # ENABLE_* flags
│   └── modes.ts               # internal_mode vs external_safe_mode
├── governance/          # arifOS 13 Floors constitutional enforcement
│   ├── index.ts               # Governance module exports
│   ├── SealService.ts         # VAULT999 plan-level validation on PlanDAG nodes (not yet wired into AgentEngine)
│   ├── f3InputClarity.ts      # F3: Input clarity validation
│   ├── f4Entropy.ts           # F4: Entropy/risk calculation
│   ├── f6HarmDignity.ts       # F6: Harm and dignity protection
│   ├── f7Confidence.ts        # F7: Confidence estimation
│   ├── f8Grounding.ts         # F8: Evidence grounding checks
│   ├── f9Injection.ts         # F9: Prompt injection detection
│   └── f11Coherence.ts        # F11: Response coherence validation
├── index.ts             # Public API exports
├── jobs/                # Background job management
│   └── BackgroundJobManager.ts
├── llm/                 # LLM provider abstractions
│   ├── LlmProvider.ts         # Interface definition
│   ├── MockLlmProvider.ts     # Mock for testing
│   ├── OllamaProvider.ts      # Ollama local LLM provider
│   ├── OpenAIResponsesProvider.ts  # OpenAI Responses API implementation
│   └── providerFactory.ts     # Provider factory
├── mcp/                 # MCP stdio server
│   ├── server.ts              # Exposes forge tools and resources
│   └── telemetry.ts           # MCP telemetry logging
├── memory/              # Memory management
│   ├── ShortTermMemory.ts     # In-session transcript
│   └── LongTermMemory.ts      # File-backed persistent memory (JSON)
├── memory-contract/     # P0.4 Governed memory with 5 tiers
│   ├── MemoryContract.ts      # store, correct, pin, forget, downgrade, verify
│   └── index.ts
├── personal/            # Personal OS v1 (SovereignLoop, DailyLoop, HumanCLI)
│   ├── DailyLoop.ts
│   ├── HumanCLI.ts
│   ├── SovereignLoop.ts
│   ├── index.ts
│   └── README.md
├── personal-v2/         # Personal OS v2 (Wave 1 Trust Foundation)
│   ├── PersonalOS.ts          # 6-verb human interface
│   ├── index.ts
│   └── README.md
├── planner/             # Plan structural validation
│   └── PlanValidator.ts       # Validates plan DAGs (acyclic, reachable, etc.)
├── policy/              # Sense (111) and Judge (888/F7) policy layer
│   ├── confidence.ts          # F7 confidence proxy + evaluateWithConfidence
│   ├── index.ts
│   └── sense.ts               # Sense Lite/Deep/Auto classification
├── scoreboard/          # Metrics and telemetry
│   ├── ForgeScoreboard.ts     # Weekly task aggregation
│   └── RunMetricsLogger.ts    # Per-run JSON logging
├── server.ts            # AF-FORGE HTTP Bridge Server (Express, port 7071)
├── tools/               # Tool implementations
│   ├── base.ts                # BaseTool abstract class + Tool interface
│   ├── ToolRegistry.ts        # Tool registration and dispatch
│   ├── FileTools.ts           # read_file, write_file, list_files
│   ├── SearchTools.ts         # grep_text
│   └── ShellTools.ts          # run_tests, run_command
├── types/               # TypeScript type definitions
│   ├── agent.ts               # Agent messages, profiles, results
│   ├── jobs.ts                # Job types
│   ├── memory.ts              # Memory record types
│   ├── plan.ts                # Plan DAG and validation types
│   ├── scoreboard.ts          # Scoreboard types
│   ├── session.ts             # Session state and sense types
│   └── tool.ts                # Tool schemas, permissions, results
└── utils/               # Utilities
    ├── fs.ts                  # Filesystem helpers
    └── paths.ts               # Path resolution (sandboxing)

test/
├── AgentEngine.test.ts        # Main test suite (node:test)
├── PlanValidator.test.ts      # Plan DAG validation tests
├── confidence.test.ts         # Confidence estimation tests
├── governanceViolation.test.ts # F3/F6 governance blocking tests
└── sense.test.ts              # Sense/latency space tests

examples/
└── runExploreExample.ts       # Example usage

dist/                  # Compiled JavaScript output (gitignored)
package.json           # NPM manifest
tsconfig.json          # TypeScript configuration (ES2022, NodeNext)
```

---

## Code Style Guidelines

### TypeScript ESM Imports

**CRITICAL:** All intra-package imports **must** use `.js` extensions (NodeNext module resolution):

```typescript
// ✅ CORRECT
import { AgentEngine } from "../engine/AgentEngine.js";
import type { AgentProfile } from "../types/agent.js";

// ❌ WRONG
import { AgentEngine } from "../engine/AgentEngine";
import { AgentEngine } from "../engine/AgentEngine.ts";
```

### TypeScript Configuration

- **Target:** ES2022
- **Module:** NodeNext
- **ModuleResolution:** NodeNext
- **Strict:** true
- **Declaration:** true (generates .d.ts files)
- **OutDir:** dist/
- **RootDir:** .
- **Include:** `src/**/*.ts`, `examples/**/*.ts`, `test/**/*.ts`

### Naming Conventions

- **Files:** PascalCase for class files (e.g., `AgentEngine.ts`), camelCase for utilities
- **Classes:** PascalCase (e.g., `AgentEngine`, `ToolRegistry`)
- **Interfaces:** PascalCase with descriptive names (e.g., `LlmProvider`, `ToolExecutionContext`)
- **Types:** PascalCase (e.g., `AgentProfile`, `ToolResult`)
- **Variables/Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE for true constants, camelCase for others
- **Environment Variables:** `AGENT_WORKBENCH_*` prefix

### Tool Implementation Pattern

When adding a new tool:

1. Extend `BaseTool` from `src/tools/base.ts`
2. Set `name`, `description`, `parameters` (JSON Schema), and `riskLevel` (`"safe" | "guarded" | "dangerous"`)
3. Override `run()` method
4. Register in `buildToolRegistry()` in `src/cli.ts`

Example:

```typescript
export class MyTool extends BaseTool {
  readonly name = "my_tool";
  readonly description = "Does something useful";
  readonly riskLevel = "safe" as const;
  readonly parameters = {
    type: "object" as const,
    properties: {
      arg: { type: "string" as const, description: "An argument" },
    },
    required: ["arg"],
    additionalProperties: false,
  };

  async run(args: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolResult> {
    // Implementation
    return { ok: true, output: "result" };
  }
}
```

---

## Testing Instructions

### Test Framework

- Uses **Node.js built-in `node:test`** and **`node:assert/strict`**
- **No Jest, Vitest, or other external test frameworks**
- Tests are compiled to `dist/test/` and run from there

### Test Patterns

1. **Always build before testing:** `npm run build`
2. **Use isolated temp directories:** Each test creates its own `tmpdir` for memory and file state
3. **Use `ScriptedProvider` for deterministic multi-turn tests:** See `test/AgentEngine.test.ts` for the pattern
4. **Use `MockLlmProvider` for simple tests:** When you don't need scripted turns

### Example Test Structure

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";

class ScriptedProvider implements LlmProvider {
  constructor(private readonly turns: Array<{ content: string; toolCalls?: Array<...> }>) {}
  async completeTurn() {
    const next = this.turns.shift();
    if (!next) throw new Error("No scripted turns left");
    return { /* LlmTurnResponse */ };
  }
}

test("test name", async () => {
  const root = resolve(tmpdir(), `agent-workbench-${Date.now()}`);
  await mkdir(root, { recursive: true });
  // ... test implementation
});
```

---

## Architecture Overview

### Core Execution Flow

1. **CLI** (`src/cli.ts`) parses args → selects an `AgentProfile`
2. **AgentEngine** (`src/engine/AgentEngine.ts`) drives the loop:
   - Runs constitutional governance checks (F3, F6, F9 before execution)
   - Injects relevant `LongTermMemory` entries as system messages
   - Calls `LlmProvider.completeTurn()` each turn
   - Passes tool calls through `ToolRegistry.runTool()` with permission + policy checks
   - Runs per-tool governance (F4, F6, F8 during tool execution)
   - Runs post-tool-batch governance (F11 after each turn's tools finish)
   - Runs post-execution governance (F7 after completion)
   - Appends results to `ShortTermMemory` (in-session transcript)
3. On completion, stores summary in `LongTermMemory` and reports metrics via `RunReporter` → `ForgeScoreboard` + `RunMetricsLogger`

### Governance Floors (arifOS F1–F13)

| Floor | Name | Location | Trigger | Verdicts | Status |
|-------|------|----------|---------|----------|--------|
| F3 | Input Clarity | `src/governance/f3InputClarity.ts` | Pre-execution | PASS, SABAR | ✅ Active (context-adaptive) |
| F4 | Entropy | `src/governance/f4Entropy.ts` | Per-tool | PASS, HOLD | ✅ Active |
| F6 | Harm/Dignity | `src/governance/f6HarmDignity.ts` | Pre-execution + per-tool | PASS, VOID | ✅ Active |
| F7 | Confidence | `src/governance/f7Confidence.ts` | Post-execution | PASS, HOLD | ✅ Active (warning only, context-adaptive) |
| F8 | Grounding | `src/governance/f8Grounding.ts` | Per-tool | PASS, HOLD | ✅ Active |
| F9 | Injection | `src/governance/f9Injection.ts` | Pre-execution | PASS, VOID | ✅ Active |
| F11 | Coherence | `src/governance/f11Coherence.ts` | Post-tool batch | PASS, HOLD | ✅ Active (warning only) |
| F1 | Amanah | `ToolRegistry.runTool()` | Per-tool dangerous execution | 888_HOLD | ⚠️ Enforced via gate |
| F5 | Continuity | `src/continuity/ContinuityStore.ts` | Session persistence | — | ⚠️ Implemented outside governance dir |
| F13 | Sovereign | `AgentEngine` permission context | Dangerous tool approval | 888_HOLD | ⚠️ Enforced via `holdEnabled` |
| F2 | Truth | — | — | — | ⏳ Pending |
| F10 | Privacy | — | — | — | ⏳ Pending |
| F12 | Stewardship | — | — | — | ⏳ Pending |

**Note:** `SealService.ts` performs plan-level VAULT999 validation on `PlanDAG` nodes, but it is **not yet wired into `AgentEngine`**. However, **terminal verdict sealing** via `VaultClient` (FileVaultClient / NoOpVaultClient) is now integrated into the `AgentEngine.run()` post-judge path, ensuring every SEAL / HOLD / SABAR / VOID is persisted to the append-only VAULT999 ledger.

### Policy Layer (Sense 111 / Judge 888 / F7)

- **`src/policy/sense.ts`** — Lite/Deep/Auto query classification. Returns `SenseResult` with `uncertainty_band`, `evidence_count`, `risk_indicators`, and `recommended_next_stage`.
- **`src/policy/confidence.ts`** — F7 proxy confidence calculation (`calculateConfidenceEstimate`) and Judge evaluation (`evaluateWithConfidence`) producing `SEAL`, `HOLD`, or `VOID` verdicts.
- **`src/server.ts`** — HTTP bridge exposing `POST /sense` which runs Sense + Judge and returns structured JSON.

### PlanValidator

- **`src/planner/PlanValidator.ts`** validates agent plan DAGs for structural integrity:
  - Root integrity (no node depends on root)
  - Dependency existence (no phantom dependencies)
  - Acyclicity (no circular dependencies)
  - Reachability (all nodes reachable from root)
  - Depth/branching/complexity bounds

---

## Security Considerations

### Tool Risk Levels

| Risk Level | Gate | Examples |
|------------|------|----------|
| `safe` | ALLOW | repo scan, summarize, test read |
| `guarded` | ON_LOOP | branch create, local edit, package install |
| `dangerous` | **888_HOLD** | delete files, secret handle, docker-compose, merge to protected branch |

### 888_HOLD Gate

The **888_HOLD** is a human sovereignty circuit breaker:
- Blocks high-risk operations until human approval
- Maps to constitutional principle **F13 Sovereign** (Arif holds final authority)
- Required for `dangerous` risk tools
- Implemented in `ToolRegistry.runTool()`: if `permissionContext.holdEnabled` is false, dangerous tools return a hold error instead of executing

### External Safe Mode

When in `external_safe_mode`:
- `run_command` tool is **disabled**
- Both outgoing task text and incoming LLM responses are **redacted** (strips tokens matching `sk-…` patterns and `https://…` references)

### Trust Local VPS Flag

**⚠️ WARNING:** `AGENT_WORKBENCH_TRUST_LOCAL_VPS=1` is a **high-blast-radius** flag equivalent to a root key:
- Sets `allowedCommandPrefixes: ["*"]` (disables shell command filtering)
- Enables `ENABLE_DANGEROUS_TOOLS`, `ENABLE_BACKGROUND_JOBS`, and `ENABLE_EXPERIMENTAL_TOOLS`
- Forces `defaultMode: "internal_mode"`

---

## Environment Configuration

All runtime configuration is in `src/config/RuntimeConfig.ts` via `readRuntimeConfig()`.

### Key Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `AGENT_WORKBENCH_TRUST_LOCAL_VPS` | **⚠️ ROOT-KEY EQUIVALENT** — disables all sandboxing | `0` |
| `AGENT_WORKBENCH_PROVIDER` | LLM provider (`mock`, `openai_responses`, `ollama`) | `mock` |
| `AGENT_WORKBENCH_MODEL` | Model name | `gpt-5` (or `llama3.2` for Ollama) |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `OPENAI_BASE_URL` | OpenAI API base URL | `https://api.openai.com/v1` |
| `OLLAMA_BASE_URL` | Ollama API base URL | `http://localhost:11434` |
| `AGENT_WORKBENCH_LLM_TIMEOUT_MS` | LLM request timeout | `120000` |
| `AGENT_WORKBENCH_COMMAND_TIMEOUT_MS` | Shell command timeout | `30000` |
| `AGENT_WORKBENCH_MAX_FILE_BYTES` | Max file size for read/write | `262144` (256KB) |
| `AGENT_WORKBENCH_ALLOWED_COMMAND_PREFIXES` | CSV of allowed command prefixes | test runners only |
| `AGENT_WORKBENCH_BLOCKED_COMMAND_PATTERNS` | CSV of blocked command patterns | dangerous commands |
| `AGENT_WORKBENCH_MEMORY_PATH` | Long-term memory file path | `~/.agent-workbench/memory.json` |
| `AGENT_WORKBENCH_SCOREBOARD_PATH` | Scoreboard file path | `~/.agent-workbench/scoreboard.json` |
| `AGENT_WORKBENCH_RUN_METRICS_DIR` | Per-run metrics directory | `~/.agent-workbench/metrics` |
| `AGENT_WORKBENCH_DEFAULT_MODE` | Default mode (`internal`, `external`) | `external_safe_mode` |
| `AGENT_WORKBENCH_INPUT_COST_PER_MILLION_TOKENS` | API pricing (input) | `0` |
| `AGENT_WORKBENCH_OUTPUT_COST_PER_MILLION_TOKENS` | API pricing (output) | `0` |
| `ENABLE_DANGEROUS_TOOLS` | Enable dangerous tools | `false` |
| `ENABLE_BACKGROUND_JOBS` | Enable background jobs | `false` |
| `ENABLE_EXPERIMENTAL_TOOLS` | Enable experimental tools | `false` |
| `HUMAN_ESCALATION_WEBHOOK_URL` | Webhook URL for 888_HOLD human expert escalation | — |
| `AF_FORGE_PORT` | HTTP bridge server port | `7071` |

---

## CLI Commands

```bash
# Explore a repository
agent explore --goal "explain this repo" [--mode internal|external] [--cwd path]

# Fix a file
agent fix --file src/file.ts [--issue "what to fix"] [--mode internal|external] [--cwd path]

# Run tests
agent test [--goal "what to validate"] [--mode internal|external] [--cwd path]

# Coordinate multi-agent task
agent coordinate --goal "ship this feature" [--mode internal|external] [--cwd path]

# View scoreboard
agent scoreboard [--period weekly] [--command explore|fix|test|coordinate] [--trust-mode local_vps|default]

# Operator console: query approvals and vault
agent operator approvals [--status <status>] [--sessionId <id>] [--riskLevel <level>]
agent operator vault [--verdict <verdict>] [--sessionId <id>] [--since <iso>] [--until <iso>] [--limit <n>]
```

**Note:** `parseArgs.ts` also recognizes `me` and `os` positional-command prefixes for Personal OS integration, but these are handled separately from the main CLI engine commands.

---

## New Subsystems (Wave 1 Trust Foundation)

### Approval Boundary (`src/approval/`)
- Standardizes action states: `Observe` → `Advise` → `Ready` → `Needs Yes` → `Executed`
- Requires a `preview` object before any side-effectful action
- Persistent hold queue stored at `~/.arifos/approvals.json`
- Global singleton accessible via `getApprovalBoundary()`
- MCP tools: `forge_hold`, `forge_approve`
- MCP resource: `forge://approvals/pending`

### Memory Contract (`src/memory-contract/`)
- 5 memory tiers: `ephemeral`, `working`, `canon`, `sacred`, `quarantine`
- Actions: `store`, `correct`, `pin`, `forget`, `downgrade`, `verify`
- Persisted as JSONL at `~/.arifos/memory.jsonl`
- MCP tools: `forge_remember`, `forge_recall`
- MCP resource: `forge://memory/working`

### Context-Adaptive Thresholds
- `src/governance/thresholds.ts` — Computes per-run thresholds for F3, F7, and F13 based on `intentModel` (`informational` | `advisory` | `execution` | `speculative`) and `riskLevel` (`low` | `medium` | `high` | `critical`).
- F3: `execution`/`critical` requires longer, more detailed input; `informational`/`low` stays permissive.
- F7: Overconfidence/underconfidence bands tighten for high-risk contexts and loosen for low-risk ones.
- F13: `high`/`critical` risk forces `888_HOLD` on dangerous tools regardless of `holdEnabled`.
- Wired into `AgentEngine.run()` via `EngineRunOptions.intentModel` and `riskLevel`.

### Human Expert Escalation (`src/escalation/`)
- `HumanEscalationClient` interface + `WebhookHumanEscalationClient` implementation.
- Dispatches 888_HOLD events to external human reviewers when `riskLevel` is `high` or `critical`.
- Payload includes: `sessionId`, `riskLevel`, `intentModel`, `domain`, `prompt`, `planSummary`, `floorsTriggered`, `telemetrySnapshot`.
- Responses: `APPROVE`, `REJECT`, `MODIFY`, `ASK_MORE`.
- Integrated into `AgentEngine` via `escalationClient` dependency; escalations are sealed into VAULT999 records.
- Metrics: `arifos_human_escalation_total{risk_level, domain}`.
- Environment variable: `HUMAN_ESCALATION_WEBHOOK_URL`.

### MCP Server (`src/mcp/server.ts`)
- Transport: stdio
- Tools:
  - `forge_check_governance` — Run F3/F6/F9 checks
  - `forge_health` — Server health + floor implementation status
  - `forge_run` — Execute a governed agent task (explore profile, real LLM)
  - `forge_hold` — Stage an action for 888_HOLD approval
  - `forge_approve` — Approve a held action
  - `forge_remember` — Store a memory in the MemoryContract
  - `forge_recall` — Query memories from the MemoryContract
- Resources:
  - `forge://governance/floors` — Constitutional floor definitions (F1–F13)
  - `forge://approvals/pending` — Pending approval queue
  - `forge://memory/working` — Working-tier memories

### HTTP Bridge Server (`src/server.ts`)
- Port 7071 (configurable via `AF_FORGE_PORT`)
- Endpoints:
  - `POST /sense` — Run Sense Lite/Deep + F7 confidence evaluation
  - `GET /health` — Service health check
  - `GET /ready` — Readiness probe
  - `GET /operator/approvals` — List approval tickets with optional filters (`status`, `sessionId`, `riskLevel`)
  - `GET /operator/approvals/:ticketId` — Get a single approval ticket
  - `GET /operator/vault` — Search vault seals with optional filters (`sessionId`, `verdict`, `since`, `until`, `limit`)
  - `GET /operator/vault/:sealId` — Get a single vault seal record
  - `GET /metrics` — Prometheus metrics (`arifos_metabolic_stage_duration_seconds`, `arifos_floor_violation_total`)

### Personal OS v2 (`src/personal-v2/`)
- `PersonalOS` class with 6-verb human interface:
  - `remember` → store in MemoryContract
  - `recall` → query MemoryContract
  - `track` → add ContinuityStore watch
  - `think` → reasoning/comparison with memory context
  - `hold` → stage action in ApprovalBoundary
  - `execute` → run approved actions
- Factory: `createPersonalOS()` returns initialized singleton

---

## Deployment & CI

- **Deployment Blueprint:** `APEX/OPERATION/deployment-blueprint.md` — Engineering spec for AKI transport contract, K8s topology, state persistence (VAULT999 + MemoryContract), and Prometheus observability.
- **AKI Types:** `src/types/aki.ts` — TypeScript contracts for the Arif Kernel Interface envelope, verdicts, and JSON-RPC error shapes.
- **Prometheus Metrics:** `src/metrics/prometheus.ts` — `runStage()` instrumentation and `recordFloorViolation()` hooks used in the MCP server and HTTP bridge.
- **Docker Compose:** Multiple compose files exist for different environments:
  - `docker-compose.yml` — Production-like setup with Traefik reverse proxy
  - `docker-compose.local.yml` — Local development
  - `docker-compose.site.yml` — Site-specific deployment
  - `docker-compose.unified.yml` — Unified stack (Dimension-Native Architecture v2)
  - `docker-compose.enterprise.yml` — Enterprise config with load balancer
  - `docker-compose.aaa.yml` — AAA-grade deployment
- **MCP Registry:** `smithery.yaml` and `fastmcp.json` configure MCP server registry deployment
- **CI/CD:** `.github/workflows/ci.yml` runs security scanning (TruffleHog), Python linting (`ruff`), type checking (`mypy`), `pytest`, and a FastMCP HTTP smoke test. **The TypeScript AF-FORGE tests are not currently executed by this CI workflow.**

---

## Constitutional Principles (arifOS F1–F13)

AF-FORGE implements constitutional constraints from arifOS:

| Floor | Principle | Implementation |
|-------|-----------|----------------|
| F1 | Amanah | No irreversible action without VAULT999 seal → `888_HOLD` gate / `dangerous` risk tools |
| F2 | Truth | No ungrounded claims (τ ≥ 0.99) → pending |
| F3 | Input Clarity | Clear task definition required → Pre-execution SABAR check |
| F4 | Entropy | Risk accumulation tracking across tool calls |
| F5 | Continuity | Session persistence → `ContinuityStore` |
| F6 | Harm/Dignity | No harm to humans/dignity → VOID check on task and tools |
| F7 | Confidence | Humility in uncertainty → Post-execution confidence estimate |
| F8 | Grounding | Evidence-based reasoning → Per-tool evidence counting |
| F9 | Anti-Hantu | No deception/manipulation → Injection detection + VOID |
| F10 | Privacy | Protect personal data → pending |
| F11 | Coherence | Internal consistency → Post-tool coherence check |
| F12 | Stewardship | Long-horizon resource care → pending |
| F13 | Sovereign | Human (Arif) holds final authority → `888_HOLD` gates must block |

---

## Notes for AI Agents

1. **The repo root is the active AF-FORGE runtime.** Do not create or edit files under `agent-workbench/`; that directory is a stale copy.
2. **Always use `.js` extensions in imports** — even for `.ts` source files
3. **Rebuild before testing** — no watch mode available
4. **Respect risk levels** — dangerous tools require explicit flags
5. **Test in isolation** — use temp directories, don't pollute working directory
6. **Follow constitutional principles** — F1, F2, F9, F13 are non-negotiable
7. **Use ScriptedProvider for deterministic tests** — see existing tests for patterns
8. **Keep mode-aware** — `internal_mode` vs `external_safe_mode` have different capabilities
9. **Governance is enforced** — F3, F4, F6, F7, F8, F9, F11 floors are active in the engine
10. **Project root is `/root`** — source code is in `src/` directly
11. **MCP server uses `zod`** — schema validation is required for MCP tool definitions
12. **The CI workflow does not run TypeScript tests** — you must run `npm run build && npm test` manually to verify changes
13. **SealService is not wired into AgentEngine** — plan-level VAULT999 validation on PlanDAG nodes exists but is not currently invoked by the runtime loop. Terminal verdict sealing via `VaultClient` is active in `AgentEngine.run()`.
14. **When older docs reference `AF-FORGE/`, they mean the repo root** — do not create a nested `AF-FORGE/` directory

---

*Last updated: 2026-04-13*
