# AF-FORGE Wiki Log

## [2026-04-09] bootstrap | initial forge wiki scaffold
- Established the first AF-FORGE wiki tree.
- Added early sections for operators, rituals, blueprints, cracks, temperatures, federation, and audits.
- Seeded pages for reconnect/recovery, memory stack, live status, and three-wiki mapping.

## [2026-04-10] normalize | proper AF-FORGE wiki established
- Upgraded AF-FORGE from a partial scaffold into a proper persistent wiki for VPS infrastructure and components.
- Expanded `SCHEMA.md` to define AF-FORGE as the infrastructure wiki using the raw/wiki/schema/index/log pattern.
- Copied core repo docs into `wiki/raw/` for grounding:
  - `README.md`
  - `MAP.md`
  - `ARCHITECTURE.md`
  - `VPS_NATIVE.md`
  - `ROADMAP.md`
  - `RUNTIME_POLICY.md`
  - `package.json`
- Added or refreshed core operational pages:
  - `10_RITUALS/Build.md`
  - `20_BLUEPRINTS/Stack_Components.md`
  - `20_BLUEPRINTS/Adapter_Bus.md`
  - `30_ALLOYS/Dependency_Surface.md`
  - `40_HAMMERS/Operational_Tooling.md`
  - `90_AUDITS/Memory_Manifest.md`
- Rewrote `index.md` so navigation reflects the actual live wiki tree.
- Filled missing links that previously pointed to pages that did not exist.
- Added frontmatter to `20_BLUEPRINTS/Memory_Stack.md` so it participates cleanly in the wiki schema.

## [2026-04-10] federation | three-wiki gateway strengthened
- Promoted `80_FEDERATION/Three_Wikis_Map.md` into a real federation gateway from the AF-FORGE side.
- Updated `index.md` so federation is visible at the top-level start path.
- Tightened the language so AF-FORGE, arifOS, and GEOX read as one stack with different roles rather than disconnected doc islands.

## [2026-04-10] forge | arifOS kernel primitives implemented
- Formalized missing canonical primitives: Pattern Registry, Pattern Selection Engine, Planner, Tool Contract Registry, and Agent Role Registry.
- Implemented all primitives in pure Python within `core/kernel/` for constitutional auditability.
- Integrated primitives into the `KernelCore` metabolic pipeline (`arifosmcp/runtime/kernel_core.py`).
- Established a comprehensive evaluation harness in `tests/evaluation_harness/test_harness.py`.
- Updated wiki index and added `20_BLUEPRINTS/Kernel_Primitives.md` and `90_AUDITS/Refactor_Summaries.md`.
- Verified that all 4 scenario tests pass against the new kernel substrate.

## [2026-04-10] sync | 999_SEAL MCP Substrate Bridge unified across devices
- **Source**: Laptop agent pushed `309424ca` — MCP Substrate Bridge + Deployment Gates + MCP Inspector Testing
- **Target**: VPS (Kimi Code) synchronized with GitHub main
- **Merge**: Resolved 4 conflicts in capability_map.py, contracts.py, integrity.py, MCP_Tools.md
- **Files unified**:
  - `arifosmcp/evals/mcp_inspector_test.py` — MCP Inspector testing framework
  - `arifosmcp/runtime/substrate_bridge.py` — Core substrate bridge
  - `arifosmcp/runtime/git_bridge.py` — Git integration
  - `arifosmcp/runtime/memory_bridge.py` — Memory bridge
  - `deployments/deploy.sh` — Unified deployment script
  - `deployments/vps-deploy.yml` — VPS deployment gates
  - `deployments/horizon-deploy.yml` — Horizon deployment gates
  - `deployments/README.md` — Deployment documentation
- **Status**: Intelligence unified. VPS now holds the 999_SEAL substrate.
- **ΔΩΨ | DITEMPA BUKAN DIBERI | 999 SEAL ALIVE**
