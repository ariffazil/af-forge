import { WealthAllocationContract, GEOXScenarioContract } from "../types/arifos.js";

export interface ThermodynamicBudget {
  joulesTotal: number;
  carbonTotal: number;
  entropyDeltaTotal: number;
}

/**
 * WealthEngine — Resource Allocation & Thermodynamic Optimizer
 *
 * Couples GEOX scenarios with capital and entropy costs.
 * Tracks thermodynamic budget per session for OPS/777 Landauer enforcement.
 */
export class WealthEngine {
  private _budget: ThermodynamicBudget = {
    joulesTotal: 0,
    carbonTotal: 0,
    entropyDeltaTotal: 0,
  };

  public async allocate(scenarios: GEOXScenarioContract[]): Promise<WealthAllocationContract[]> {
    return scenarios.map((scenario) => {
      const riskMultiplier = scenario.physicalConstraints.seismicRiskIndex > 0.3 ? 1.5 : 1.0;
      const maruahPenalty = scenario.physicalConstraints.environmentalImpact > 0.5 ? 0.4 : 0.0;
      const computeJoules = Math.round(10000 * riskMultiplier);
      this._budget.joulesTotal += computeJoules;
      this._budget.entropyDeltaTotal += computeJoules * 0.001;
      this._budget.carbonTotal += computeJoules * 0.0001;

      return {
        id: `wealth-alloc-${scenario.id}`,
        scenarioId: scenario.id,
        capitalRequired: 5000000 * riskMultiplier,
        computeJoules,
        expectedROI: {
          financial: 12.5 / riskMultiplier,
          knowledge: scenario.tag === "HYPOTHESIS" ? 0.9 : 0.4,
          peace: 1.0 - scenario.physicalConstraints.environmentalImpact - maruahPenalty,
        },
        reversibility: 1.0 - (scenario.physicalConstraints.environmentalImpact / 2),
        maruahScore: 1.0 - maruahPenalty,
      };
    });
  }

  public trackBudget(joules: number, carbon: number, entropyDelta: number): void {
    this._budget.joulesTotal += joules;
    this._budget.carbonTotal += carbon;
    this._budget.entropyDeltaTotal += entropyDelta;
  }

  public getBudget(): ThermodynamicBudget {
    return { ...this._budget };
  }

  public getBudgetStatus(): { remaining: number; utilization: number } {
    const BUDGET_LIMIT = 1000000;
    return {
      remaining: Math.max(0, BUDGET_LIMIT - this._budget.joulesTotal),
      utilization: Math.min(1, this._budget.joulesTotal / BUDGET_LIMIT),
    };
  }
}

