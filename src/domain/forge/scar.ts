/**
 * scar.ts — forge.scar: Standalone Scar Sealing
 *
 * Production uses the canonical runtime ledger. Tests and other isolated
 * consumers must inject their own index path through createScarLedger().
 *
 * DITEMPA BUKAN DIBERI — Forged, Not Given
 * @constitutional F1 AMANAH — scars are immutable once sealed
 * @constitutional F11 AUDIT — every scar leaves a trace
 */

import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import { dirname } from "node:path";
import type { ScarRecord, GovernedDomain } from "../../contracts/types.js";

const PRODUCTION_SCAR_INDEX = "/root/A-FORGE/.runtime/scars/index.json";

export interface SealFailureParams {
  failure_mode: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scar_pressure: number;
  domain: GovernedDomain;
  detection_method: string;
  constraint_imposed: string;
  sealed_by: string;
}

export interface ScarLedger {
  sealFailure(params: SealFailureParams): Promise<ScarRecord>;
  listFailures(domain?: GovernedDomain): Promise<ScarRecord[]>;
  consultFailurePressure(
    fingerprint: string,
    domain?: GovernedDomain,
  ): Promise<{ scarPressure: number; count: number; matchingScars: ScarRecord[] }>;
  revokeFailure(
    scarId: string,
    revokedBy: string,
  ): Promise<{ success: boolean; scar?: ScarRecord }>;
}

/** Create a file-backed ledger whose cache and persistence path are isolated. */
export function createScarLedger(indexPath = PRODUCTION_SCAR_INDEX): ScarLedger {
  const storageDir = dirname(indexPath);
  let cache: Map<string, ScarRecord> | null = null;

  async function ensureLoaded(): Promise<Map<string, ScarRecord>> {
    if (cache) return cache;
    await fs.mkdir(storageDir, { recursive: true });
    try {
      const data = await fs.readFile(indexPath, "utf-8");
      cache = new Map(Object.entries(JSON.parse(data) as Record<string, ScarRecord>));
    } catch {
      cache = new Map();
    }
    return cache;
  }

  async function persist(): Promise<void> {
    if (!cache) return;
    await fs.mkdir(storageDir, { recursive: true });
    await fs.writeFile(indexPath, JSON.stringify(Object.fromEntries(cache), null, 2));
  }

  /**
   * Arrow 1 wire — emit a cross-organ scar event so arifOS Arrow1Queue
   * auto-queues a re-examination task. File-based event bus is the
   * minimal-touch bridge between A-FORGE (TS) and arifOS (Python).
   *
   * F1 AMANAH: emit only AFTER persist() succeeds (no orphan events).
   * F11 AUDIT: every event leaves a JSONL trace.
   * F2 TRUTH: event carries raw scar fields; arifOS derives capability_name.
   *
   * @see /root/arifOS/arifosmcp/runtime/capability_ledger.py::replay_scar_events
   */
  const ARROW1_EVENT_LOG = "/root/.local/share/arifos/scar_events.jsonl";

  async function emit_arrow1_event(scar: ScarRecord): Promise<void> {
    try {
      await fs.mkdir(dirname(ARROW1_EVENT_LOG), { recursive: true });
      const event = {
        event_kind: "scar_sealed",
        event_id: `arrow1_evt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        emitted_at: new Date().toISOString(),
        scar_id: scar.scar_id,
        scar_fingerprint: scar.fingerprint,
        severity: scar.severity,
        failure_mode: scar.failure_mode,
        domain: scar.domain,
        scar_pressure: scar.scar_pressure,
        sealed_by: scar.sealed_by,
        source: "aforge_forge_scar",
      };
      await fs.appendFile(ARROW1_EVENT_LOG, JSON.stringify(event) + "\n", "utf-8");
    } catch (err) {
      // F1 AMANAH: scar is already sealed; Arrow 1 wire failure must not
      // throw back into the seal path (would orphan the scar). Log and
      // continue — re-execution can replay the scar_events.jsonl file.
      console.warn("[forge_scar] arrow1 event emission failed (non-fatal):", err);
    }
  }

  async function sealFailure(params: SealFailureParams): Promise<ScarRecord> {
    const scars = await ensureLoaded();
    const fingerprint = crypto
      .createHash("sha256")
      .update(`${params.domain}::${params.failure_mode}`)
      .digest("hex")
      .slice(0, 16);
    const now = new Date().toISOString();
    const scar: ScarRecord = {
      scar_id: `scar_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      fingerprint,
      failure_mode: params.failure_mode,
      detection_method: params.detection_method,
      severity: params.severity,
      scar_pressure: params.scar_pressure,
      domain: params.domain,
      constraint_imposed: params.constraint_imposed,
      occurred_at: now,
      sealed_at: now,
      sealed_by: params.sealed_by,
    };
    scars.set(scar.scar_id, scar);
    await persist();
    // Arrow 1 wire — fire AFTER persist so we never emit an event for
    // a scar that didn't actually seal.
    await emit_arrow1_event(scar);
    return scar;
  }

  async function listFailures(domain?: GovernedDomain): Promise<ScarRecord[]> {
    const all = Array.from((await ensureLoaded()).values());
    return domain ? all.filter((scar) => scar.domain === domain) : all;
  }

  async function consultFailurePressure(
    fingerprint: string,
    domain?: GovernedDomain,
  ): Promise<{ scarPressure: number; count: number; matchingScars: ScarRecord[] }> {
    const scars = await ensureLoaded();
    const matching = Array.from(scars.values()).filter((scar) => scar.fingerprint === fingerprint);
    if (domain) {
      for (const scar of scars.values()) {
        if (scar.domain === domain && !matching.includes(scar)) matching.push(scar);
      }
    }
    const severityMultiplier: Record<string, number> = {
      CRITICAL: 1.0,
      HIGH: 0.7,
      MEDIUM: 0.4,
      LOW: 0.1,
    };
    const totalPressure = matching.reduce(
      (sum, scar) => sum + scar.scar_pressure * (severityMultiplier[scar.severity] ?? 0.5),
      0,
    );
    return {
      scarPressure: Math.min(1, totalPressure),
      count: matching.length,
      matchingScars: matching,
    };
  }

  async function revokeFailure(
    scarId: string,
    revokedBy: string,
  ): Promise<{ success: boolean; scar?: ScarRecord }> {
    const scars = await ensureLoaded();
    const scar = scars.get(scarId);
    if (!scar) return { success: false };
    scar.scar_pressure = 0;
    scar.constraint_imposed += ` [REVOKED by ${revokedBy} at ${new Date().toISOString()}]`;
    scars.set(scarId, scar);
    await persist();
    return { success: true, scar };
  }

  return { sealFailure, listFailures, consultFailurePressure, revokeFailure };
}

const productionLedger = createScarLedger();

export const sealFailure = productionLedger.sealFailure;
export const listFailures = productionLedger.listFailures;
export const consultFailurePressure = productionLedger.consultFailurePressure;
export const revokeFailure = productionLedger.revokeFailure;
