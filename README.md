# AF FORGE

TypeScript execution substrate and operator plane for governed AI agents on Linux VPS, built to run under [arifOS](https://github.com/ariffazil/arifOS) constitutional governance.

AF FORGE is the **BODY runtime** around the law:
- **arifOS** is the constitutional kernel and source of truth.
- **AF FORGE** is the deployable runtime that receives tasks, runs agents, exposes bridge APIs, writes vault records, surfaces approvals, and gives operators visibility into governed execution.

## What AF FORGE is

AF FORGE is a sovereign, self-hosted AI agent platform for Linux systems. Its job is to combine four planes into one buildable runtime: governance, agent execution, data/memory, and infrastructure/observability.

It is designed for:
- self-hosted agent systems,
- operator-auditable execution,
- human escalation on high-risk actions,
- local or proxied LLM backends,
- VPS-first deployment with Docker, Caddy, Postgres, Redis, and Prometheus.

## What AF FORGE is not

- Not the constitutional source of truth — **arifOS owns that**.
- Not a general-purpose cloud platform.
- Not an unconstrained autonomous-agent playground.
- Not a replacement for Linux ops discipline.

## Core model

AF FORGE follows a four-plane architecture:

| Plane | Purpose |
|---|---|
| Governance plane | Constitutional checks, Floors, verdicts, HOLD/SEAL logic |
| Agent plane | AgentEngine, MCP server, bridge server, execution control |
| Data + memory plane | Vault records, approvals, session state, persistent memory |
| Infra plane | Reverse proxy, Docker, TLS, metrics, process supervision |

Rule: if a component serves none of these planes, it is noise.

## High-level architecture

```text
Internet
  │
  ▼
[Caddy / TLS / Reverse Proxy]
  │
  ├─► AF FORGE Bridge Server (:7071)
  │     ├─ /sense
  │     ├─ /metrics
  │     ├─ /operator/approvals
  │     └─ /operator/vault
  │
  ├─► arifOS MCP Server (:8080 internal)
  │     ├─ /mcp
  │     ├─ /health
  │     └─ /metrics/json
  │
  └─► Optional operator UI

Internal Docker Network
  │
  ├─► AgentEngine / MCP runtime
  ├─► PostgreSQL
  ├─► Redis
  ├─► Local inference runtime (e.g. Ollama)
  ├─► Vault store
  └─► Prometheus / Grafana

External controlled path
  └─► Human escalation webhook for 888_HOLD
```

Public exposure should be limited to the reverse proxy. Internal services such as Postgres, Redis, and local inference must stay on private networks only.

## Current runtime capabilities

The current AF FORGE runtime includes:

- TypeScript MCP runtime with governance stage wrappers.
- HTTP bridge server with metrics endpoint.
- Vault client with query and lookup methods.
- Approval ticket store and operator inspection endpoints.
- Human escalation client with webhook transport for high/critical-risk HOLD events.
- Operator CLI for approvals and vault search.
- Prometheus instrumentation for stage timings and floor violations.

## Operator surfaces

### HTTP endpoints

Bridge server default port: `7071`.

- `GET /operator/approvals?status=&sessionId=&riskLevel=` — list approval tickets.
- `GET /operator/approvals/:ticketId` — fetch one approval ticket.
- `GET /operator/vault?verdict=&sessionId=&since=&until=&limit=` — search vault seals.
- `GET /operator/vault/:sealId` — fetch one seal record.

### CLI

- `agent operator approvals [--status PENDING] [--sessionId s1] [--riskLevel high]`
- `agent operator vault [--verdict HOLD] [--sessionId s1] [--since 2026-04-01] [--limit 20]`

These surfaces exist so operators can inspect governed behavior directly instead of scraping internals.

## Governance behavior

AF FORGE is built to run **under** arifOS governance, not beside it. High-stakes actions should pass through constitutional checks before execution, and terminal outcomes should be persisted in the vault with enough metadata for audit and replay.

Important runtime behaviors:
- irreversible or dangerous actions should bias toward `888_HOLD`,
- high/critical-risk paths can escalate to human reviewers through webhook integration,
- vault records should carry terminal verdict and escalation metadata where present,
- metrics should expose execution stages and governance violations for deploy-time observability.

## Linux deployment model

Recommended base environment:

- Ubuntu 22.04 LTS or 24.04 LTS,
- Docker Engine + Docker Compose v2,
- Caddy as reverse proxy,
- PostgreSQL for durable storage,
- Redis for cache and queue,
- local inference runtime on internal network only,
- systemd for supervision,
- Prometheus for metrics collection.

Host-level rules:
- default-deny inbound firewall,
- SSH key auth only,
- no public exposure of Postgres, Redis, or inference ports,
- restart policies on critical services,
- backups for persistent volumes.

## Repository boundaries

Keep these boundaries sharp:

| Concern | Repo |
|---|---|
| Constitutional doctrine, Floors, canonical governance | `arifOS` |
| Runtime execution substrate, bridge server, vault, approvals, operator plane | `af-forge` |
| Static sites / portal | separate site repo |

If these boundaries blur, runtime truth and constitutional truth will drift.

## Suggested repository layout

```text
af-forge/
├─ README.md
├─ AGENTS.md
├─ CHANGELOG.md
├─ .env.example
├─ Dockerfile
├─ docker-compose.yml
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ server.ts
│  ├─ cli/
│  ├─ mcp/
│  ├─ engine/
│  ├─ governance/
│  ├─ approval/
│  ├─ escalation/
│  ├─ vault/
│  ├─ metrics/
│  ├─ types/
│  └─ operator/
├─ test/
├─ docs/
│  ├─ architecture/
│  ├─ deployment/
│  ├─ operator/
│  ├─ security/
│  └─ runbooks/
└─ deploy/
   ├─ caddy/
   ├─ docker/
   ├─ prometheus/
   └─ systemd/
```

## Quick start

### 1. Install and verify

```bash
npm install
npm run build
npm test
```

### 2. Configure environment

At minimum, configure:
- `AF_FORGE_PORT`
- vault storage path
- Postgres / Redis connection settings (if used)
- local inference endpoint (if used)
- `HUMAN_ESCALATION_WEBHOOK_URL` if human review is enabled.

See `.env.example` for the full variable list.

### 3. Run the bridge

```bash
node dist/src/server.js
```

### 4. Verify health and operator visibility

```bash
curl http://localhost:7071/health
curl http://localhost:7071/metrics
```

## Why AF FORGE exists

The point of AF FORGE is not total control. The point is governed behavior under uncertainty: constrain blast radius, isolate components, log terminal outcomes, escalate dangerous ambiguity, and keep a human-visible audit path.

This repo exists to turn that principle into a buildable Linux runtime.

## Status

Current direction of the runtime includes:
- bridge server + operator endpoints,
- approval inspection,
- vault query and record lookup,
- human escalation webhook path,
- metrics for stage durations and governance violations.

## Safety note

Before first push or deployment:
- remove secrets,
- exclude `.env`,
- exclude local vault and memory files,
- exclude approval queues and transient runtime state,
- rotate any expired or embedded credentials.

## License

GNU Affero General Public License v3.0

## Canon note

AF FORGE follows arifOS constitutional governance but is a separate runtime artifact. For doctrine, Floors, and canonical law, refer to the `arifOS` repository.

---

## AAA Federation & Execution Adapter (SOT v2026-04-16)

AF-FORGE now acts as the "Headed Transition" execution adapter for the arifOS federation:
- **AAA-Agent**: Federal Coordinator routing intents to Specialist Organs (GEOX/WEALTH).
- **ARCHIVIST-Agent**: Automatically persists every SEAL into the `arifos.canon_records` immutable ledger.
- **NOTIFIER-Agent**: Manages human-loop escalation via webhook (port 9001) for `888_HOLD`.

*(Note: Core primitives `LoopController`, `TaskGraphPlanner`, `AgentHandoff`, and `EvalHarness` remain in **HOLD** per canon).*

