---
type: Crack
tags: [naming-drift, canonical-names, containers]
last_sync: 2026-04-09T09:00Z
confidence: 0.95
arifos_floor: F2
operator: Copilot
---

# Crack: Container Naming Divergence

> **Finding**: 6 containers use non-canonical names per `COPILOT_STUDIO_ARIFOS_INSTRUCTION_PACK.md`.
> **Canon Reference**: `/root/arifOS/wiki/pages/Naming_Canon.md`

---

## Drift Table

| Running As | Canonical | Safe to Rename? |
|-----------|-----------|----------------|
| `arifosmcp` | `mcp` | On next redeploy (Tier 2) |
| `arifos_landings` | `landing` | On next redeploy |
| `uptime_kuma` | `uptime` | On next redeploy |
| `apps_portainer` | `portainer` | On next redeploy |
| `apps_wireguard` | `wireguard` | On next redeploy |
| `apps_pocketbase` | `pocketbase` | On next redeploy |

## Remediation Pattern

Apply the shared naming law first:
- one canonical name
- legacy names treated as aliases or migration residue
- one declared truth source per service

Then for each container, update compose `container_name:` and any dependent docs or dashboards, then `docker compose up -d --force-recreate <service>`.

> **F1 Gate**: Container renames require service restart (~5s downtime each). Do not rename all at once.
