/**
 * AF-FORGE HTTP Bridge Server
 * 
 * Exposes Sense and Judge functionality to Python MCP
 * Port: 7071 (configurable via AF_FORGE_PORT)
 * 
 * Endpoints:
 * - POST /sense - Run Sense Lite/Deep + F7 confidence
 * - GET /health - Service health check
 */

import express from "express";
import type { Request, Response } from "express";
import { runSense } from "./policy/sense.js";
import {
  calculateConfidenceEstimate,
  evaluateWithConfidence,
  classifyUncertaintyBand,
} from "./policy/confidence.js";

const app = express();
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * POST /sense
 * Run Sense classification with F7 confidence evaluation
 */
app.post("/sense", async (req: Request, res: Response) => {
  try {
    const { session_id, prompt, context } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({
        ok: false,
        error: {
          type: "invalid_request",
          message: "prompt is required and must be a string",
        },
      });
      return;
    }

    // Run Sense (111) - Lite/Deep classification
    const sense = runSense(prompt, "auto");

    // Calculate F7 confidence proxy
    const uncertaintyHint =
      sense.uncertainty_band === "low"
        ? 0.2
        : sense.uncertainty_band === "medium"
          ? 0.4
          : sense.uncertainty_band === "high"
            ? 0.6
            : 0.8;

    const confidence = calculateConfidenceEstimate(
      sense.evidence_count,
      sense.evidence_quality ?? 0.5,
      sense.contradiction_flags,
      uncertaintyHint,
    );

    // Run Judge evaluation (888)
    const judge = evaluateWithConfidence(
      confidence,
      sense.uncertainty_band,
      sense.contradiction_flags,
      sense.evidence_count,
    );

    // Log for observability
    console.error(
      `[SENSE 111] session=${session_id ?? "anon"} mode=${sense.mode_used} ` +
        `uncertainty=${sense.uncertainty_band} recommendation=${sense.recommended_next_stage} ` +
        `verdict=${judge.verdict}`,
    );

    res.json({
      ok: true,
      sense: {
        mode_used: sense.mode_used,
        escalation_reason: sense.escalation_reason,
        evidence_count: sense.evidence_count,
        evidence_quality: sense.evidence_quality,
        uncertainty_band: sense.uncertainty_band,
        recommended_next_stage: sense.recommended_next_stage,
        contradiction_flags: sense.contradiction_flags,
        query_complexity_score: sense.query_complexity_score,
        risk_indicators: sense.risk_indicators,
      },
      judge: {
        verdict: judge.verdict,
        reason: judge.reason,
        confidence: {
          value: judge.confidence.value,
          is_estimate: judge.confidence.is_estimate,
          evidence_count: judge.confidence.evidence_count,
          agreement_score: judge.confidence.agreement_score,
          contradiction_penalty: judge.confidence.contradiction_penalty,
          uncertainty_hint: judge.confidence.uncertainty_hint,
        },
        floors_triggered: judge.floors_triggered,
        human_review_required: judge.human_review_required,
      },
      context: {
        source: "af-forge",
        version: "0.1.0",
        epoch: "2026-04-08",
        received_context: context,
      },
    });
  } catch (error) {
    console.error("[AF-FORGE] /sense error:", error);
    res.status(500).json({
      ok: false,
      error: {
        type: "upstream_error",
        message: error instanceof Error ? error.message : String(error),
      },
    });
  }
});

/**
 * GET /health
 * Service health check
 */
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "af-forge-sense",
    status: "healthy",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /ready
 * Readiness probe (for orchestrators)
 */
app.get("/ready", (_req: Request, res: Response) => {
  // Could add dependency checks here (memory, etc.)
  res.json({
    ready: true,
    checks: {
      policy: true,
      sense: true,
      judge: true,
    },
  });
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error("[AF-FORGE] Unhandled error:", err);
  res.status(500).json({
    ok: false,
    error: {
      type: "internal_error",
      message: err.message,
    },
  });
});

const port = process.env.AF_FORGE_PORT ? parseInt(process.env.AF_FORGE_PORT, 10) : 7071;

app.listen(port, "0.0.0.0", () => {
  console.error(`═══════════════════════════════════════════════════════════`);
  console.error(`  AF-FORGE Sense Bridge Server`);
  console.error(`  Listening on 0.0.0.0:${port}`);
  console.error(`  Endpoints:`);
  console.error(`    POST /sense  - Sense + Judge evaluation`);
  console.error(`    GET  /health - Health check`);
  console.error(`    GET  /ready  - Readiness probe`);
  console.error(`═══════════════════════════════════════════════════════════`);
});
