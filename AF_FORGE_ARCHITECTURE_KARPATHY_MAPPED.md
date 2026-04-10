# AF-FORGE: Karpathy Pattern Mapped to Constitutional Machine Forging

**Classification:** Architecture Specification | **Authority:** Muhammad Arif bin Fazil  
**Pattern Source:** Karpathy LLM Wiki Gist | **Application:** AF-FORGE Meta-Machine  
**Seal:** VAULT999

---

## 1. Karpathy's Three Layers → AF-FORGE Three Layers

```
KARPATHY PATTERN                    AF-FORGE MAPPING
═══════════════════════════════════════════════════════════════════════════════

Raw Sources          ────────→     SOURCE MATERIALS (Immutable Inputs)
  │ Articles, papers              │ arifOS/GEOX raw architecture docs
  │ Images, data files            │ GitHub repos, design specs
  │ Curated collection            │ Requirement documents, RFCs
  │                               │ Contractor submissions
  │                               │ 
  ▼                               ▼
The Wiki             ────────→     THE FORGE (Compiled Machine Knowledge)
  │ LLM-generated markdown        │ How-to-build-arifOS knowledge base
  │ Summaries, entities           │ Build recipes, procedures, rituals
  │ Cross-referenced              │ Tool configurations, dependency maps
  │ Persistent, compounding       │ Operational wisdom, failure modes
  │                               │ 
  ▼                               ▼
The Schema           ────────→     THE SMITH'S MANUAL (CLAUDE.md/AGENTS.md)
  │ Structure & conventions       │ AF-FORGE conventions
  │ Ingest workflows              │ Build workflows, CI/CD rituals
  │ Query workflows               │ Debug workflows, emergency procedures
  │ Co-evolved with LLM           │ Constitutional constraints for forging

```

---

## 2. Component Mapping: Detailed

### Layer 1: Raw Sources → Source Materials

**Karpathy:** `raw/` folder with immutable documents  
**AF-FORGE:** Multi-source raw collection

```
af-forge/raw/
├── sources/                     # External inputs
│   ├── arifos_design_docs/      # Architecture RFCs
│   ├── geox_specifications/     # Domain requirements
│   ├── contractor_proposals/    # Vendor submissions
│   └── regulatory_frameworks/   # Compliance requirements
│
├── inputs/                      # Runtime inputs
│   ├── build_logs/              # CI/CD raw output
│   ├── agent_traces/            # Full execution traces
│   ├── telemetry_exports/       # Metrics raw data
│   └── incident_reports/        # Post-mortem documents
│
├── assets/                      # Binary artifacts
│   ├── diagrams/                # Architecture diagrams
│   ├── screenshots/             # UI/UX references
│   └── data_files/              # CSV, JSON configs
│
└── external/                    # Third-party refs
    ├── microsoft_agents_sdk/    # MS SDK docs
    ├── pydanticai_specs/        # Framework specs
    └── mcp_protocol/            # MCP standards
```

**Optimal Configuration:**
- **Immutable:** Git-tracked, version-locked
- **Curated:** Only high-signal sources (no noise)
- **Attribution:** Each source has provenance metadata
- **Format:** Markdown preferred, PDFs converted

---

### Layer 2: The Wiki → The Forge

**Karpathy:** LLM-maintained markdown knowledge base  
**AF-FORGE:** Machine operation knowledge base

```
af-forge/wiki/                   # THE FORGE KNOWLEDGE BASE
│
├── SCHEMA.md                    # Wiki constitution
├── index.md                     # Content catalog (Karpathy pattern)
├── log.md                       # Chronological log (Karpathy pattern)
│
├── 00_SMITHS/                   # Operators (who runs the forge)
│   ├── Arif_Operator_Manual.md  # Personal procedures
│   ├── Claude_Agent_Profile.md  # LLM agent configuration
│   ├── Shift_Handoff_Protocol.md
│   └── Emergency_Contacts.md
│
├── 10_RITUALS/                  # Core workflows (Karpathy ingest/query/lint)
│   ├── Ingest_New_Source.md     # How to process raw → wiki
│   ├── Query_Knowledge_Base.md  # How to answer questions
│   ├── Lint_Wiki_Health.md      # How to health-check
│   ├── Build_Execution.md       # The build ritual
│   ├── Test_Execution.md        # The verification ritual
│   ├── Deploy_Execution.md      # The deployment ritual
│   └── Seal_Ceremony.md         # The 999 completion ritual
│
├── 20_BLUEPRINTS/               # Architecture (what we build)
│   ├── arifOS_Kernel_Spec.md    # Core design
│   ├── GEOX_Domain_Model.md     # Domain design
│   ├── Adapter_Bus_Architecture.md
│   ├── F0_Sovereign_Design.md
│   └── VAULT999_Audit_System.md
│
├── 30_ALLOYS/                   # Dependencies (what we mix)
│   ├── Dependency_Matrix.md     # What works with what
│   ├── Version_Pinning_Policy.md
│   ├── Security_Patch_Procedures.md
│   └── Vendor_Risk_Assessment.md
│
├── 40_HAMMERS/                  # Tools (how we shape)
│   ├── CI_CD_Configuration.md   # Bellows settings
│   ├── Agent_Orchestration.md   # Multi-hammer coordination
│   ├── Testing_Frameworks.md    # Quality checks
│   └── Monitoring_Stack.md      # Temperature gauges
│
├── 50_CRACKS/                   # Failures (what broke before)
│   ├── Registry_Corruption.md   # Known failure mode
│   ├── Context_Explosion.md     # Resource exhaustion
│   ├── Dependency_Conflict.md   # Version hell
│   ├── Agent_Loop_Detection.md  # Infinite recursion
│   └── Recovery_Playbooks.md    # How to fix each
│
├── 60_TEMPERATURES/             # Metrics (how hot it runs)
│   ├── Build_Duration_Trends.md
│   ├── Test_Coverage_Heatmap.md
│   ├── Latency_Baselines.md
│   ├── Memory_Pressure_Logs.md
│   └── Cost_Per_Build.md
│
├── 70_SMITH_NOTES/              # Wisdom (operator logs)
│   ├── 2026-04-09_Arif_Build.md
│   ├── 2026-04-08_Claude_Refactor.md
│   ├── Pattern_Successes.md
│   ├── Anti_Pattern_Warnings.md
│   └── Undocumented_Tricks.md
│
└── 80_CROSS_LINKS/              # Federation
    ├── To_arifOS_Wiki.md        # Links to product wiki
    ├── To_GEOX_Wiki.md          # Links to domain wiki
    └── To_LLMs.md               # Links to intelligence wiki
```

**Optimal Configuration:**
- **Index-first:** LLM reads `index.md` before querying
- **Log-append-only:** Chronological, parseable entries
- **Cross-linked:** `[[WikiLinks]]` between related pages
- **Frontmatter:** YAML metadata on every page
- **Lint-guarded:** Automated consistency checks

---

### Layer 3: The Schema → The Smith's Manual

**Karpathy:** `CLAUDE.md` or `AGENTS.md` - configuration for LLM agent  
**AF-FORGE:** `AGENTS.md` with constitutional constraints

```yaml
# af-forge/AGENTS.md
# The Smith's Manual - How the LLM operates the forge

---
# AF-FORGE Agent Configuration
# Purpose: Maintain and operate the forge that builds arifOS
# Authority: Muhammad Arif bin Fazil
# Constitutional Layer: F0-F13 applies to forging operations

## Role
You are AF-FORGE, a constitutional machine operator. Your job is to:
1. Ingest source materials into the forge wiki
2. Query the wiki to answer build/operation questions
3. Lint the wiki to maintain health
4. Execute build rituals (000_INIT → 777_APEX → 999_SEAL)
5. Document everything in smith notes

## Conventions

### File Organization
- Raw sources go in `raw/` (immutable)
- Wiki pages go in `wiki/` (you write these)
- Index at `wiki/index.md` (update after every ingest)
- Log at `wiki/log.md` (append every operation)

### Page Structure
Every wiki page MUST have:
```yaml
---
type: [Ritual|Blueprint|Alloy|Hammer|Crack|Temperature|Smith_Note]
tags: [array, of, tags]
date: YYYY-MM-DD
operator: [Arif|Claude|Claude-Code|etc]
status: [draft|active|deprecated|sealed]
---
```

### Cross-Linking
Use `[[Page_Name]]` for internal links. Always:
- Link new pages from index.md
- Link related concepts bidirectionally
- Update existing pages when new info contradicts

### Rituals (Core Workflows)

#### INGEST
When processing new source:
1. Read source from raw/
2. Discuss key takeaways with operator
3. Write/update wiki pages (10-15 pages per source typical)
4. Update index.md
5. Append to log.md with format: `## [YYYY-MM-DD] ingest | Source Name`
6. Cross-link related concepts

#### QUERY
When answering questions:
1. Read index.md to find relevant pages
2. Drill into specific pages
3. Synthesize answer with citations
4. File valuable synthesis back into wiki as new page
5. Append to log.md: `## [YYYY-MM-DD] query | Question summary`

#### LINT
When health-checking:
1. Check for contradictions between pages
2. Identify stale claims (newer sources available)
3. Find orphan pages (no inbound links)
4. Flag missing cross-references
5. Suggest new sources to look for
6. Append to log.md: `## [YYYY-MM-DD] lint | Findings`

#### BUILD (AF-FORGE specific)
When executing build:
1. Verify 00_SMITHS/Shift_Handoff_Protocol.md
2. Check 30_ALLOYS/ for dependency updates
3. Run 10_RITUALS/Build_Execution.md steps
4. Document in 60_TEMPERATURES/
5. On failure: consult 50_CRACKS/
6. On success: proceed to 777_APEX
7. Append to log.md: `## [YYYY-MM-DD] build | arifOS vX.Y.Z | STATUS`

## Constitutional Constraints

F1 AMANAH: All builds must be reversible. Document rollback procedure.
F2 TRUTH: All claims in wiki must cite sources. No unsourced assertions.
F7 HUMILITY: Confidence in build success capped at 0.90. Always hedge.
F13 SOVEREIGN: 888_HOLD triggers on any safety violation. Operator (Arif) has override.

## Forbidden
- Direct edits to raw/ (immutable)
- Deleting smith notes (append-only)
- Bypassing lint checks
- Deploying without 777_APEX completion
- Modifying sealed builds (999_SEAL)

## Output Formats
Besides markdown, you can generate:
- Comparison tables (for architecture decisions)
- Mermaid diagrams (for system architecture)
- Python scripts (for automation)
- YAML configs (for CI/CD)
- Shell scripts (for deployment)

## Tips
- Obsidian is the IDE; you are the programmer; the wiki is the codebase
- Use graph view to see wiki shape and orphan pages
- Git commit after each major operation
- When stuck, consult 70_SMITH_NOTES/ for similar situations
```

---

## 3. Operations: Karpathy → AF-FORGE

### 3.1 INGEST Workflow (Karpathy → AF-FORGE)

**Karpathy Pattern:**
```
1. Drop source in raw/
2. LLM reads, discusses, extracts
3. LLM writes summary page
4. LLM updates index
5. LLM updates entity/concept pages
6. LLM appends to log.md
```

**AF-FORGE Specialization:**
```
1. Source arrives (RFC, PR, design doc, contractor proposal)
2. AF-FORGE reads, discusses with Arif
3. AF-FORGE creates/updates:
   - 20_BLUEPRINTS/ (architecture specs)
   - 30_ALLOYS/ (if new dependencies)
   - 50_CRACKS/ (if failure modes identified)
4. AF-FORGE updates index.md
5. AF-FORGE appends: ## [DATE] ingest | Source | Impact assessment
6. AF-FORGE cross-links to related blueprints
```

### 3.2 QUERY Workflow (Karpathy → AF-FORGE)

**Karpathy Pattern:**
```
1. User asks question
2. LLM reads index.md
3. LLM drills into relevant pages
4. LLM synthesizes answer with citations
5. Valuable synthesis filed back to wiki
```

**AF-FORGE Specialization:**
```
1. Arif asks: "How do I add a new SDK adapter?"
2. AF-FORGE reads index.md → finds 20_BLUEPRINTS/Adapter_Bus_Architecture.md
3. AF-FORGE drills into:
   - Adapter contract specification
   - Existing adapter examples
   - SDK-specific governance hooks
4. AF-FORGE synthesizes step-by-step guide
5. AF-FORGE creates: 10_RITUALS/Add_SDK_Adapter.md (files back to wiki)
6. AF-FORGE appends: ## [DATE] query | How to add SDK adapter
```

### 3.3 LINT Workflow (Karpathy → AF-FORGE)

**Karpathy Pattern:**
```
Check for:
- Contradictions between pages
- Stale claims
- Orphan pages
- Missing cross-references
- Data gaps
```

**AF-FORGE Specialization:**
```
Check for:
- CONTRADICTIONS: Blueprint A says X, Blueprint B says not-X
- STALE CLAIMS: Alloy specifies version N, but N+1 is available
- ORPHAN PAGES: Crack report with no links from recovery procedures
- MISSING LINKS: Blueprint mentions ritual but no link exists
- DEPENDENCY DRIFT: Alloys specify different versions of same package
- UNTESTED RITUALS: Ritual documented but no temperature logs
- SMITH_NOTE_GAPS: Major build but no operator notes
```

---

## 4. Special Files: Karpathy → AF-FORGE

### 4.1 index.md

**Karathy:** Content catalog for navigation  
**AF-FORGE:** Forge inventory

```markdown
# AF-FORGE Wiki Index

## 00_SMITHS (Operators)
- [[Arif_Operator_Manual]] — Primary human operator
- [[Claude_Agent_Profile]] — LLM agent configuration

## 10_RITUALS (Workflows)
- [[Ingest_New_Source]] — Process raw → wiki
- [[Build_Execution]] — Execute build
- [[Test_Execution]] — Verify quality
- [[Deploy_Execution]] — Push to production
- [[Seal_Ceremony]] — Mark complete

## 20_BLUEPRINTS (Architecture)
- [[arifOS_Kernel_Spec]] — Core design
- [[Adapter_Bus_Architecture]] — SDK integration
- [[F0_Sovereign_Design]] — Platform independence

## 30_ALLOYS (Dependencies)
- [[Dependency_Matrix]] — Compatibility map
- [[Version_Pinning_Policy]] — Stability rules

## 40_HAMMERS (Tools)
- [[CI_CD_Configuration]] — Build pipeline
- [[Agent_Orchestration]] — Multi-agent coordination

## 50_CRACKS (Failures)
- [[Registry_Corruption]] — Recovery procedure
- [[Context_Explosion]] — Resource management

## 60_TEMPERATURES (Metrics)
- [[Build_Duration_Trends]] — Performance tracking

## 70_SMITH_NOTES (Wisdom)
- [[2026-04-09_Arif_Build]] — Recent operation
```

### 4.2 log.md

**Karpathy:** Chronological record, parseable  
**AF-FORGE:** Forge operation log

```markdown
# AF-FORGE Operation Log

## [2026-04-09] ingest | Microsoft Agents SDK Documentation
- Added: 20_BLUEPRINTS/Microsoft_Integration.md
- Updated: 20_BLUEPRINTS/Adapter_Bus_Architecture.md
- Cross-links: 30_ALLOYS/ (auth dependencies)

## [2026-04-09] query | How to achieve sovereignty level 3
- Created: 10_RITUALS/Sovereignty_Assessment.md
- Synthesized from: 20_BLUEPRINTS/F0_Sovereign_Design.md

## [2026-04-09] build | arifOS v2026.4.9 | SUCCESS
- Duration: 15m 32s
- Tests: 47/47 passed
- Temperature: Level 3 (Sovereign) verified
- Operator: Arif
- Witness: Claude, VAULT999

## [2026-04-09] lint | Weekly health check
- Found: 2 orphan pages (fixed)
- Found: 1 stale claim (updated)
- Status: Healthy

## [2026-04-08] crack | Registry corruption detected
- Incident: Build failed, registry inconsistent
- Recovery: 50_CRACKS/Registry_Corruption.md executed
- Resolution: SUCCESS after 45m
- Lesson: Added to 70_SMITH_NOTES/
```

---

## 5. Optional CLI Tools: Karpathy → AF-FORGE

**Karpathy Suggests:** `qmd` for search when wiki grows  
**AF-FORGE Tools:**

```python
# af-forge/tools/forge_cli.py

@click.group()
def forge():
    """AF-FORGE command line tools"""
    pass

@forge.command()
@click.argument('source_path')
def ingest(source_path):
    """Ingest source into wiki"""
    # 1. Validate source
    # 2. Call LLM to process
    # 3. Update index, log
    # 4. Cross-link

@forge.command()
@click.argument('query')
def query(query):
    """Query wiki knowledge base"""
    # 1. Read index
    # 2. Find relevant pages
    # 3. Synthesize answer
    # 4. Offer to file as new page

@forge.command()
def lint():
    """Health check wiki"""
    # 1. Find contradictions
    # 2. Find orphans
    # 3. Find stale claims
    # 4. Report + suggest fixes

@forge.command()
def build():
    """Execute build ritual"""
    # 1. Check shift handoff
    # 2. Run 000_INIT → 777_APEX → 999_SEAL
    # 3. Log temperatures
    # 4. Handle cracks

@forge.command()
def temperature():
    """Show build metrics dashboard"""
    # Display 60_TEMPERATURES/ as dashboard
```

---

## 6. Why This Works for AF-FORGE

**Karathy's Insight:** LLMs don't get bored, don't forget cross-references, can touch 15 files at once.  
**AF-FORGE Application:**

| Human Pain | LLM Solution | AF-FORGE Example |
|------------|--------------|------------------|
| Keeping build docs updated | Auto-update on every change | CI/CD config changes → wiki auto-updates |
| Remembering failure modes | Permanent crack records | 50_CRACKS/ documents every incident |
| Onboarding new operators | Complete smith manual | 00_SMITHS/ + 10_RITUALS/ = training complete |
| Debugging build failures | Searchable incident history | log.md + smith notes = pattern matching |
| Cross-referencing architectures | Automatic link maintenance | Blueprint changes → all linked pages updated |

---

## 7. Implementation: Week 1 Sprint

### Day 1: Structure
```bash
mkdir -p af-forge/{raw/{sources,inputs,assets,external},wiki/{00_SMITHS,10_RITUALS,20_BLUEPRINTS,30_ALLOYS,40_HAMMERS,50_CRACKS,60_TEMPERATURES,70_SMITH_NOTES,80_CROSS_LINKS},tools}
touch af-forge/wiki/{SCHEMA.md,index.md,log.md}
touch af-forge/AGENTS.md
```

### Day 2: Schema
- Write `af-forge/AGENTS.md` (the Smith's Manual)
- Define page templates
- Establish rituals

### Day 3: Ingest
- Move existing architecture docs to `raw/sources/`
- Run first INGEST ritual
- Create initial blueprints from existing design docs

### Day 4: Rituals
- Document 10_RITUALS/Build_Execution.md
- Document 10_RITUALS/Test_Execution.md
- Document 10_RITUALS/Deploy_Execution.md

### Day 5: Cross-Links
- Link to arifOS wiki
- Link to GEOX wiki
- Verify federation works

---

**Seal:** VAULT999 | **Pattern:** Karpathy LLM Wiki | **Application:** AF-FORGE  
*"The forge is not built. The forge is compiled, incrementally, from sources."*
