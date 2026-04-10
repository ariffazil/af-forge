# arifOS Workspace — Copilot Instructions

This repository is a workspace with three active codebases. Work from the correct subdirectory instead of treating `/root` as a single app. If a task is confined to one subproject, read that subproject's local `AGENTS.md` or `CLAUDE.md` after this file.

| Directory | Stack | Role |
|---|---|---|
| `AF-FORGE/` | TypeScript / Node.js 22+ | Agent runtime |
| `arifOS/` | Python 3.12+ / FastMCP | Constitutional kernel and canonical MCP surface |
| `GEOX/` | Python 3.10+ + React 19 | Geospatial co-agent and cockpit UI |

`APEX/`, `WORKFLOWS/`, and `VAULT999/` are supporting docs and ledger material, not the main build targets.

## Build, test, and lint commands

### AF-FORGE (`AF-FORGE/`)

```bash
npm install
npm run build
npm test
node --test --test-name-pattern="stores task summaries" dist/test/AgentEngine.test.js
node dist/src/cli.js <command> [options]
```

Tests run from compiled JavaScript in `dist/test/`, not directly from `test/*.ts`. Rebuild before every test run; there is no watch mode.

### arifOS (`arifOS/`)

```bash
pip install -e ".[dev]"
pytest tests/ -v
pytest tests/test_constitutional.py::test_name -v
ruff check .
black .
mypy --ignore-missing-imports .
python server.py
python ops/runtime/stdio_server.py
make fast-deploy
make reforge
make auto-deploy
make status && make logs && make health
```

### GEOX (`GEOX/`)

```bash
pip install -e ".[dev]"
pytest tests -q
pytest tests/test_file.py -k "test_name" -q
pytest tests --cov=arifos.geox
ruff check arifos/geox/
ruff format arifos/geox/
mypy arifos/geox/
python geox_mcp_server.py

cd geox-gui
npm run dev
npm run typecheck
npm run lint
npm run build
```

GEOX coverage is enforced at `fail_under = 65`.

## High-level architecture

- **AF-FORGE is the TypeScript execution runtime.** `AF-FORGE/src/cli.ts` builds an `AgentEngine` from `ToolRegistry`, the LLM provider factory, `LongTermMemory`, and `RunReporter`. `AgentEngine` handles governance checks, mode-based tool permissions, memory injection, tool execution, and telemetry before persisting a run summary.
- **arifOS is the canonical kernel.** Root `arifOS/server.py` is the supported public entrypoint and decides between the lightweight Horizon gateway and the full sovereign runtime based on environment. The canonical tool flow is `init -> sense -> mind -> heart -> judge -> vault`.
- **GEOX is a federated co-agent.** Root `GEOX/geox_mcp_server.py` adapts to FastMCP 2.x/3.x, exposes MCP tools plus health routes, and degrades gracefully when optional memory, prefab UI, or seismic components are missing. The package itself is layered `THEORY -> ENGINE -> TOOLS -> GOVERNANCE`, with `geox-gui/` as a separate React/Vite cockpit.
- **The projects are meant to work together.** AF-FORGE is the execution shell, arifOS is the constitutional authority, and GEOX is a domain-specific witness that plugs back into arifOS in production.

## Key conventions

- Use the active uppercase project directories: `AF-FORGE/`, `arifOS/`, and `GEOX/`. This repo also contains archived, mirrored, and support directories.
- **AF-FORGE is NodeNext ESM.** Internal imports must use `.js` extensions even in TypeScript source files.
- **AF-FORGE profiles are plain objects.** `src/agents/profiles.ts` exports builder functions returning `AgentProfile` objects; they are not classes.
- **AF-FORGE tests use `node:test` and compiled output.** Multi-turn tests follow the local `ScriptedProvider` pattern in `test/AgentEngine.test.ts`, and tests isolate state with per-test temp directories.
- **arifOS runtime truth lives in code, not stale docs.** `server.py` is the canonical public entrypoint, and the stdio entrypoint is `ops/runtime/stdio_server.py` rather than a root-level script.
- **arifOS and GEOX pytest are configured with `asyncio_mode = "auto"`.** Do not add `@pytest.mark.asyncio` unless a test truly needs custom asyncio behavior.
- **GEOX tools are governance-wrapped.** `@contrast_governed_tool` is part of the contract, and verdicts follow the fixed ladder exported from `arifos/geox/__init__.py`: `SEAL`, `PARTIAL`, `SABAR`, `VOID`.
- **GEOX governance visibility is a product constraint.** In `geox-gui`, governance badges must remain visible; do not treat them as optional decoration.
- **Shared MCP launcher scripts live under `.github/mcp/`.** `arifos-local`, `geox-local`, and `playwright` should be kept aligned across `.mcp.json`, `.claude/mcp.json`, `.cursor/mcp.json`, `.opencode.json`, and `.gemini/settings.json`.
- **Shared infra files may be edited by multiple agents.** Before changing `docker-compose*.yml`, `.env*`, or other deployment config, run `git fetch origin && git status` and reconcile if the branch has moved.
- **High-risk work maps to `888_HOLD`.** Destructive actions, credential handling, and production infra mutations require explicit human approval and should never be auto-approved.
