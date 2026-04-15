/**
 * WEALTH Tools — Capital Intelligence Runtime
 *
 * First WEALTH runtime tools for the AF-FORGE tri-organ lattice.
 * These tools compute capital allocation, ROI, and thermodynamic cost
 * against the objective function: Maximize [Peace² × ΔKnowledge / ΔEntropy × ΔCapital]
 *
 * @module tools/WealthTools
 * @organ WEALTH (Capital Intelligence)
 * @pipeline 333_MIND / 777_FORGE
 * @constitutional F6 Maruah — no capital optimization at expense of dignity
 * @constitutional OPS/777 — Landauer thermodynamic bounds
 */

import { BaseTool } from "./base.js";
import type { ToolResult, ToolExecutionContext } from "../types/tool.js";

export interface EvaluateROIArgs {
  capitalRequired: number;
  expectedReturn?: number;
  riskFreeRate?: number;
  discountRate?: number;
  scenario?: string;
  domain?: "GEOX" | "WEALTH" | "CODE";
  joulesEstimate?: number;
}

interface ROIResult {
  emv: number;
  npv: number;
  roi: number;
  wealthVerdict: "PROCEED" | "HOLD" | "VOID" | "REQUIRE_HUMAN_APPROVAL";
  objectiveScore: number;
  peaceSquared: number;
  knowledgeDelta: number;
  entropyDelta: number;
  capitalDelta: number;
  uncertaintyTag: "ESTIMATE" | "HYPOTHESIS" | "UNKNOWN";
  maruahScore: number;
  reversibility: number;
  thermodynamicBand: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  violations: string[];
  reasoning: string;
}

function computeEMV(expectedReturn: number, capitalRequired: number): number {
  return expectedReturn - capitalRequired;
}

function computeNPV(
  capitalRequired: number,
  expectedReturn: number,
  discountRate: number,
): number {
  const pv = expectedReturn / (1 + discountRate);
  return pv - capitalRequired;
}

function computeObjectiveScore(
  peaceSq: number,
  knowledgeDelta: number,
  entropyDelta: number,
  capitalDelta: number,
): number {
  const numerator = peaceSq * knowledgeDelta;
  const denominator = Math.max(0.001, entropyDelta * capitalDelta);
  return numerator / denominator;
}

/**
 * wealth_evaluate_ROI
 *
 * Evaluates return on investment for a given capital deployment.
 * Computes EMV, NPV, and the full objective function score:
 *   Maximize [Peace² × ΔKnowledge / ΔEntropy × ΔCapital]
 *
 * F6 Maruah: Scores below 0.5 on maruah trigger VOID.
 * OPS/777: High thermodynamic band triggers HOLD.
 */
export class WealthEvaluateROITool extends BaseTool {
  readonly name = "wealth_evaluate_ROI";
  readonly description = "Evaluate return on investment for a capital deployment. Computes EMV, NPV, and the full objective function [Peace² × ΔK / ΔS × ΔC]. Returns PROCEED/HOLD/VOID verdict with maruah and reversibility scores.";
  readonly riskLevel = "guarded" as const;

  readonly parameters = {
    type: "object" as const,
    properties: {
      capitalRequired: {
        type: "number" as const,
        description: "Capital required in USD",
      },
      expectedReturn: {
        type: "number" as const,
        description: "Expected total return in USD",
      },
      riskFreeRate: {
        type: "number" as const,
        description: "Risk-free rate for NPV calculation (default 0.04)",
      },
      discountRate: {
        type: "number" as const,
        description: "Discount rate for NPV calculation (default 0.10)",
      },
      scenario: {
        type: "string" as const,
        description: "Scenario type (extraction, development, research)",
      },
      domain: {
        type: "string" as const,
        enum: ["GEOX", "WEALTH", "CODE"],
        description: "Domain of the investment",
      },
      joulesEstimate: {
        type: "number" as const,
        description: "Estimated thermodynamic cost in Joules",
      },
    },
    required: ["capitalRequired"],
    additionalProperties: false,
  };

  async run(args: Record<string, unknown>, _context: ToolExecutionContext): Promise<ToolResult> {
    const capitalRequired = args.capitalRequired as number;
    const expectedReturn = (args.expectedReturn as number) ?? capitalRequired * 1.2;
    const riskFreeRate = (args.riskFreeRate as number) ?? 0.04;
    const discountRate = (args.discountRate as number) ?? 0.10;
    const scenario = (args.scenario as string) ?? "general";
    const domain = (args.domain as string) ?? "CODE";
    const joulesEstimate = (args.joulesEstimate as number) ?? 1000;

    const emv = computeEMV(expectedReturn, capitalRequired);
    const npv = computeNPV(capitalRequired, expectedReturn, discountRate);
    const roi = expectedReturn > 0 ? (expectedReturn - capitalRequired) / capitalRequired : -1;

    // Maruah score — F6 dignity check
    let maruahScore = 0.9;
    if (scenario === "extraction" && domain === "GEOX") {
      maruahScore = 0.7; // Extraction has environmental impact
    }
    if (scenario === "development" && domain === "GEOX") {
      maruahScore = 0.75; // Development slightly better
    }
    if (domain === "CODE") {
      maruahScore = 0.95; // Code has minimal physical impact
    }

    // Reversibility — κᵣ proxy
    const reversibility = domain === "CODE" ? 0.9 : 0.6;

    // Entropy delta from thermodynamic cost
    const entropyDelta = joulesEstimate / 10000; // Normalized

    // Peace² — stability metric
    const peaceSquared = maruahScore * (npv > 0 ? 1.0 : 0.7);

    // Knowledge delta — proxy based on domain
    let knowledgeDelta = 0.5;
    if (domain === "CODE") knowledgeDelta = 0.6;
    if (domain === "GEOX") knowledgeDelta = 0.7; // Earth intel adds knowledge
    if (domain === "WEALTH") knowledgeDelta = 0.55;

    // Capital delta normalized
    const capitalDelta = capitalRequired / 1_000_000; // Millions USD

    const objectiveScore = computeObjectiveScore(peaceSquared, knowledgeDelta, entropyDelta, capitalDelta);

    // Determine thermodynamic band
    let thermodynamicBand: ROIResult["thermodynamicBand"] = "LOW";
    if (joulesEstimate > 50000) thermodynamicBand = "CRITICAL";
    else if (joulesEstimate > 10000) thermodynamicBand = "HIGH";
    else if (joulesEstimate > 1000) thermodynamicBand = "MEDIUM";

    // Violations
    const violations: string[] = [];
    if (npv < 0) violations.push(`NPV ${npv.toFixed(2)} < 0 — negative net present value`);
    if (emv < 0) violations.push(`EMV ${emv.toFixed(2)} < 0 — negative expected value`);
    if (maruahScore < 0.5) violations.push(`Maruah ${maruahScore.toFixed(2)} < 0.5 — dignity violation (F6)`);
    if (thermodynamicBand === "CRITICAL") violations.push(`Thermodynamic band CRITICAL (${joulesEstimate}J)`);

    // Verdict
    let wealthVerdict: ROIResult["wealthVerdict"] = "PROCEED";
    if (violations.some((v) => v.includes("F6") || v.includes("CRITICAL"))) {
      wealthVerdict = "VOID";
    } else if (violations.length > 0) {
      wealthVerdict = "HOLD";
    } else if (objectiveScore < 1.0) {
      wealthVerdict = "HOLD";
    }

    // Uncertainty tag
    let uncertaintyTag: ROIResult["uncertaintyTag"] = "ESTIMATE";
    if (domain === "GEOX" && scenario === "extraction") {
      uncertaintyTag = "HYPOTHESIS"; // Physical models have uncertainty
    }
    if (violations.length > 2) {
      uncertaintyTag = "UNKNOWN";
    }

    const reasoning =
      `EMV=${emv.toFixed(0)} NPV=${npv.toFixed(0)} ROI=${(roi * 100).toFixed(1)}% | ` +
      `Objective=[${peaceSquared.toFixed(2)}² × ${knowledgeDelta.toFixed(2)} / ${entropyDelta.toFixed(3)} × ${capitalDelta.toFixed(3)}] = ${objectiveScore.toFixed(3)} | ` +
      `Maruah=${maruahScore.toFixed(2)} κᵣ=${reversibility.toFixed(2)} | ` +
      `${domain} / ${scenario}`;

    const output: ROIResult = {
      emv,
      npv,
      roi,
      wealthVerdict,
      objectiveScore,
      peaceSquared,
      knowledgeDelta,
      entropyDelta,
      capitalDelta,
      uncertaintyTag,
      maruahScore,
      reversibility,
      thermodynamicBand,
      violations,
      reasoning,
    };

    return {
      ok: true,
      output: JSON.stringify(output, null, 2),
    };
  }
}

export interface EMVResult {
  emv: number;
  npv: number;
  expectedValue: number;
  scenarioResults: Array<{ label: string; probability: number; cashFlow: number; emvComponent: number }>;
  uncertaintyTag: "ESTIMATE" | "HYPOTHESIS" | "UNKNOWN";
  violations: string[];
  reasoning: string;
}

export class WealthComputeEMVTool extends BaseTool {
  readonly name = "wealth_compute_EMV";
  readonly description = "Compute Expected Monetary Value (EMV) and Net Present Value (NPV) for a scenario set. Returns EMV = Σ(p × CF) - initialInvestment, NPV with discount rate, and per-scenario breakdown. Tag ESTIMATE/HYPOTHESIS/UNKNOWN per F8.";
  readonly riskLevel = "guarded" as const;

  readonly parameters = {
    type: "object" as const,
    properties: {
      initial_investment: { type: "number" as const, description: "Initial cost (positive)" },
      discount_rate: { type: "number" as const, description: "Annual discount rate (0-1)" },
      scenarios: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            probability: { type: "number" as const, description: "0-1" },
            cash_flow: { type: "number" as const, description: "Net cash flow" },
            label: { type: "string" as const, description: "Scenario label" },
          },
          required: ["probability", "cash_flow"],
          additionalProperties: false,
        },
      },
      joules: { type: "number" as const, description: "Thermodynamic resource cost in joules" },
    },
    required: ["initial_investment", "scenarios"],
    additionalProperties: false,
  };

  async run(args: Record<string, unknown>, _context: ToolExecutionContext): Promise<ToolResult> {
    const initial = (args.initial_investment as number) ?? 0;
    const discount = (args.discount_rate as number) ?? 0.1;
    const rawScenarios = (args.scenarios as Array<{ probability: number; cash_flow: number; label?: string }>) ?? [];
    const joules = (args.joules as number) ?? 0;

    const scenarioResults = rawScenarios.map((s) => ({
      label: s.label ?? `Scenario ${rawScenarios.indexOf(s) + 1}`,
      probability: s.probability,
      cashFlow: s.cash_flow,
      emvComponent: s.probability * s.cash_flow,
    }));

    const expectedValue = scenarioResults.reduce((sum, s) => sum + s.emvComponent, 0);
    const emv = expectedValue - initial;
    const npv = emv / (1 + discount);

    const violations: string[] = [];
    if (emv < 0) violations.push("F6: Negative EMV — wealth destruction");
    if (npv < 0) violations.push("NPV: Negative NPV — not viable");
    if (joules > 1000000) violations.push("OPS: Thermodynamic budget exceeded");

    const uncertaintyTag: "ESTIMATE" | "HYPOTHESIS" | "UNKNOWN" =
      violations.length > 0 ? "HYPOTHESIS" : "ESTIMATE";

    const joulesEMV = joules > 0 ? joules / 1000000 * 0.5 : 0;
    const adjustedEMV = emv - joulesEMV;
    const adjustedNPV = npv - joulesEMV;

    const reasoning =
      `EMV = Σ(${scenarioResults.map((s) => `${s.label}: ${s.probability}×${s.cashFlow}=${s.emvComponent.toFixed(0)}`).join(", ")}) - ${initial} = ${emv.toFixed(2)}` +
      `\nNPV = ${emv} / (1+${discount}) = ${npv.toFixed(2)}` +
      (joules > 0 ? `\nThermodynamic cost: ${joulesEMV.toFixed(2)} (adjusted EMV: ${adjustedEMV.toFixed(2)})` : "");

    const output: EMVResult = {
      emv: Math.round(adjustedEMV * 100) / 100,
      npv: Math.round(adjustedNPV * 100) / 100,
      expectedValue: Math.round(expectedValue * 100) / 100,
      scenarioResults,
      uncertaintyTag,
      violations,
      reasoning,
    };

    return { ok: true, output: JSON.stringify(output, null, 2) };
  }
}

export interface ThermodynamicScanArgs {
  actions: Array<{
    toolName: string;
    args?: Record<string, unknown>;
    joules?: number;
  }>;
}

export interface ThermodynamicScanResult {
  actions: Array<{
    toolName: string;
    verdict: "PASS" | "HOLD" | "VOID";
    thermodynamicBand: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    kappa_r: number;
    blastRadius: number;
    dS_predict: number;
    joulesCost: number;
    violations: string[];
  }>;
  totalJoules: number;
  totalEntropy: number;
  compositeBand: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  budgetUtilization: number;
  recommendations: string[];
}

export class WealthThermodynamicScanTool extends BaseTool {
  readonly name = "wealth_thermodynamic_scan";
  readonly description = "Scan a list of actions for OPS/777 Landauer thermodynamic cost. Returns per-action κᵣ (reversibility), blast radius, entropy delta, and composite band. Use before committing resources to a multi-step plan.";
  readonly riskLevel = "guarded" as const;

  readonly parameters = {
    type: "object" as const,
    properties: {
      actions: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            toolName: { type: "string" as const, description: "Tool name to analyze" },
            args: { type: "object" as const, description: "Tool arguments" },
            joules: { type: "number" as const, description: "Override joules cost" },
          },
          required: ["toolName"],
          additionalProperties: false,
        },
      },
    },
    required: ["actions"],
    additionalProperties: false,
  };

  async run(args: Record<string, unknown>, _context: ToolExecutionContext): Promise<ToolResult> {
    const actions = (args.actions as ThermodynamicScanArgs["actions"]) ?? [];

    if (actions.length === 0) {
      return {
        ok: true,
        output: JSON.stringify({
          actions: [],
          totalJoules: 0,
          totalEntropy: 0,
          compositeBand: "LOW" as const,
          budgetUtilization: 0,
          recommendations: ["No actions to scan."],
        }),
      };
    }

    const { ThermodynamicCostEstimator } = await import("../ops/ThermodynamicCostEstimator.js");
    const thermo = new ThermodynamicCostEstimator();

    const BUDGET_LIMIT = 1000000;
    const actionResults: ThermodynamicScanResult["actions"] = [];
    let totalJoules = 0;
    let totalEntropy = 0;

    for (const action of actions) {
      let joulesCost = action.joules ?? 0;
      let verdict: "PASS" | "HOLD" | "VOID" = "PASS";
      let cost: { kappa_r: number; blastRadius: number; dS_predict: number; thermodynamicBand: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; landauerCost: number } = { kappa_r: 1.0, blastRadius: 0, dS_predict: 0, thermodynamicBand: "LOW", landauerCost: 0 };
      let violations: string[] = [];

      if (action.joules === undefined) {
        const check = thermo.estimateWithWealth(action.toolName, action.args ?? {});
        verdict = check.verdict;
        cost = check.cost;
        violations = check.violations;
        joulesCost = Math.round(check.cost.landauerCost * 100000);
      }

      totalJoules += joulesCost;
      totalEntropy += cost.dS_predict;

      actionResults.push({
        toolName: action.toolName,
        verdict,
        thermodynamicBand: cost.thermodynamicBand,
        kappa_r: cost.kappa_r,
        blastRadius: cost.blastRadius,
        dS_predict: cost.dS_predict,
        joulesCost,
        violations,
      });
    }

    const compositeScore = actionResults.reduce((sum, a) => {
      const bandScores: Record<string, number> = { LOW: 0.1, MEDIUM: 0.3, HIGH: 0.6, CRITICAL: 1.0 };
      return sum + (bandScores[a.thermodynamicBand] ?? 0);
    }, 0) / Math.max(1, actionResults.length);

    let compositeBand: ThermodynamicScanResult["compositeBand"] = "LOW";
    if (compositeScore >= 0.75) compositeBand = "CRITICAL";
    else if (compositeScore >= 0.5) compositeBand = "HIGH";
    else if (compositeScore >= 0.25) compositeBand = "MEDIUM";

    const recommendations: string[] = [];
    if (compositeBand === "CRITICAL") {
      recommendations.push("VOID RECOMMENDED: Composite thermodynamic cost in CRITICAL band");
      recommendations.push("888_HOLD required before proceeding");
    } else if (compositeBand === "HIGH") {
      recommendations.push("HOLD RECOMMENDED: High composite thermodynamic cost");
      recommendations.push("Consider splitting into smaller batches");
    } else if (compositeBand === "MEDIUM") {
      recommendations.push("Enhanced monitoring required for MEDIUM composite cost");
    } else {
      recommendations.push("LOW: Standard operations permitted");
    }

    const output: ThermodynamicScanResult = {
      actions: actionResults,
      totalJoules: Math.round(totalJoules),
      totalEntropy: Math.round(totalEntropy * 1000) / 1000,
      compositeBand,
      budgetUtilization: Math.min(1, totalJoules / BUDGET_LIMIT),
      recommendations,
    };

    return { ok: true, output: JSON.stringify(output, null, 2) };
  }
}

// ── WEALTH Tool 4: Portfolio Optimization ─────────────────────────────────────

export interface PortfolioOptimizeArgs {
  assets: Array<{
    id: string;
    expectedReturn: number;
    risk: number;
    correlation?: number;
    joules?: number;
  }>;
  totalBudget: number;
  maxRisk?: number;
  minDiversification?: number;
}

export interface PortfolioOptimizeResult {
  allocation: Array<{ id: string; weight: number; expectedReturn: number; risk: number }>;
  portfolioReturn: number;
  portfolioRisk: number;
  sharpeRatio: number;
  objectiveFunction: number;
  uncertaintyTag: "ESTIMATE" | "HYPOTHESIS" | "UNKNOWN";
  violations: string[];
  reasoning: string;
}

export class WealthPortfolioOptimizeTool extends BaseTool {
  readonly name = "wealth_portfolio_optimize";
  readonly description = "Optimize capital allocation across multiple assets under budget and risk constraints. Returns optimal weights, portfolio return, portfolio risk, Sharpe ratio, and objective function value. Tagged ESTIMATE/HYPOTHESIS/UNKNOWN per F8.";
  readonly riskLevel = "guarded" as const;

  readonly parameters = {
    type: "object" as const,
    properties: {
      assets: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            id: { type: "string" as const },
            expectedReturn: { type: "number" as const },
            risk: { type: "number" as const },
            correlation: { type: "number" as const },
            joules: { type: "number" as const },
          },
          required: ["id", "expectedReturn", "risk"],
          additionalProperties: false,
        },
      },
      totalBudget: { type: "number" as const },
      maxRisk: { type: "number" as const },
      minDiversification: { type: "number" as const },
    },
    required: ["assets", "totalBudget"],
    additionalProperties: false,
  };

  async run(args: Record<string, unknown>, _context: ToolExecutionContext): Promise<ToolResult> {
    const assets = (args.assets as PortfolioOptimizeArgs["assets"]) ?? [];
    const totalBudget = (args.totalBudget as number) ?? 1000000;
    const maxRisk = (args.maxRisk as number) ?? 0.3;
    const minDiversification = (args.minDiversification as number) ?? 0.1;

    if (assets.length === 0) {
      return { ok: true, output: JSON.stringify({ allocation: [], portfolioReturn: 0, portfolioRisk: 0, sharpeRatio: 0, objectiveFunction: 0, uncertaintyTag: "UNKNOWN", violations: ["No assets provided"], reasoning: "No assets to optimize" }) };
    }

    // Simple equal-weight with risk adjustment as baseline
    const n = assets.length;
    const weights = assets.map((a, i) => {
      const riskAdj = 1 - Math.min(a.risk, maxRisk);
      return riskAdj / assets.reduce((s, b) => s + (1 - Math.min(b.risk, maxRisk)), 0);
    });

    const allocation = assets.map((a, i) => ({
      id: a.id,
      weight: Math.round(weights[i] * 1000) / 1000,
      expectedReturn: Math.round(a.expectedReturn * weights[i] * 100) / 100,
      risk: Math.round(a.risk * weights[i] * 100) / 100,
    }));

    const portfolioReturn = allocation.reduce((s, a) => s + a.expectedReturn, 0);
    const portfolioRisk = Math.sqrt(
      allocation.reduce((s, a, i) => {
        const corr = assets[i]?.correlation ?? 0.3;
        return s + a.risk * a.risk * weights[i] * weights[i] + (n > 1 ? 2 * corr * a.risk * allocation.reduce((ss, b, j) => (i !== j ? ss + b.risk * weights[j] : ss), 0) : 0);
      }, 0)
    );

    const riskFreeRate = 0.04;
    const sharpeRatio = portfolioRisk > 0 ? (portfolioReturn - riskFreeRate) / portfolioRisk : 0;

    // Objective: [Peace² × ΔK / ΔS × ΔC]
    const peace = Math.max(0, 1 - portfolioRisk);
    const deltaK = portfolioReturn / totalBudget;
    const deltaS = portfolioRisk;
    const deltaC = totalBudget / 1000000;
    const objectiveFunction = (peace * peace * deltaK) / (Math.max(deltaS, 0.001) * deltaC);

    const violations: string[] = [];
    if (portfolioRisk > maxRisk) violations.push("F6: Portfolio risk exceeds limit");
    if (weights.some((w, i) => w < minDiversification && assets.length > 2)) violations.push("F6: Insufficient diversification");

    const uncertaintyTag: "ESTIMATE" | "HYPOTHESIS" | "UNKNOWN" =
      assets.length >= 5 ? "ESTIMATE" : (assets.length >= 2 ? "HYPOTHESIS" : "UNKNOWN");

    const reasoning =
      `Optimized ${n} assets: weights=${weights.map((w, i) => `${assets[i].id}:${(w * 100).toFixed(0)}%`).join(", ")}` +
      `\nPortfolio return=${portfolioReturn.toFixed(2)}, risk=${portfolioRisk.toFixed(3)}, Sharpe=${sharpeRatio.toFixed(2)}` +
      `\nObjective [Peace²×ΔK/ΔS×ΔC] = (${peace.toFixed(2)}²×${deltaK.toFixed(4)})/(${deltaS.toFixed(3)}×${deltaC.toFixed(2)}) = ${objectiveFunction.toFixed(4)}`;

    const output: PortfolioOptimizeResult = {
      allocation,
      portfolioReturn: Math.round(portfolioReturn * 100) / 100,
      portfolioRisk: Math.round(portfolioRisk * 1000) / 1000,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      objectiveFunction: Math.round(objectiveFunction * 10000) / 10000,
      uncertaintyTag,
      violations,
      reasoning,
    };

    return { ok: true, output: JSON.stringify(output, null, 2) };
  }
}

// ── WEALTH Tool 5: Entropy Budget Tracker ─────────────────────────────────────

export interface EntropyBudgetArgs {
  sessionId: string;
  actions?: Array<{ toolName: string; joules: number; entropyDelta: number }>;
  reset?: boolean;
}

export interface EntropyBudgetResult {
  sessionId: string;
  totalEntropy: number;
  totalJoules: number;
  entropyBudgetUsed: number;
  remainingBudget: number;
  actionsTracked: number;
  entropyPerAction: number;
  budgetStatus: "NOMINAL" | "CAUTION" | "CRITICAL";
  recommendations: string[];
}

export class WealthEntropyBudgetTool extends BaseTool {
  readonly name = "wealth_entropy_budget";
  readonly description = "Track cumulative entropy delta (ΔS) and thermodynamic budget for a session. Returns total entropy used, remaining budget, and budget status (NOMINAL/CAUTION/CRITICAL). Use to monitor Landauer cost accumulation.";
  readonly riskLevel = "guarded" as const;

  readonly parameters = {
    type: "object" as const,
    properties: {
      sessionId: { type: "string" as const, description: "Session identifier" },
      actions: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            toolName: { type: "string" as const },
            joules: { type: "number" as const },
            entropyDelta: { type: "number" as const },
          },
          required: ["toolName"],
          additionalProperties: false,
        },
      },
      reset: { type: "boolean" as const, description: "Reset budget counter" },
    },
    required: ["sessionId"],
    additionalProperties: false,
  };

  // Session-level entropy accumulator (in-memory per process)
  private static _sessionBudgets: Map<string, { joules: number; entropy: number; count: number }> = new Map();

  async run(args: Record<string, unknown>, _context: ToolExecutionContext): Promise<ToolResult> {
    const sessionId = (args.sessionId as string) ?? "default";
    const actions = (args.actions as EntropyBudgetArgs["actions"]) ?? [];
    const reset = (args.reset as boolean) ?? false;

    if (reset) {
      WealthEntropyBudgetTool._sessionBudgets.delete(sessionId);
    }

    const existing = WealthEntropyBudgetTool._sessionBudgets.get(sessionId) ?? { joules: 0, entropy: 0, count: 0 };
    for (const action of actions) {
      existing.joules += action.joules ?? 0;
      existing.entropy += action.entropyDelta ?? (action.joules ?? 0) * 0.001;
      existing.count += 1;
    }
    WealthEntropyBudgetTool._sessionBudgets.set(sessionId, existing);

    const BUDGET_LIMIT = 1000000;
    const ENTROPY_LIMIT = 1000;
    const remainingBudget = Math.max(0, BUDGET_LIMIT - existing.joules);
    const entropyRemaining = Math.max(0, ENTROPY_LIMIT - existing.entropy);
    const utilization = existing.joules / BUDGET_LIMIT;

    let budgetStatus: EntropyBudgetResult["budgetStatus"] = "NOMINAL";
    if (utilization > 0.85) budgetStatus = "CRITICAL";
    else if (utilization > 0.6) budgetStatus = "CAUTION";

    const recommendations: string[] = [];
    if (budgetStatus === "CRITICAL") {
      recommendations.push("CRITICAL: Thermodynamic budget nearly exhausted — halt non-essential actions");
      recommendations.push("888_HOLD required for new high-joule operations");
    } else if (budgetStatus === "CAUTION") {
      recommendations.push("CAUTION: Budget 60%+ utilized — monitor closely");
    } else {
      recommendations.push("NOMINAL: Thermodynamic budget within normal operating range");
    }

    const output: EntropyBudgetResult = {
      sessionId,
      totalEntropy: Math.round(existing.entropy * 1000) / 1000,
      totalJoules: Math.round(existing.joules),
      entropyBudgetUsed: Math.round(utilization * 1000) / 1000,
      remainingBudget: Math.round(remainingBudget),
      actionsTracked: existing.count,
      entropyPerAction: existing.count > 0 ? Math.round((existing.entropy / existing.count) * 1000) / 1000 : 0,
      budgetStatus,
      recommendations,
    };

    return { ok: true, output: JSON.stringify(output, null, 2) };
  }
}

// ── WEALTH Tool 6: Objective Function Compute ────────────────────────────────

export interface ObjectiveComputeArgs {
  peace?: number;
  deltaKnowledge?: number;
  deltaEntropy?: number;
  deltaCapital?: number;
  scenario?: string;
}

export interface ObjectiveComputeResult {
  objectiveValue: number;
  breakdown: {
    peaceSquared: number;
    knowledgeGain: number;
    entropyCost: number;
    capitalNormalized: number;
  };
  verdict: "SEAL" | "HOLD" | "VOID";
  uncertaintyTag: "ESTIMATE" | "HYPOTHESIS" | "UNKNOWN";
  violations: string[];
  reasoning: string;
}

export class WealthObjectiveComputeTool extends BaseTool {
  readonly name = "wealth_objective_compute";
  readonly description = "Compute the WEALTH objective function: Maximize [Peace² × ΔKnowledge / ΔEntropy × ΔCapital]. Returns objective value, per-component breakdown, and verdict (SEAL if positive, HOLD if marginal, VOID if negative). Tagged ESTIMATE/HYPOTHESIS/UNKNOWN per F8.";
  readonly riskLevel = "guarded" as const;

  readonly parameters = {
    type: "object" as const,
    properties: {
      peace: { type: "number" as const, description: "Peace/stability score (0-1)" },
      deltaKnowledge: { type: "number" as const, description: "ΔKnowledge — knowledge gain from action" },
      deltaEntropy: { type: "number" as const, description: "ΔEntropy — entropy cost of action" },
      deltaCapital: { type: "number" as const, description: "ΔCapital — capital deployed in USD" },
      scenario: { type: "string" as const, description: "Context (extraction, research, infrastructure)" },
    },
    additionalProperties: false,
  } as const;

  async run(args: Record<string, unknown>, _context: ToolExecutionContext): Promise<ToolResult> {
    const peace = (args.peace as number) ?? 0.8;
    const deltaK = (args.deltaKnowledge as number) ?? 0.1;
    const deltaS = (args.deltaEntropy as number) ?? 0.05;
    const deltaC = (args.deltaCapital as number) ?? 1000000;
    const scenario = (args.scenario as string) ?? "general";

    const peaceSquared = peace * peace;
    const knowledgeGain = deltaK;
    const entropyCost = Math.max(deltaS, 0.001);
    const capitalNormalized = deltaC / 1000000;

    const objectiveValue = (peaceSquared * knowledgeGain) / (entropyCost * capitalNormalized);

    const violations: string[] = [];
    if (objectiveValue <= 0) violations.push("F6: Non-positive objective — action destroys value");
    if (peace < 0.5) violations.push("F6: Low peace score — dignity/stability concern");
    if (deltaS > 0.5) violations.push("OPS: High entropy cost");

    let verdict: ObjectiveComputeResult["verdict"] = "SEAL";
    if (objectiveValue <= 0 || violations.length > 0) verdict = "VOID";
    else if (objectiveValue < 0.1) verdict = "HOLD";

    const uncertaintyTag: "ESTIMATE" | "HYPOTHESIS" | "UNKNOWN" =
      deltaK > 0 && deltaS < 0.3 ? "ESTIMATE" : (deltaK > 0 ? "HYPOTHESIS" : "UNKNOWN");

    const reasoning =
      `Objective = [Peace² × ΔK / ΔS × ΔC] = [${peace.toFixed(2)}² × ${deltaK.toFixed(3)} / ${deltaS.toFixed(3)} × ${capitalNormalized.toFixed(2)}] = ${objectiveValue.toFixed(4)}` +
      `\nBreakdown: Peace²=${peaceSquared.toFixed(3)}, ΔK=${knowledgeGain.toFixed(3)}, ΔS=${entropyCost.toFixed(3)}, ΔC=${capitalNormalized.toFixed(2)}` +
      (violations.length > 0 ? `\nViolations: ${violations.join("; ")}` : "");

    const output: ObjectiveComputeResult = {
      objectiveValue: Math.round(objectiveValue * 10000) / 10000,
      breakdown: {
        peaceSquared: Math.round(peaceSquared * 1000) / 1000,
        knowledgeGain: Math.round(knowledgeGain * 1000) / 1000,
        entropyCost: Math.round(entropyCost * 1000) / 1000,
        capitalNormalized: Math.round(capitalNormalized * 1000) / 1000,
      },
      verdict,
      uncertaintyTag,
      violations,
      reasoning,
    };

    return { ok: true, output: JSON.stringify(output, null, 2) };
  }
}

export const WEALTH_TOOLS = [WealthEvaluateROITool, WealthComputeEMVTool, WealthThermodynamicScanTool, WealthPortfolioOptimizeTool, WealthEntropyBudgetTool, WealthObjectiveComputeTool];