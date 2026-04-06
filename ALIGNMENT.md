# Canonical Names & Descriptions: arifOS MCP ↔ Kimi Skills

## Governance Tier (Tier 1)

| MCP Tool | Stage | Kimi Skill Profile | Canonical Description |
|----------|-------|-------------------|----------------------|
| **init_anchor** | 000_INIT | **forge-operator** | Session discipline profile. Establishes identity, scope, and constitutional guardrails (F1–F13) before any work begins. Entry gate for all operator lanes. |
| **apex_soul** | 888_JUDGE | **floor-checker** | Pre-verdict validation profile. Runs Floors F1–F13 against any significant decision or change. Emits 888_HOLD when uncertainty, cost, or irreversibility exceeds thresholds. |
| **vault_ledger** | 999_VAULT | **vault999-auditor** *(planned)* | Immutable audit profile. Logs all final states, vault commits, and irreversible actions with full provenance. No silent changes; everything recorded. |

## Intelligence Tier (Tier 2)

| MCP Tool | Stage | Kimi Skill Profile | Canonical Description |
|----------|-------|-------------------|----------------------|
| **arifOS_kernel** | 444_ROUTER | **swarm-conductor** | Meta-routing orchestration profile. Single entry point for complex multi-step work. Routes tasks to appropriate skills, manages parallel execution, maintains session coherence. |
| **agi_mind** | 333_MIND | **metabolic-loop** | Pipeline governance profile (000–999). Manages the full metabolic cycle: sense → process → decide → act → verify. Enforces stage-appropriate scrutiny at each Δ/Ω/Ψ checkpoint. |
| **asi_heart** | 666_HEART | **floor-checker + forge-operator** | Checkpoint hybrid profile. Applies governance rigor (F1–F13) at 666_HEART transition points. Ensures emotional/ethical alignment before proceeding to 888_JUDGE. |
| *(conductor role)* | Δ/Ω/Ψ routing | **trinity-forger** | Agent role router profile. Assigns Δ (analytical), Ω (synthetic), Ψ (judgmental), or ✓ (verified) modes to sub-tasks within the INTELLIGENCE tier. |

## Machine Tier (Tier 3)

| MCP Tool | Stage | Kimi Skill Profile | Canonical Description |
|----------|-------|-------------------|----------------------|
| **physics_reality** | 111_SENSE | *(domain skills)* | Evidence-gathering execution profile. Read-only sensors: search, fetch, read, analyze. Safe to run without HOLD. Provides grounded data to upper tiers. |
| **math_estimator** | cost/entropy calc | *(inline)* | Calculation execution profile. Estimates entropy, cost, complexity, and risk before infrastructure changes. Required input for 888_JUDGE decisions. |
| **engineering_memory** | 555_MEMORY | **web-architect**, **vps-operator** | Design + ops execution profile. web-architect handles architectural design; vps-operator handles infrastructure operations. Both log to 555_MEMORY before 888/999. |
| **code_engine** | build/test | **vps-operator** *(infra_mutation)* | Build and deployment execution profile. Gated by math_estimator and apex_soul. Crosses into destructive territory only after 888_HOLD cleared. |
| **architect_registry** | patterns/catalog | **web-architect** *(design side)* | Pattern catalog execution profile. Maintains reusable architectural patterns, decision records, and design artifacts in the registry. |

---

## Quick Reference: 7 Kimi Skills Mapped

| Kimi Skill | MCP Alignment | One-Line Role |
|------------|--------------|---------------|
| **forge-operator** | init_anchor (000_INIT) discipline | Session gatekeeper; F1–F13 enforcer; identity anchor |
| **floor-checker** | apex_soul (888_JUDGE) + asi_heart (666_HEART) | Pre-verdict validator; HOLD emitter; floor runner |
| **swarm-conductor** | arifOS_kernel (444_ROUTER) orchestration | Meta-router; task dispatcher; parallel coordinator |
| **metabolic-loop** | agi_mind (333_MIND) pipeline | Full-cycle governor; 000→999 stage manager |
| **trinity-forger** | Δ/Ω/Ψ role router | Mode assigner; agent typology enforcer |
| **web-architect** | engineering_memory (555_MEMORY) + architect_registry | Design executor; pattern librarian; safe builder |
| **vps-operator** | engineering_memory (555_MEMORY) + code_engine | Ops executor; infra mutator; gated deployer |

---

## Culture Reminders

1. **Always enter via init_anchor / forge-operator** → Identity + discipline first
2. **Complex work routes through arifOS_kernel / swarm-conductor** → One brain, many hands
3. **Serious decisions pass apex_soul / floor-checker** → Judge Floors, maybe 888_HOLD
4. **Final states log to vault_ledger / vault999-auditor** → No silent changes
5. **Destructive actions require 888_HOLD clearance** → Cost-aware, reversible-first

---

## Usage Pattern

When speaking to humans, lead with **MCP names** (they're canonical), then note the skill profile:

> *"I'll invoke **apex_soul** (via the floor-checker profile) to validate this before we proceed..."*

> *"Routing through **arifOS_kernel** (swarm-conductor) to parallelize these tasks..."*

> *"This is a **physics_reality** read; no HOLD needed yet."*
