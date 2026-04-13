import { createHash } from 'node:crypto';
import type { PlanDAG, PlanNode, StructuralValidationResult, RiskTier } from '../types/plan.js';
import { PlanValidator } from '../planner/PlanValidator.js';

export type SealStatus = 'PASS' | 'HOLD' | 'VOID' | 'SABAR';

export interface SealContext {
  goalId: string;
  dag: PlanDAG;
  node: PlanNode;
  memoryHash: string;
  selfModelSnapshot?: any; // To be defined in Phase 5
  timestamp: string;
}

export interface EpistemicVerdict {
  status: 'PASS' | 'HOLD';
  reason?: string;
  weight?: number;
}

export interface SealVerdict {
  status: SealStatus;
  sealId: string;
  nodeId: string;
  riskScore: number;
  verdicts: {
    structural: StructuralValidationResult;
    epistemic: EpistemicVerdict;
  };
  escalation: {
    humanRequired: boolean;
    reflectionDepth: number;
    auditTier: 'standard' | 'vault999';
  };
  message?: string;
}

export interface EpistemicThresholds {
  confidence: Record<RiskTier, number>;
  maxUnknowns: number;
  minEvidence: Record<RiskTier, number>;
}

export class SealService {
  private readonly validator: PlanValidator;
  private readonly thresholds: EpistemicThresholds;

  constructor(validator: PlanValidator, thresholds?: Partial<EpistemicThresholds>) {
    this.validator = validator;
    this.thresholds = {
      confidence: {
        safe: 0.6,
        guarded: 0.75,
        dangerous: 0.85
      },
      maxUnknowns: 5,
      minEvidence: {
        safe: 0,
        guarded: 1,
        dangerous: 3
      },
      ...thresholds
    };
  }

  /**
   * Hardened Authorization Loop
   * Phases 0-4 implementation
   */
  public async authorizeNode(context: SealContext): Promise<SealVerdict> {
    // Phase 0: Context Binding
    const sealId = this.computeSealId(context);

    // Phase 1: Structural Validation
    const structural = this.validator.validate(context.dag);
    if (!structural.isValid) {
      return this.createVerdict('VOID', sealId, context.node.id, 1.0, {
        structural,
        epistemic: { status: 'HOLD', reason: 'Structural failure' }
      }, `Structural failure: ${structural.errors.join('; ')}`);
    }

    // Phase 2: Epistemic Enforcement (DETERMINISTIC)
    const epistemic = this.enforceEpistemics(context.node);
    if (epistemic.status === 'HOLD') {
      return this.createVerdict('HOLD', sealId, context.node.id, 0.5, {
        structural,
        epistemic
      }, `Epistemic hold: ${epistemic.reason}`);
    }

    // Phase 3: Risk Escalation (Simplified for Phase 2)
    const riskScore = this.calculateRiskScore(context, structural, epistemic);

    // Phase 4: Verdict Synthesis
    const status = this.synthesizeStatus(riskScore, epistemic);

    return this.createVerdict(status, sealId, context.node.id, riskScore, {
      structural,
      epistemic
    });
  }

  private computeSealId(context: SealContext): string {
    const data = JSON.stringify({
      goalId: context.goalId,
      dagId: context.dag.id,
      nodeId: context.node.id,
      memoryHash: context.memoryHash,
      timestamp: context.timestamp
    });
    return createHash('sha256').update(data).digest('hex');
  }

  private enforceEpistemics(node: PlanNode): EpistemicVerdict {
    const { confidence, assumptions, unknowns, riskTier, evidenceCount } = node.epistemic;

    // 1. Confidence Gate
    const requiredConfidence = this.thresholds.confidence[riskTier];
    if (confidence < requiredConfidence) {
      return { 
        status: 'HOLD', 
        reason: `Insufficient confidence (${confidence.toFixed(2)}) for ${riskTier} tier (Required: ${requiredConfidence})` 
      };
    }

    // 2. Critical Assumption Gate
    for (const assumption of assumptions) {
      if (assumption.critical && !assumption.grounded) {
        return { 
          status: 'HOLD', 
          reason: `Critical ungrounded assumption: "${assumption.statement}"` 
        };
      }
    }

    // 3. Unknown Saturation Gate
    if (unknowns.length > this.thresholds.maxUnknowns) {
      return { 
        status: 'HOLD', 
        reason: `Unknown saturation: ${unknowns.length} unknowns exceed limit of ${this.thresholds.maxUnknowns}` 
      };
    }

    // 4. Evidence Floor
    const requiredEvidence = this.thresholds.minEvidence[riskTier];
    if (evidenceCount < requiredEvidence) {
      return { 
        status: 'HOLD', 
        reason: `Insufficient evidence (${evidenceCount}) for ${riskTier} tier (Required: ${requiredEvidence})` 
      };
    }

    return { status: 'PASS' };
  }

  private calculateRiskScore(context: SealContext, structural: StructuralValidationResult, epistemic: EpistemicVerdict): number {
    // Base risk from node tier
    let score = context.node.epistemic.riskTier === 'dangerous' ? 0.8 : (context.node.epistemic.riskTier === 'guarded' ? 0.4 : 0.1);
    
    // Adjust for complexity
    score += (structural.complexityScore / 1000) * 0.2;
    
    // Adjust for epistemics (Inverse of confidence)
    score += (1 - context.node.epistemic.confidence) * 0.2;

    return Math.min(score, 1.0);
  }

  private synthesizeStatus(riskScore: number, epistemic: EpistemicVerdict): SealStatus {
    if (epistemic.status === 'HOLD') return 'HOLD';
    if (riskScore > 0.85) return 'SABAR';
    if (riskScore > 0.6) return 'HOLD';
    return 'PASS';
  }

  private createVerdict(
    status: SealStatus, 
    sealId: string, 
    nodeId: string, 
    riskScore: number, 
    verdicts: any, 
    message?: string
  ): SealVerdict {
    return {
      status,
      sealId,
      nodeId,
      riskScore,
      verdicts,
      escalation: {
        humanRequired: riskScore > 0.85,
        reflectionDepth: Math.ceil(riskScore * 5),
        auditTier: riskScore > 0.75 ? 'vault999' : 'standard'
      },
      message
    };
  }
}
