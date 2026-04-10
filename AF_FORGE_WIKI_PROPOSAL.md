# AF-FORGE: The Meta-Wiki Proposal

**Classification:** Machine Operation Manual | **Authority:** Muhammad Arif bin Fazil  
**Relationship:** AF-FORGE forges arifOS | **Seal:** VAULT999

---

## 1. The Distinction

| Layer | What It Is | Wiki Type |
|-------|-----------|-----------|
| **arifOS** | The constitutional kernel (the sword) | User/Architecture docs |
| **GEOX** | The domain model (the edge) | Geoscience theory |
| **AF-FORGE** | The furnace (the machine that makes the sword) | **Machine operation logs** |

AF-FORGE is not documented *for* users. It's documented *by* operators to maintain, debug, and evolve the forging apparatus itself.

---

## 2. The Forge Metaphor (Made Literal)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AF-FORGE: THE MACHINE                                          │
│  ═══════════════════════════════════════════════════════════════════════════════════════   │
│                                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│   │   Bellows   │  │   Crucible  │  │   Anvil     │  │   Quench    │  │   Temper    │      │
│   │   (CI/CD)   │  │   (Builder) │  │   (Tester)  │  │   (Deploy)  │  │   (Monitor) │      │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│          │                │                │                │                │             │
│          └────────────────┴────────────────┴────────────────┴────────────────┘             │
│                                    │                                                        │
│                                    ▼                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         THE WORKPIECE: arifOS/GEOX                                   │   │
│   │   Being heated, shaped, tested, hardened, and sealed                                │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         THE FORGE WIKI (What We Need)                               │   │
│   │   - Temperature logs (build metrics)                                                │   │
│   │   - Hammer patterns (agent workflows)                                               │   │
│   │   - Alloy recipes (dependency management)                                           │   │
│   │   - Crack reports (failure modes)                                                   │   │
│   │   - Smith notes (operator wisdom)                                                   │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The AF-FORGE Wiki Structure

```
af-forge/wiki/
│
├── SCHEMA.md                    # Forge constitution (conventions)
├── index.md                     # What's in the forge
├── log.md                       # Chronological operation log
│
├── 00_OPERATORS/                # Human operator guides
│   ├── Shift_Handoff.md         # What to tell next operator
│   ├── Emergency_Procedures.md  # When the forge breaks
│   ├── Tool_Maintenance.md      # Keep the machine running
│   └── New_Smith_Onboarding.md  # Training new operators
│
├── 10_RITUALS/                  # The sacred procedures
│   ├── Pre_Flight_Check.md      # Before starting a build
│   ├── The_000_Init.md          # Genesis ritual (first deploy)
│   ├── The_777_APEX.md          # Judgment ritual (eval)
│   ├── The_888_HOLD.md          # Emergency stop ritual
│   └── The_999_SEAL.md          # Completion ritual
│
├── 20_ALLOYS/                   # Dependency recipes
│   ├── Dependency_Matrix.md     # What mixes with what
│   ├── Version_Pinning.md       # Why we freeze versions
│   ├── Security_Patches.md      # Hot-fix procedures
│   └── Vendor_Drift.md          # When suppliers change
│
├── 30_HAMMERS/                  # Agent tooling patterns
│   ├── Agent_Handoff.md         # How agents pass work
│   ├── Context_Window_Mgmt.md   # Not burning the workpiece
│   ├── Retry_With_Backoff.md    # When strikes miss
│   └── Multi_Agent_Orchestration.md  # Many hammers, one anvil
│
├── 40_TEMPERATURES/             # Build metrics & telemetry
│   ├── Build_Heat_Map.md        # What's expensive to compile
│   ├── Test_Coverage_Flame.md   # Where we need more fire
│   ├── Latency_At_Midnight.md   # When the forge is coldest
│   └── Memory_Pressure_Logs.md  # When the crucible overflows
│
├── 50_CRACKS/                   # Failure modes & fixes
│   ├── Registry_Corruption.md   # When the map breaks
│   ├── Dependency_Hell.md       # Circular alloy problems
│   ├── Context_Explosion.md     # When prompts grow too large
│   ├── Hallucination_In_Prod.md # The worst kind of crack
│   └── Recovery_Procedures.md   # How to weld cracks
│
├── 60_SMITH_NOTES/              # Operator wisdom (like aclip-cai)
│   ├── 2026-04-09_Arif.md       # Personal operator logs
│   ├── 2026-04-08_Claude.md     # Agent operation notes
│   ├── Patterns_That_Work.md    # Successful recipes
│   ├── Anti_Patterns.md         # Things that failed
│   └── Whispered_Tips.md        # Undocumented tricks
│
└── raw/                         # Immutable sources
    ├── build_logs/              # CI/CD raw output
    ├── agent_traces/            # Full agent execution traces
    ├── telemetry/               # Metrics exports
    └── incident_reports/        # Post-mortems
```

---

## 4. Sample Pages

### 4.1 The Forge Ritual (10_RITUALS/The_999_SEAL.md)

```yaml
---
type: Ritual
tags: [deployment, sealing, ceremony]
operator: Arif
date: 2026-04-09
workpiece: arifOS v2026.4.9
temperature: "Production"
status: SEALED
---

# The 999 SEAL Ritual

## Purpose
Mark a workpiece (arifOS/GEOX build) as complete and production-ready.

## Prerequisites
- [ ] All tests pass (777 APEX completed)
- [ ] No 888_HOLD outstanding
- [ ] Documentation updated
- [ ] Operator sanity check passed

## Procedure

### Step 1: Final Heat Check
```bash
arifos verify-sovereignty --target-level 3
# Must return: Level 3 (Sovereign)
```

### Step 2: The Quench (Deploy)
```bash
./deploy-vps.sh --force-rebuild
# Watch for smoke
```

### Step 3: The Seal
```bash
git tag -a v2026.4.9 -m "999_SEAL: Platform sovereign, F1-F13 active"
git push origin v2026.4.9
./seal_now.py
```

### Step 4: Witness Entry
```json
{
  "seal_type": "999",
  "operator": "Arif",
  "witness": ["Claude", "arifOS-Kernel", "VPS-Production"],
  "checksum": "sha256:a3f5c8...",
  "temperature": "Sovereign"
}
```

## Post-Conditions
- VAULT999 entry created
- Telemetry baseline established
- Operator shift can end

## Notes
Today's alloy (dependencies) was stable. No cracks detected.
Next smith should watch: Ollama local LLM memory usage.
```

### 4.2 Smith Notes (60_SMITH_NOTES/2026-04-09_Arif.md)

```yaml
---
type: Smith_Note
operator: Arif
date: 2026-04-09
shift: Morning
temperature: High (major refactoring)
---

# Operator Log: Arif

## What Was Forged
- Adapter Bus Contract for 5 SDKs
- F0 SOVEREIGN floor documentation
- Sovereignty Manifest schema

## Temperature Readings
- Build time: +15% (expected, new adapters)
- Test pass rate: 100%
- Agent handoff latency: 200ms (acceptable)

## Cracks Detected
None. But watch the Microsoft SK adapter—it imports heavy.

## Alloy Notes
Pinned PydanticAI to 0.0.20. Newer versions change `result_type` behavior.

## Whispered Tips
When agents loop on constitutional checks, inject explicit "PROCEED" signal in system prompt. They sometimes need permission to proceed even when all checks pass.

## For Next Smith
The FastMCP transport is running hot (high request volume). Consider horizontal scaling if latency crosses 500ms.
```

### 4.3 Emergency Procedure (00_OPERATORS/Emergency_Procedures.md)

```yaml
---
type: Operator_Guide
severity: CRITICAL
tags: [emergency, 888_HOLD, recovery]
---

# When the Forge Breaks: Emergency Procedures

## Scenario A: 888_HOLD Won't Release

**Symptoms:** Human approved, but system still HOLDing.

**Diagnosis:**
```bash
arifos debug-hold --trace-id <id>
# Check: Is it F13 Sovereign or F12 Injection?
```

**Procedure:**
1. Verify human identity in VAULT999
2. Check for cascading holds (one tool calling another)
3. If stuck: `arifos force-release --authority=Arif --seal=VAULT999`
4. Document in incident_reports/

## Scenario B: Agent Goes Rogue

**Symptoms:** Agent ignoring constitutional checks, making ungoverned calls.

**Diagnosis:**
```bash
grep "arifos_kernel.execute" agent_logs/
# If missing: Agent bypassing kernel!
```

**Procedure:**
1. Immediate: `arifos halt --agent-id <id>`
2. Inspect: Is it using adapter bus or raw SDK calls?
3. Fix: Wrap direct calls with kernel.execute()
4. Penance: Add test case to prevent regression

## Scenario C: Build Is Contaminated

**Symptoms:** Tests pass locally, fail in CI; dependency drift.

**Procedure:**
1. Check alloy (requirements.txt, uv.lock)
2. Verify vendor versions match local
3. Purge build cache: `arifos purge-cache`
4. Rebuild from 000_INIT

## Escalation
If above fails: Wake Arif. This is the nuclear option.
```

---

## 5. The aclip-cai Connection

AF-FORGE wiki is the **machine-readable + human-readable** log of how the internal agent (aclip-cai or equivalent) operates the forge.

```
aclip-cai (Agent)
    │
    ├── reads: 30_HAMMERS/Agent_Handoff.md (how to pass work)
    ├── reads: 20_ALLOYS/Dependency_Matrix.md (what to use)
    ├── writes: 60_SMITH_NOTES/2026-04-09_Claude.md (what happened)
    ├── executes: 10_RITUALS/The_999_SEAL.md (procedures)
    └── alerts: 50_CRACKS/ when something breaks
```

The wiki is **the agent's memory**—not just documentation, but executable procedure.

---

## 6. Do We Need This Wiki?

**Absolutely yes.** Here's why:

| Without AF-FORGE Wiki | With AF-FORGE Wiki |
|----------------------|-------------------|
| Build rituals in Arif's head | Documented, repeatable, teachable |
| Agent behavior drifts | Agent references canonical procedures |
| Cracks recur | Crack patterns recorded, prevented |
| Operator knowledge lost | Smith notes accumulate wisdom |
| Emergency panic | Emergency procedures ready |
| "It worked yesterday" | Temperature logs show exactly what changed |

**The Test:**
> Can a new operator (human or agent) take over the forge and produce a valid arifOS build without asking Arif questions?

Without the wiki: **No.**  
With the wiki: **Yes.** (After onboarding with `00_OPERATORS/New_Smith_Onboarding.md`)

---

## 7. Implementation Path

### Week 1: Foundation
- [ ] Create `af-forge/wiki/` structure
- [ ] Port existing `AGENTS.md` ritual knowledge to `10_RITUALS/`
- [ ] Document current CI/CD as `00_OPERATORS/Shift_Handoff.md`

### Week 2: Temperatures
- [ ] Hook build metrics into `40_TEMPERATURES/`
- [ ] Create first `60_SMITH_NOTES/` entry
- [ ] Document known cracks in `50_CRACKS/`

### Week 3: Automation
- [ ] Agent reads wiki for procedure execution
- [ ] Agent writes smith notes automatically
- [ ] Lint wiki for consistency

---

## 8. Cross-References

| AF-FORGE Wiki | Links To |
|--------------|----------|
| `[[10_RITUALS/The_999_SEAL]]` | `[[arifos::999_SEAL]]` (product seal) |
| `[[50_CRACKS/Context_Explosion]]` | `[[arifos::F7_Humility]]` (confidence caps) |
| `[[30_HAMMERS/Multi_Agent_Orchestration]]` | `[[arifos::Adapter_Bus]]` |
| `[[60_SMITH_NOTES/*]]` | `[[geox::Workflow_Logs]]` (domain operations) |

---

**Seal:** VAULT999 | **Forge Status:** OPERATIONAL | **Next Heat:** As scheduled

*"The sword is forged. The forge is documented. The smiths are trained."*
