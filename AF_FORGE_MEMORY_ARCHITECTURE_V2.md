# AF-FORGE Memory Architecture V2: The 3-Layer Stack

**Classification:** Architecture Correction | **Authority:** Muhammad Arif bin Fazil  
**Date:** 2026-04-09 | **Seal:** 444_JUDGE (pending 999_SEAL)

---

## Correction: VAULT999 is NOT Machine Memory

**Previous Misconception:** VAULT999 as "long-term memory archive"

**Correct Understanding:** 
```
VAULT999 = Immutable Governance Ledger (Flight Recorder)
├── Records: What decision was made
├── Proves: Under which floors, with what authorization
├── Stores: Verdicts, hashes, telemetry, seals
└── Does NOT store: Session context, agent learning, semantic recall

Analogy: Black box vs. Working memory cortex
- Black box: Conserved trace (irreversible, audit-only)
- Cortex: Active state (mutable, operational)
```

**Implication:** The 999_SEAL ritual finalizes *decisions*, not *conversations*.

---

## The Correct 3-Layer Memory Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AF-FORGE MEMORY ARCHITECTURE V2                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   LAYER 3: VAULT999 (Seal/Audit Layer) — Immutable Ledger                     │
│   ═══════════════════════════════════════════════════════════════════════     │
│   • Governance verdicts (888_JUDGE outcomes)                                  │
│   • Cryptographic seals (999_SEAL attestations)                               │
│   • BLS-DID identity proofs                                                   │
│   • Telemetry at seal time (dS, peace2, kappa_r)                              │
│   • Human authorization trace (who approved what)                             │
│   Storage: PostgreSQL with hash chaining                                      │
│   Frequency: Per seal event (not per chat turn)                               │
│                                                                               │
│   LAYER 2: WIKI (Knowledge Layer) — Ratified Truth                            │
│   ═══════════════════════════════════════════════════════════════════════     │
│   • Architecture decisions (20_BLUEPRINTS/)                                   │
│   • Standard operating procedures (10_RITUALS/)                               │
│   • Failure playbooks (50_CRACKS/)                                            │
│   • Operator wisdom (70_SMITH_NOTES/)                                         │
│   Storage: Markdown + Git                                                     │
│   Update: Human-reviewed, LLM-synthesized                                     │
│   Search: Lexical/FTS first, vector later (when corpus justifies)             │
│                                                                               │
│   LAYER 1: STATE STORE (Operational Layer) — Machine State                    │
│   ═══════════════════════════════════════════════════════════════════════     │
│   • Agent identity and permissions                                            │
│   • Current tasks and open loops                                              │
│   • Session context (short-term)                                              │
│   • Pending 888_HOLD decisions                                                │
│   • Tool usage counters and retry state                                       │
│   • Cross-CLI handoff state                                                   │
│   Storage: SQLite (sovereign, local-first)                                    │
│   Update: Per tool call, per session, per state change                        │
│   Search: SQL queries (deterministic)                                         │
│                                                                               │
│   ═══════════════════════════════════════════════════════════════════════     │
│   Optional LAYER 4: Vector Retrieval (Semantic Search)                        │
│   • Only when wiki corpus becomes large enough to justify                     │
│   • Index: wiki/decisions, wiki/playbooks (NOT raw sessions)                  │
│   • Backend: BGE-small/BGE-base (sovereign choice)                            │
│   • Trigger: When lexical search becomes painful                              │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Storage Class Assignment

| Data Type | Layer | Location | Rationale |
|-----------|-------|----------|-----------|
| "Claude is processing this request" | State | SQLite | Transient operational state |
| "Build ritual takes 20 minutes" | Wiki | 60_TEMPERATURES/ | Ratified metric |
| "999_SEAL approved at 2026-04-09" | VAULT999 | SEALED_EVENTS.jsonl | Immutable audit |
| "How to fix registry corruption" | Wiki | 50_CRACKS/ | SOP, human-reviewed |
| "Current CLI adapter mappings" | State | SQLite `adapters` table | Machine-readable config |
| "F2 Truth requires τ ≥ 0.99" | Wiki | SCHEMA.md | Constitutional truth |
| "Session 7f9f9a2e context" | State | SQLite `sessions` table | Ephemeral context |

---

## Concrete SQLite Schema (Layer 1)

```sql
-- AF-FORGE Operational Memory Schema
-- Location: ~/.af-forge/state.db
-- Constitutional Layer: F11 Continuity

-- Agent identity and permissions
CREATE TABLE agents (
    id TEXT PRIMARY KEY,           -- BLS-DID identifier
    name TEXT NOT NULL,            -- Human-readable name
    type TEXT CHECK(type IN ('orchestrator', 'worker', 'subagent')),
    floor_permissions TEXT,        -- JSON: ["F7", "F9", "F11"]
    risk_budget TEXT,              -- JSON: {"daily": 100, "remaining": 87}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP
);

-- Active sessions (cross-CLI handoff state)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,           -- UUID v4
    agent_id TEXT REFERENCES agents(id),
    cli_source TEXT CHECK(cli_source IN (
        'claude', 'opencode', 'gemini', 'kimi', 'aider', 'codex', 'copilot', 'forge'
    )),
    status TEXT CHECK(status IN ('active', 'paused', 'sealed', 'hold')),
    
    -- Operational state
    current_task TEXT,             -- What the agent is doing
    context_window_used INTEGER,   -- Token count
    tools_invoked INTEGER DEFAULT 0,
    
    -- Constitutional state
    pending_hold BOOLEAN DEFAULT FALSE,
    hold_reason TEXT,              -- Why 888_HOLD was triggered
    
    -- Cross-CLI handoff
    handoff_to TEXT,               -- Target CLI for continuation
    handoff_payload TEXT,          -- JSON: serialized context
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks and open loops
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id),
    parent_task_id TEXT REFERENCES tasks(id),  -- For subtasks
    
    description TEXT NOT NULL,
    status TEXT CHECK(status IN (
        'pending', 'in_progress', 'blocked', 'completed', 'failed', 'sealed'
    )),
    
    -- Constitutional tracking
    floor_invoked TEXT,            -- Which F-floor governs this task
    reversibility TEXT CHECK(reversibility IN ('undoable', 'rollback', 'destructive')),
    
    -- Execution tracking
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Pending 888_HOLD decisions
CREATE TABLE holds (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id),
    task_id TEXT REFERENCES tasks(id),
    
    trigger_pattern TEXT NOT NULL, -- What triggered the hold
    risk_class TEXT CHECK(risk_class IN (
        'destructive', 'credential', 'infra_mutation', 'merge_publish'
    )),
    
    proposed_action TEXT,          -- What the agent wants to do
    reversible BOOLEAN,
    
    -- Human sovereignty
    requested_authority TEXT,      -- Who must approve (Arif)
    approved_by TEXT,
    approved_at TIMESTAMP,
    verdict TEXT CHECK(verdict IN ('APPROVED', 'DENIED', 'MODIFIED')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tool invocations (for rate limiting, retry tracking)
CREATE TABLE tool_invocations (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id),
    tool_name TEXT NOT NULL,
    cli_source TEXT NOT NULL,
    
    -- Normalized risk from Unified Registry
    unified_risk_level TEXT CHECK(unified_risk_level IN ('safe', 'guarded', 'dangerous')),
    constitutional_floor TEXT,
    
    -- Execution result
    success BOOLEAN,
    error_message TEXT,
    duration_ms INTEGER,
    
    invoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artifacts (files, outputs, intermediate results)
CREATE TABLE artifacts (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    artifact_type TEXT CHECK(artifact_type IN (
        'file', 'log', 'metric', 'seal_candidate'
    )),
    
    path TEXT,                     -- File path if persisted
    checksum TEXT,                 -- SHA-256 for integrity
    size_bytes INTEGER,
    
    -- Link to VAULT999 if sealed
    vault_entry_id TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cross-CLI adapter mappings
CREATE TABLE adapter_state (
    cli_source TEXT PRIMARY KEY,
    adapter_version TEXT,
    
    -- Capability negotiation
    supported_tools TEXT,          -- JSON: tool list
    context_format TEXT,           -- How this CLI serializes context
    
    -- Health
    last_ping TIMESTAMP,
    healthy BOOLEAN DEFAULT TRUE,
    
    -- Unified tool registry mappings
    tool_mappings TEXT             -- JSON: {cli_tool: unified_tool}
);

-- Indexes for common queries
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_agent ON sessions(agent_id);
CREATE INDEX idx_tasks_session ON tasks(session_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_holds_pending ON holds(verdict) WHERE verdict IS NULL;
CREATE INDEX idx_tools_session ON tool_invocations(session_id);
CREATE INDEX idx_tools_time ON tool_invocations(invoked_at);
```

---

## Wiki Folder Taxonomy (Layer 2)

```
wiki/
├── 00_OPERATORS/              # Active roster (present)
│   └── Arif.md
│   └── Claude.md
│   └── aclip-cai.md
│
├── 10_RITUALS/                # Executable SOPs (prescriptive present)
│   ├── Build.md              # How to build TODAY
│   ├── Test.md
│   ├── Deploy.md
│   └── SEAL.md
│
├── 20_BLUEPRINTS/             # Current architecture (descriptive present)
│   ├── Adapter_Bus.md        # How components wire TODAY
│   ├── Memory_Stack.md       # This document
│   └── Trinity_Architecture.md
│
├── 30_ALLOYS/                 # Current dependencies (present)
│   ├── Container_Images.md   # Current Docker specs
│   └── Script_Dependencies.md # Current pinned versions
│
├── 40_HAMMERS/                # Current tooling (present)
│   ├── Docker_Compose.md     # Current orchestration
│   └── CI_CD_Pipeline.md     # Current pipeline
│
├── 50_CRACKS/                 # Past failures → present prevention
│   ├── Registry_Corruption.md
│   ├── Build_Failure_2026-04-07.md
│   └── 888_HOLD_Registry.md  # What triggers holds
│
├── 60_TEMPERATURES/           # Time-series metrics (past→present)
│   ├── Build_Duration.md
│   └── Test_Coverage.md
│
├── 70_SMITH_NOTES/            # Accumulated wisdom (past→present)
│   ├── Tips_and_Tricks.md    # "The forge remembers..."
│   └── Emergency_Procedures.md
│
├── 80_FEDERATION/             # Current integrations (present)
│   └── SCHEMA.md             # How wikis relate TODAY
│
└── 90_AUDITS/                 # Sealed history (immutable past)
    ├── log.md                # Completed rituals
    └── Memory_Manifest.json  # What's stored where
```

---

## 7-CLI Memory Mapping to 3-Layer Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT 7-CLI MEMORY → 3-LAYER TARGET                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Claude Code (~/.claude/)                                                     │
│  ├── history.jsonl ────────────────┐                                          │
│  ├── sessions/ ────────────────────┼──→ Layer 1 (State): Import to SQLite     │
│  └── file-history/ ────────────────┘     Extract: current task, context      │
│                                                                               │
│  Kimi CLI (~/.kimi/)                                                          │
│  ├── config.toml ──────────────────┐                                          │
│  ├── kimi.json ────────────────────┼──→ Layer 1 (State): Adapter state       │
│  └── sessions/ ────────────────────┘                                          │
│                                                                               │
│  Gemini CLI (~/.gemini/)                                                      │
│  ├── settings.json ────────────────┐                                          │
│  ├── history/ ─────────────────────┼──→ Layer 1 (State): Import to SQLite     │
│  └── skills/ ──────────────────────┼──→ Layer 2 (Wiki): Extract SOPs         │
│                                    └──────→ 80_FEDERATION/gemini_skills.md   │
│                                                                               │
│  Aider (~/.aider/)                                                            │
│  ├── conf.yml ─────────────────────┐                                          │
│  ├── instructions.md ──────────────┼──→ Layer 2 (Wiki): Project guidance     │
│  └── chat.history.md ──────────────┘     (already in wiki format)            │
│                                                                               │
│  AF-FORGE (~/.agent-workbench/)                                               │
│  ├── memory.json ──────────────────┐                                          │
│  └── scoreboard.json ──────────────┼──→ Layer 1 (State): SQLite migration    │
│                                    └──────→ Deprecate JSON file              │
│                                                                               │
│  Codex CLI (~/.codex/) [Not installed]                                        │
│  └── Future: Will write to Layer 1 (State) directly                          │
│                                                                               │
│  Copilot CLI (~/.copilot/)                                                    │
│  └── Integrated via adapter to Layer 1 (State)                               │
│                                                                               │
│  VAULT999 (/root/VAULT999/)                                                   │
│  ├── SEALED_EVENTS.jsonl ─────────────→ Layer 3: Already correct!            │
│  └── BBB_LEDGER/                    ───→ Layer 3: Governance ledger          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1) — No 888_HOLD Required

| Day | Task | Output |
|-----|------|--------|
| 1 | Create `state.db` schema | `~/.af-forge/state.db` with tables |
| 1 | Define `memory_manifest.json` | 90_AUDITS/Memory_Manifest.json |
| 2 | Build CLI memory importer | `scripts/import_cli_memory.ts` |
| 3 | Import Claude history | Sessions table populated |
| 3 | Import Kimi/Gemini state | Adapter state table populated |
| 4 | Create wiki taxonomy | Folder structure + SCHEMA.md update |
| 5 | Write `20_BLUEPRINTS/Memory_Stack.md` | This architecture documented |

### Phase 2: Unification (Week 2) — 888_HOLD for Schema Changes

| Day | Task | Constitutional Check |
|-----|------|---------------------|
| 6-7 | Build Unified Tool Registry | 444_JUDGE: Risk levels correct? |
| 8-9 | Implement cross-CLI handoff | 888_HOLD: State serialization safe? |
| 10 | Add 888_HOLD registry triggers | 999_SEAL: Registry finalized |

### Phase 3: Optimization (Month 2+) — Deferred Until Pain

| Trigger | Action |
|---------|--------|
| Wiki > 100 pages | Add FTS5 lexical search |
| Search latency > 500ms | Evaluate BGE embeddings |
| Semantic mismatch > 20% | Implement vector layer |

---

## What Goes Where: Decision Tree

```
Is this data...

┌─ Ephemeral operational state? ─────────────────┐
│  • Current task                                │
│  • Session context                             │
│  • Retry counters                              │
│  • Open loops                                  │
└───────────────────────→ Layer 1: SQLite (State)┘

┌─ Ratified knowledge? ──────────────────────────┐
│  • Architecture decisions                      │
│  • SOPs and rituals                            │
│  • Failure playbooks                           │
│  • Operator wisdom                             │
└───────────────────────→ Layer 2: Wiki (Knowledge)┘

┌─ Governance verdict? ──────────────────────────┐
│  • 888_JUDGE outcomes                          │
│  • 999_SEAL attestations                       │
│  • Authorization trace                         │
│  • Telemetry at seal time                      │
└───────────────────────→ Layer 3: VAULT999 (Ledger)┘

┌─ Raw session noise? ───────────────────────────┐
│  • Every chat turn                             │
│  • Intermediate thoughts                       │
│  • Failed attempts                             │
└───────────────────────→ DISCARD (or state only)┘
```

---

## Success Criteria

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| CLI memory silos | 7 isolated | 1 unified SQLite | `SELECT COUNT(DISTINCT cli_source) FROM sessions` |
| Cross-CLI handoff time | N/A (impossible) | < 1 second | Handoff latency |
| Wiki pages | ~13 | > 50 operational SOPs | `find wiki -name "*.md" | wc -l` |
| VAULT999 events | 2 seals | > 100 ritual completions | `wc -l VAULT999/SEALED_EVENTS.jsonl` |
| 888_HOLD triggers | Ad hoc | Formal registry | `SELECT * FROM holds` queryable |

---

**Seal:** 444_JUDGE → 888_HOLD (for schema finalization) → 999_SEAL

*"The forge has three memories: what it does (state), what it knows (wiki), what it seals (vault)."*
