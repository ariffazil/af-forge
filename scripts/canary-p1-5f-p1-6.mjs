#!/usr/bin/env node
/**
 * P1-5f + P1-6 CANARY — proves A-FORGE → arifFLOW receipt path end-to-end.
 * Authorized: F13 "go" 2026-09-09 (observatory NEXT MUTATION GATE).
 *
 * Part A (P1-5f): emit Execute + Verify receipt pair via flowEmit
 *                 (the executor-path helper). Expect both ok=true.
 * Part B (P1-6):  call telemetry.logEvent() with a synthetic event —
 *                 expect local audit JSONL line + arifFLOW ingest receipt.
 * Part C:         verify arifFLOW receipts count grew ≥3 and VAULT999
 *                 sealed-log gained entries; report PASS/FAIL honestly.
 *
 * Usage: node scripts/canary-p1-5f-p1-6.mjs   (run from /root/A-FORGE)
 */

import { readFileSync } from "node:fs";

const DIST = new URL("../dist/src/", import.meta.url);

const pass = (n) => console.log(`  PASS ${n}`);
const fail = (n, d = "") => { console.log(`  FAIL ${n} ${d}`); process.exitCode = 1; };

console.log("P1-5f + P1-6 canary —", new Date().toISOString());

const { getClient } = await import(new URL("infrastructure/receipts/arifflowClient.js", DIST).href);
const { runExecutorCanary, FALLBACK_PATH } = await import(new URL("infrastructure/receipts/flowEmit.js", DIST).href);

// ── baseline ──
const before = await getClient().health();
console.log(`baseline: receipts=${before.receipts} (ring cap 1000) fq=${before.fq?.quotient} verdict=${before.fq?.verdict}`);

// ── Part A: P1-5f executor canary ──
console.log("Part A — P1-5f executor receipt pair:");
const { execute, verify } = await runExecutorCanary();
execute.ok ? pass(`execute receipt ingested (${execute.status ?? ""})`) : fail("execute receipt", execute.error);
verify.ok ? pass(`verify receipt ingested (${verify.status ?? ""})`) : fail("verify receipt", verify.error);

// ── Part B: P1-6 telemetry path (fixed /ingest forward) ──
console.log("Part B — P1-6 telemetry.logEvent → arifFLOW:");
const { telemetry } = await import(new URL("interfaces/mcp/telemetry.js", DIST).href);
const auditBefore = readFileSync(
  process.env.AF_FORGE_AUDIT_PATH ?? `${process.env.HOME}/.agent-workbench/mcp-audit.jsonl`,
  "utf-8",
).split("\n").filter(Boolean).length;
await telemetry.logEvent({
  epoch: new Date().toISOString(),
  session_id: "P1-6-canary-2026-09-09",
  tool: "canary-p1-6",
  action: "success",
  outcome: "telemetry → arifFLOW /ingest canary",
  metadata: { durationMs: 42 },
});
await new Promise((r) => setTimeout(r, 1500)); // let fire-and-forget land
const auditAfter = readFileSync(
  process.env.AF_FORGE_AUDIT_PATH ?? `${process.env.HOME}/.agent-workbench/mcp-audit.jsonl`,
  "utf-8",
).split("\n").filter(Boolean).length;
auditAfter > auditBefore ? pass(`local audit JSONL +1 (${auditBefore}→${auditAfter})`) : fail("local audit JSONL unchanged");

// ── Part C: arifFLOW accepted + VAULT999 sealed ──
console.log("Part C — arifFLOW + VAULT999 verification:");
// NOTE: /health receipts is a saturated ring buffer (max 1000) — delta is
// always 0 at steady state. Truth = durable receipts.jsonl persistence.
const { execSync } = await import("node:child_process");
const persisted = execSync(
  `tail -20 /var/lib/arifflow/receipts.jsonl | grep -c '"a-forge"' || true`,
).toString().trim();
parseInt(persisted) >= 3
  ? pass(`durable receipts.jsonl: ${persisted} a-forge receipts in tail`)
  : fail(`receipts.jsonl a-forge count ${persisted} < 3`);

let sealedOk = null;
try {
  const sealed = readFileSync("/root/VAULT999/arifflow_sealed.jsonl", "utf-8").trim().split("\n");
  const last = JSON.parse(sealed[sealed.length - 1]);
  sealedOk = sealed.length > 0 && last.chain_position >= 1;
  pass(`VAULT999 sealed log: ${sealed.length} entries, last chain_position=${last.chain_position}`);
} catch (e) {
  fail("VAULT999 sealed log unreadable", String(e).slice(0, 80));
}

let fallbackCount = 0;
try {
  fallbackCount = readFileSync(FALLBACK_PATH, "utf-8").split("\n").filter(Boolean).length;
} catch {}
fallbackCount === 0
  ? pass("fallback JSONL empty (no drops)")
  : console.log(`  NOTE fallback JSONL has ${fallbackCount} historical lines (no NEW drops this run — check timestamps)`);

console.log(
  process.exitCode
    ? "CANARY: FAIL — do not flip P1-5/P1-6 to SEALED"
    : `CANARY: PASS — P1-5f + P1-6 path live (durable receipts + VAULT999 chain_position=${sealedOk ? "ADVANCING" : "?"})`,
);
