# arifOS workspace context

## Naming alignment (canonical arifos.* tools)
- arifos.init = session bootstrap / identity
- arifos.route = meta routing
- arifos.judge = constitutional verdict
- arifos.vault = seal / verify
- arifos.mind = reasoning
- arifos.heart = simulation / ethical critique
- arifos.memory = governed execution
- arifos.sense = grounding / evidence
- arifos.ops = operational metrics / cost estimation
- arifos.forge = build / test / code execution

## Local skill registry
- planner: goal → steps decomposition (Bounded, No Exec)
- executor: bounded tool execution (Policy-gated)
- verifier: validation of outputs/diffs (Promotion gate)
- forge-operator: execution discipline
- floor-checker: F1-F13 validation
- swarm-conductor: meta router
- trinity-forger: Δ→Ω→Ψ→✓ handoffs
- metabolic-loop: 000→111→333→666→777→888→999
- web-architect: web/system design
- vps-operator: infra/container ops

## No-chaos rules
- One primary skill per task.
- Max 2 secondary skills.
- floor-checker first for risky operations.
- trinity-forger only for role orchestration.
- metabolic-loop only for stage governance.
- vps-operator never designs architecture.
- web-architect never executes production infra changes.

---

## Project Overview (AF-FORGE ΔΩΨ)
**AF-FORGE** is a constitutional, event-sourced agent runtime designed as a governed machine. It employs a **Planner/Executor/Verifier** triad architecture.

### Core Architecture & Technologies
- **Language/Runtime:** TypeScript (NodeNext), Node.js (v22+), Bun.
- **Components:** Planner, Executor, Verifier, Policy Engine, Event Store, Memory Gateway.

## Project Commands (Namespaced)
- /af:planner (if applicable, but mainly skills)
- /af:vps: Infrastructure operations
- /af:forge: Bounded execution discipline
- /af:trinity: Role orchestration
- /af:metabolic: Stage governance
- /af:floorcheck: F1-F13 validation
- /af:swarm: Meta routing

---

## Building and Running
- **Install:** `npm install`
- **Build:** `npm run build`
- **Test:** `npm test`
- **CLI:** `node dist/src/cli.js <command> [options]`
