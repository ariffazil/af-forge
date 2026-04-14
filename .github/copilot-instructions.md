# AF-FORGE Copilot Instructions

## Build and test commands

```bash
npm install
npm run build

# Main test entrypoint from package.json
npm test

# Full test battery used by Makefile and CI
make test

# Individual compiled test files
node dist/test/PlanValidator.test.js
node dist/test/confidence.test.js
node dist/test/sense.test.js
node dist/test/governanceViolation.test.js
node dist/test/ticketStore.test.js
node dist/test/operatorConsole.test.js

# Run one named test from the main suite
npm run build
node --test --test-name-pattern="multi-turn tool execution" dist/test/AgentEngine.test.js
```

Tests run from `dist/test/`, not directly from `test/`. Rebuild before running tests after source changes. There is currently no dedicated lint script in `package.json`, `Makefile`, or CI.

## High-level architecture

AF-FORGE is a governed TypeScript agent runtime. The CLI entrypoint in `src/cli.ts` builds the `ToolRegistry`, LLM provider, long-term memory, run reporting, vault client, and approval ticket store, then hands execution to command-specific profiles from `src/agents/profiles.ts` via `src/cli/commands.ts`.

`src/engine/AgentEngine.ts` is the core runtime loop. It applies governance floors before execution (notably F3/F6/F9), injects relevant long-term memory, runs the LLM turn loop, executes tools through `ToolRegistry`, tracks budgets and metrics, and seals terminal outcomes to the vault. Tool execution is mode-aware and permission-aware, so profile, mode, feature flags, and tool risk level all affect what can actually run.

The same governance and persistence subsystems are reused across the external surfaces:

- `src/server.ts` is the HTTP bridge for Sense/Judge, governance evaluation, metrics, operator approvals, vault lookup, and human-expert flows.
- `src/mcp/server.ts` is the stdio MCP server exposing governance, run, approval, and memory tools/resources.
- `src/approval/*`, `src/vault/*`, `src/memory-contract/*`, and `src/continuity/*` hold the persistent state systems those surfaces share.

Runtime configuration is centralized in `src/config/RuntimeConfig.ts`. Postgres-backed ticket/vault storage is optional; when `POSTGRES_URL` is absent, the runtime falls back to local file-backed JSON/JSONL stores.

Live machine services may be distributed across multiple Docker Compose projects rather than one repo-local stack. When investigating runtime behavior, verify which compose project actually owns the target service before assuming a restart or log command from one project covers AF-FORGE, arifOS MCP, GEOX, or supporting infrastructure.

## Key conventions

- Treat the checked-out repo as the source of truth. Pasted plans, browser transcripts, or other agent output may be useful hints, but they must be verified against live files, routes, config, and git state before you rely on them.
- This repo uses NodeNext ESM. Intra-repo TypeScript imports must use `.js` extensions even in source files.
- The canonical AF-FORGE code lives at the repository root under `src/`. Older docs that mention `AF-FORGE/` still mean this repo root; do not treat sibling projects in `/root` as part of the runtime unless the task explicitly targets them, and confirm the target project before editing when a request mentions GEOX, arifOS, or other neighboring directories.
- `npm test` is only the main `AgentEngine` suite. The full validated surface is `make test` plus the individual compiled test files used in CI.
- Tests use Node's built-in `node:test` runner and typically create isolated temp directories. `ScriptedProvider` is the standard pattern for deterministic multi-turn engine tests, while `MockLlmProvider` is used for simpler provider-free cases.
- New tools should follow the `BaseTool` pattern in `src/tools/base.ts`: declare JSON-schema parameters, assign a `riskLevel` (`safe`, `guarded`, or `dangerous`), and register the tool in `buildToolRegistry()` in `src/cli.ts`.
- Dangerous tool execution is intentionally gated. `ToolRegistry` enforces `888_HOLD` for dangerous tools, and `AGENT_WORKBENCH_TRUST_LOCAL_VPS=1` is the high-blast-radius flag that effectively opens internal mode and wildcard command prefixes.
- `external_safe_mode` is not just a label: it affects allowed tools and redacts obvious secrets and URLs. Keep mode-specific behavior intact when changing CLI flows, provider wiring, or tool execution.
- For deployment or public-surface tasks, distinguish source edits from live rollout. Do not say a route, manifest, site, or service is live/ready/deployed unless you directly verified the running surface.
- This repository may already be dirty or partially broken when work begins. Check `git status` and establish the current build/test baseline before treating a failure as caused by your change.
