<<<<<<< HEAD
# AF-FORGE ΔΩΨ — Agent Workbench (TypeScript Runtime)

> **⚠️ SOURCE OF TRUTH:** This is a **TypeScript runtime shell** for the arifOS ecosystem.
> 
> **Canonical doctrine and kernel:** [`ariffazil/arifOS`](https://github.com/ariffazil/arifOS)
> 
> **Runtime truth:** `/health` and `/tools` on deployed arifOS server

**Constitutional Event-Sourced Agent Runtime**  
*Ditempa Bukan Diberi — Forged, Not Given*

> AF-FORGE is not a chatbot wrapper. It is a **governed agentic machine** — a Planner/Executor/Verifier triad running over an append-only event log, with a policy engine, memory gateway, and human sovereignty gate (888_HOLD) baked into the architecture.

---

## Why AF-FORGE Exists

Most agent systems feel chaotic because:
- State is implicit (chat loop, not state machine)
- Memory is dirty (any agent writes anywhere)
- Tools are overpowered (no reversibility labels)
- Nothing is replayable ("what happened?" = guesswork)

AF-FORGE fixes all four by being **a factory, not a karaoke machine**:

| Role | Component | Constraint |
|------|-----------|-----------|
| Worker intelligence | LLM (any provider) | Bounded by policy |
| Foreman | Control plane + policy engine | Risk-scores every action |
| CCTV + ledger | Event store (append-only) | Hash-chained, replayable |
| Safety officer | 888_HOLD gates | Human ratification required |

---

## Architecture

```
ARIF (Sovereign) ──────────────────────────────────────
                        │ 888_HOLD approvals
                   Dashboard / CLI approval queue
                        │
CONTROL PLANE ──────────────────────────────────────────
Policy Engine  →  ALLOW | ON_LOOP | 888_HOLD | DENY
Feature Flags  →  Redis-backed, sovereign-gated
Approval Queue →  ON_LOOP (TTL auto) + 888_HOLD (block)
                        │
AGENT PLANE ────────────────────────────────────────────
Planner   →  goal → steps, CANNOT exec shell/network
Executor  →  bounded tools only, emits structured events
Verifier  →  checks diffs/tests/policy before promotion
                        │
EVENT STORE ────────────────────────────────────────────
Append-only, hash-chained, fully replayable
TASK_CREATED → PLAN_PROPOSED → APPROVAL_REQUIRED
→ TOOL_RUN_STARTED → TOOL_RUN_FINISHED
→ TASK_COMPLETED | TASK_ABORTED
                        │
MEMORY GATEWAY ─────────────────────────────────────────
All reads/writes through one governed service
L1: fast index (TTL)  |  L2: embeddings  |  L3: archive
                        │
VAULT999 ───────────────────────────────────────────────
Immutable seals (arifOS VAULT999 integration)
```

---

## Task State Machine

```
TASK_CREATED
    → PLAN_PROPOSED        (planner emits steps)
    → APPROVAL_REQUIRED    (high-risk action detected)
    → TOOL_RUN_STARTED     (executor begins)
    → TOOL_RUN_FINISHED    (executor done)
    → MEMORY_WRITE_BLOCKED (memory gateway rejected write)
    → TASK_COMPLETED       (verifier approved)
    → TASK_ABORTED         (policy denied or human cancelled)
```

---

## Tool Risk Registry

| Scope | Examples | Gate |
|-------|----------|------|
| `read_only` | repo scan, summarize, test read | ALLOW |
| `write_safe` | branch create, local edit, sandbox test | ON_LOOP |
| `external_network` | package install, web fetch | ON_LOOP |
| `destructive` | delete files, drop tables | **888_HOLD** |
| `credential` | secret handle, .env write | **888_HOLD** |
| `infra_mutation` | docker-compose, traefik | **888_HOLD** |
| `merge_publish` | protected branch merge | **888_HOLD** |

---

## Current Source Structure

```
src/
  agents/          CoordinatorAgent, WorkerAgent (→ becoming Planner/Executor)
  cli/             Command parsing
  config/          RuntimeConfig — env-driven
  engine/          AgentEngine (core loop), BudgetManager, RunReporter
  flags/           FeatureFlags, autonomy modes
  jobs/            BackgroundJobManager
  llm/             LlmProvider interface + OpenAI/Mock providers
  memory/          ShortTermMemory + LongTermMemory
  scoreboard/      ForgeScoreboard metrics, RunMetricsLogger
  tools/           FileTools, SearchTools, ShellTools, ToolRegistry
  types/           Shared contracts
  utils/           fs, paths
```

---

## Upgrade Roadmap (AF-FORGE v1)

### Week 1 — Event Foundation
- [ ] `event_store.ts` — append-only task+event tables, hash-chained
- [ ] `task_fsm.ts` — explicit state machine (replaces chat loop)
- [ ] `approval_queue.ts` — ON_LOOP (TTL) + 888_HOLD (block) routing
- [ ] Replay endpoint — dry-run state reconstruction from event log

### Week 2 — Agent Plane
- [ ] Planner agent — goal→steps, no exec tools
- [ ] Executor agent — bounded tools, emits structured events
- [ ] Tool registry upgrade — reversibility + risk labels per tool
- [ ] Policy engine — ALLOW/ON_LOOP/888_HOLD/DENY risk scoring

### Week 3 — Verification
- [ ] Verifier agent — gates TOOL_RUN_FINISHED → TASK_COMPLETED
- [ ] Evidence maps — every conclusion links to tool outputs
- [ ] Checkpoint summaries — compress state every N events

### Week 4 — Memory Governance
- [ ] Memory gateway — single service, no direct writes by agents
- [ ] TTL + provenance metadata on all memory objects
- [ ] Rollback snapshots — recover from poisoning/drift
- [ ] Runtime feature flags (Redis-backed, sovereign-gated)

---

## Feature Flags

```typescript
// Current (env-based, Week 1)
ENABLE_BACKGROUND_JOBS
ENABLE_EXPERIMENTAL_TOOLS
ENABLE_DANGEROUS_TOOLS

// Planned (Redis-backed, sovereign-gated)
event_sourcing        // Week 1 foundation
planner_executor      // Week 2
policy_engine         // Week 2
verifier_gate         // Week 3
memory_gateway        // Week 4
sabr_daemon           // Future: background autonomous agent
swarm_agents          // Future: only after logs+gates solid
browser_tool          // Future: Playwright
```

---

## Quick Start

```bash
cd af-forge
npm install
npm run build
npm test

# With local VPS trust (high-blast-radius — treat as root key)
AGENT_WORKBENCH_TRUST_LOCAL_VPS=1 node dist/src/cli.js explore "scan this repo"
=======
# Physics9 Earth Witness

> **DITEMPA BUKAN DIBERI** — *Forged, Not Given*  
> **Constitutional Geoscience Platform v2026.04.12**

[![Seal](https://img.shields.io/badge/SEAL-DITEMPA%20BUKAN%20DIBERI-gold)](./wiki/90_AUDITS/999_SEAL.md)
[![Version](https://img.shields.io/badge/version-2026.04.12-blue)](./CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-🟢%20ACTIVE-green)](./DEPLOYMENT_STATUS.md)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**Verified Live URLs:**
- 🌐 <https://geox.arif-fazil.com> — Main web interface
- 🔧 <http://localhost:8000> — MCP endpoint (VPS direct)
- ✅ Status: HTTP 200 verified 2026-04-12

Physics9 is the world's first **Constitutional Subsurface Reasoning Layer**—a governed AI orchestration platform for Earth Intelligence. Built with a Python/FastMCP backend and a React/TypeScript frontend, it acts as a **Judgment Engine** that sits above existing subsurface stacks (like Petrel, Kingdom, or DecisionSpace). Physics9 enforces 13 constitutional floors (F1-F13) to separate observed data from inferred interpretation, ensuring subsurface decisions are physically grounded and audit-trail ready.

## 🎯 Strategic Positioning: The Sovereign Physics Engine

Unlike traditional subsurface OS environments (Petrel, DecisionSpace) which focus on feature breadth and automation speed, Physics9 is built for **Causal Integrity**.

- **Not a Petrel Clone:** Physics9 provides the **Sovereign Logic Layer** that validates interpretations through deterministic physics.
- **Epistemic Governance:** Uses formal verdict semantics (`HOLD`, `PASS`, `FAIL`) to manage interpretation risk and prevent AI hallucinations (hantu).
- **Physics Copilot:** A dimension-first engine that enforces thermodynamic and physical constraints (**PHYSICS_9**) across the interpretative lifecycle.

---

## 🏛️ Architecture

Physics9 implements a dimension-first sovereign architecture, separating borehole truth from basin-scale dynamics across 7 canonical dimensions:

| Dimension | Domain | Scale | Logic / Evidence Contract |
| :--- | :--- | :--- | :--- |
| **Prospect** | Volumetrics | Prospect | Deterministic STOIIP & Decision Gates |
| **Well** | Borehole | 1D | High-fidelity ODSiphon Truth |
| **Section** | Seismic/X-Sec | 2D | Structural & Stratigraphic Correlation |
| **Earth3D** | Volume | 3D | Voxel Interpretation & Cube Integration |
| **Time4D** | Evolution | 4D | Dynamic Simulation & Basin Maturation |
| **Physics** | Metabolic | Meta | PHYSICS_9 State Vector Optimization |
| **Map** | Geospatial | Global | Transversal Geospatial Reference Fabric |

---

## 🛠️ Sovereign MCP Tools (v1.9)

### Bridge & Governance

| Tool | Purpose | Status |
|------|---------|--------|
| `bridge.sync_state` | Synchronize UI with the 888_JUDGE scene. | ACTIVE |
| `bridge.interpret_causal_scene` | Structured synthesis of multiple witnesses. | ACTIVE |
| `bridge.audit_policy_violation` | Formally audit breach of F2/F8/F9 floors. | ACTIVE |
| `bridge.check_operator_legality` | Constitutional pre-flight on physical operations. | ACTIVE |

### Dimensional Kernels
| Tool | Purpose | Scale |
|------|---------|-------|
| `prospect.compute_stoiip` | Deterministic volumetric integration. | Prospect |
| `dim1.borehole_synthesis` | 1D Truth extraction via ODSiphon. | Borehole |
| `dim2.seismic_interpret` | 2D Structural/DHI interpretation logic. | Seismic |
| `dim3.basin_regional` | 3D Basin-scale stratigraphy & play context. | Basin |
| `physics9.verify_state` | Validate thermodynamic equilibrium (F2_PHYSICS). | Meta |

### System
| Tool | Purpose |
|------|---------|
| `geox_health` | Kernel health and 999_SEAL heartbeat. |

---

## 🛠️ MCP Tools (13 Available)

### Foundation (Phase A)
| Tool | Purpose |
|------|---------|
| `geox_load_seismic_line` | Visual mode ignition with P wave analysis |
| `geox_build_structural_candidates` | Inverse modelling constraints |
| `geox_evaluate_prospect` | Governed prospect verdicts (DRO/DRIL/HOLD) |
| `geox_feasibility_check` | Physical possibility firewall |
| `geox_verify_geospatial` | CRS & jurisdiction verification |
| `geox_calculate_saturation` | Monte Carlo Sw calculations |
| `geox_query_memory` | Geological memory retrieval |

### Physics Engine (Phase B)
| Tool | Purpose |
|------|---------|
| `geox_select_sw_model` | SW model admissibility from log QC |
| `geox_compute_petrophysics` | Full petrophysics property pipeline |
| `geox_validate_cutoffs` | Apply CutoffPolicy schema |
| `geox_petrophysical_hold_check` | Trigger 888_HOLD on floor violations |

### Demo
| Tool | Purpose |
|------|---------|
| `geox_malay_basin_pilot` | Malay Basin petroleum exploration data |

### System
| Tool | Purpose |
|------|---------|
| `geox_health` | Server health & constitutional status |

---

## 🌍 Malay Basin Pilot

The **Malay Basin Petroleum Exploration Pilot** is the live demonstration of Physics9 capabilities:

- **Backend:** `arifos/geox/resources/malay_basin_pilot.py`
- **GUI:** `geox-gui/src/components/MalayBasinPilotDashboard.tsx`
- **Live:** https://geox.arif-fazil.com (click "Pilot" tab)

**Features:**
- Real-time exploration metrics (500+ MMBOE cumulative reserves)
- Play type distribution (MMP, LPS, PBD, Fluvial)
- Creaming curve phases (EDP15 baseline)
- Integration with EarthWitness map (auto-zoom to 5.5°N, 104.5°E)
- Constitutional badges (F2 Truth, F9 Physics9, F13 Sovereign)

---

## ⚖️ Constitutional Floors (F1-F13)

All Physics9 operations are governed by 13 constitutional floors:

| Floor | Name | Description |
|-------|------|-------------|
| F1 | Amanah | Reversible, audited operations |
| F2 | Truth | Verdict-based outputs (HOLD/DRO/DRIL) |
| F3 | Tri-Witness | Human × AI × System consensus |
| F4 | Clarity | Zero entropy, 5-line decisions |
| F5 | Peace | Non-adversarial reasoning |
| F6 | Empathy | Care envelope for stakeholders |
| F7 | Humility | Confidence caps at 0.90 |
| F8 | Genius | Multiplicative wisdom (G = A×P×X×E²) |
| F9 | Physics9 | Deterministic physical law adherence |
| F10 | Ontology | Knowledge graph grounded |
| F11 | Audit | Transaction logging |
| F12 | Injection | Input sanitization |
| F13 | Sovereign | Human emergency override |

**Enforcement:** 888_HOLD triggers on any floor violation.

---

## 📚 Documentation

### Wiki (Source of Truth)
The [wiki/](./wiki) directory contains the canonical documentation:

| Section | Purpose |
|---------|---------|
| [00_INDEX](./wiki/00_INDEX) | Gateway & quickstart |
| [10_THEORY](./wiki/10_THEORY) | Theory of Anomalous Contrast, foundations |
| [20_PHYSICS](./wiki/20_PHYSICS) | Physics9, physical laws |
| [30_MATERIALS](./wiki/30_MATERIALS) | RATLAS, geological materials |
| [40_BASINS](./wiki/40_BASINS) | Regional geology (Malay Basin, etc.) |
| [50_TOOLS](./wiki/50_TOOLS) | Complete tool documentation |
| [70_GOVERNANCE](./wiki/70_GOVERNANCE) | Constitutional enforcement |
| [80_INTEGRATION](./wiki/80_INTEGRATION) | Architecture & deployment |
| [90_AUDITS](./wiki/90_AUDITS) | Historical seals & logs |

### Key Documents
- [Agent Initialization Protocol](./wiki/00_INDEX/Agent_Initialization_Protocol.md)
- [Physics9 Manifesto](./wiki/00_INDEX/MANIFESTO.md)
- [Theory of Anomalous Contrast](./wiki/10_THEORY/Theory_of_Anomalous_Contrast.md)
- [Physics9 Basis Vector](./wiki/20_PHYSICS/EARTH_CANON_9.md)
- [MCP Apps Architecture](./wiki/80_INTEGRATION/GEOX_MCP_APPS_ARCHITECTURE.md)
- [FASTMCP CLI Guide](./wiki/80_INTEGRATION/FASTMCP_CLI_GUIDE.md)

---

## 🧪 Testing

```bash
# Run all tests
pytest

# MCP server test
python test_mcp_server.py

# End-to-end test
python test_e2e_mcp.py

# Health check
curl https://geox.arif-fazil.com/health
>>>>>>> upstream/main
```

---

<<<<<<< HEAD
## Constitutional Principles (from arifOS)

- **F1 Amanah** — No irreversible action without VAULT999 seal
- **F2 Truth** — No ungrounded claims (τ ≥ 0.99)
- **F9 Anti-Hantu** — No manipulation, no deception
- **F13 Sovereign** — Arif holds final authority (888_HOLD)

---

## Relation to arifOS

AF-FORGE is the **TypeScript execution runtime** that complements the Python arifOS kernel:

| Layer | Repo | Role |
|-------|------|------|
| Constitutional kernel | `ariffazil/arifOS` | F1-F13, VAULT999, G† physics |
| Agent runtime | `ariffazil/af-forge` | Planner/Executor/Verifier, event store, policy engine |
| Frontend | waw (React 19) | Dashboard, approval inbox |

*AF-FORGE is not a fork or port of any leaked source. Architecture is original, principles distilled from public research.*

---

**Motto:** *Ditempa Bukan Diberi* — Forged, Not Given [ΔΩΨ | ARIF]
=======
## 🚢 Deployment

### VPS (Production)
```bash
# Deploy to VPS
./deploy-vps.sh

# Force rebuild (use when GUI needs refresh)
./deploy-vps.sh --force-rebuild
```

### Horizon (FastMCP Cloud)
```bash
# Automatic deployment on push to main
git push origin main
```

### Local Development
```bash
# Backend
python geox_mcp_server.py

# Frontend
cd geox-gui && npm run dev
```

---

## 📊 Current Status

| Aspect | Status | Notes |
|--------|--------|-------|
| Backend (VPS) | ✅ Operational | MCP Server v2026.04.12 responding |
| Frontend (VPS) | ✅ Operational | Landing page + Cockpit live |
| Landing Page | ✅ Complete | Clean entry point, not crammed cockpit |
| Well Log Viewer | ✅ Complete | LogDock with petrophysics (Canvas/D3) |
| Seismic Engine | ✅ Ignited | Synthetic Physics active |
| MCP Tools | ✅ 13 tools | All phases implemented |
| Malay Basin Pilot | ✅ Full Stack | Live at geox.arif-fazil.com |
| **Constitutional Firewall** | **🆕 EUREKA** | **GPT-5 stress-test PASSED** |

### 🎉 EUREKA-LEVEL Validation (2026-04-10)

**GPT-5 Constitutional Firewall Stress-Test: PASSED**

The Physics9 system successfully blocked hallucination when GPT-5 (via Gemini) queried the Layang-Layang Basin with zero prior data:

- ✅ **F7 Humility Enforced** — Confidence capped at Ω₀ ∈ [0.03, 0.05]
- ✅ **888_HOLD Anticipated** — AI acknowledged constraints before human request
- ✅ **Tri-Witness Consensus** — Human × AI × System alignment verified

**Evidence:** [`wiki/90_AUDITS/EUREKA_VALIDATION_2026_04_10.md`](wiki/90_AUDITS/EUREKA_VALIDATION_2026_04_10.md)

**Next Actions:**
1. Tune Ω₀ parameters for deepwater frontier zones
2. Deploy built `dist/` to VPS
3. Connect LogDock to MCP backend for live LAS data
4. Build Seismic Viewer (WebGL)

---

## 🏗️ Project Structure

```
GEOX/
├── arifos/                      # Constitutional architecture
│   └── geox/
│       ├── tools/
│       │   ├── core.py          # Domain logic (host-agnostic)
│       │   └── adapters/
│       │       └── fastmcp_adapter.py
│       ├── contracts/
│       │   ├── types.py         # Pydantic models
│       │   └── app_manifest.py  # App interface schema
│       ├── ui_bridge/
│       │   └── src/
│       │       └── event_bus.ts # TypeScript JSON-RPC
│       ├── adapters/
│       │   └── copilot_adapter.py
│       └── resources/
│           └── malay_basin_pilot.py
├── geox-gui/                    # React/TypeScript frontend
│   └── src/
│       └── components/
│           ├── LandingPage/        # Clean entry point
│           ├── LogDock/            # Well log viewer
│           ├── MalayBasinPilotDashboard.tsx
│           ├── EarthWitness.tsx
│           └── MainLayout.tsx
├── wiki/                        # Ω-Wiki documentation
│   ├── 00_INDEX/
│   ├── 10_THEORY/
│   ├── 20_PHYSICS/
│   ├── 30_MATERIALS/
│   ├── 40_BASINS/
│   ├── 50_TOOLS/
│   ├── 70_GOVERNANCE/
│   ├── 80_INTEGRATION/
│   └── 90_AUDITS/
├── tests/                       # Test suite
├── geox_mcp_server.py           # FastMCP server entry
├── fastmcp.json                 # CLI configuration
├── pyproject.toml               # Python dependencies
├── Dockerfile                   # Container build
└── docker-compose.yml           # VPS orchestration
```

---

## 📜 License

MIT License — See [LICENSE](./LICENSE)

---

## 👤 Author

**Muhammad Arif bin Fazil**  
Constitutional Authority for Physics9 Earth Witness  
DITEMPA BUKAN DIBERI — *Forged, Not Given*

---

*"Forged through constitutional discipline, not granted by external authority."*
>>>>>>> upstream/main

---

## 🏛️ Trinity Ecosystem — Live Links

| Ring | Domain | Realm | Status |
|------|--------|-------|--------|
| **Ring 1** | [arif-fazil.com](https://arif-fazil.com) | **THE SOUL** | ✅ LIVE |
| **Ring 2** | [arifos.arif-fazil.com](https://arifos.arif-fazil.com) | **THE MIND** | ✅ LIVE |
| **Ring 3** | [aaa.arif-fazil.com](https://aaa.arif-fazil.com) | **THE BODY** | ✅ LIVE |

### 🌐 Documentation & Interface
- **Theory (APEX):** [https://apex.arif-fazil.com](https://apex.arif-fazil.com)
- **Unified Wiki:** [https://wiki.arif-fazil.com](https://wiki.arif-fazil.com)
<<<<<<< HEAD
- **Spatial (GEOX):** [https://geox.arif-fazil.com](https://geox.arif-fazil.com)
=======
- **Spatial (Physics9):** [https://geox.arif-fazil.com](https://geox.arif-fazil.com)
>>>>>>> upstream/main
- **Control Portal:** [https://forge.arif-fazil.com](https://forge.arif-fazil.com)
- **Agent Workspace:** [https://waw.arif-fazil.com](https://waw.arif-fazil.com)

### ⚡ arifOS MCP Endpoints
- **MCP Server:** [https://arifosmcp.arif-fazil.com/mcp](https://arifosmcp.arif-fazil.com/mcp)
- **Health:** [https://arifosmcp.arif-fazil.com/health](https://arifosmcp.arif-fazil.com/health)
- **Tools:** [https://arifosmcp.arif-fazil.com/tools](https://arifosmcp.arif-fazil.com/tools)

<<<<<<< HEAD
**Seal:** VAULT999 | **Verdict:** 999_SEAL | **Alignment:** ΔΩΨ
=======
**Seal:** VAULT999 | **Verdict:** 999_SEAL | **Alignment:** ΔΩΨ
>>>>>>> upstream/main
