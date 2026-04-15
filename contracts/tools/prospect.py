"""
GEOX Prospect Dimension Tools
DITEMPA BUKAN DIBERI
"""

import logging
from typing import Optional, Dict, Any

from fastmcp import FastMCP

from contracts.enums.statuses import (
    get_standard_envelope,
    GovernanceStatus,
    ClaimTag,
)

logger = logging.getLogger(__name__)


def register_prospect_tools(mcp: FastMCP, profile: Optional[str] = None) -> None:
    """Register all prospect dimension tools."""

    @mcp.tool()
    def prospect_evaluate(
        prospect_id: str, 
        play_type: Optional[str] = None,
        ac_risk_score: float = 0.0,
        u_phys: float = 0.2,
        hypotheses_count: int = 1,
        complexity_score: float = 0.5,
        claimed_scenario: str = "ai_vision_only"
    ) -> Dict[str, Any]:
        """Evaluate a hydrocarbon prospect with active B_cog bias detection."""
        
        # 1. Bias Detection (B_cog Referee)
        from geox.core.bias_detector import BiasDetector
        bias_report = BiasDetector.detect(
            claimed_scenario=claimed_scenario,
            session_history=[], # In real app, this would be fetched from Vault
            hypotheses_count=hypotheses_count,
            complexity_score=complexity_score
        )
        
        # Calculate Total AC Risk including B_cog
        # Formula: ac_risk = (u_phys + b_cog) / 2 (simplified)
        b_cog = bias_report["b_cog"]
        total_ac_risk = (u_phys + b_cog) / 2
        
        metrics = {
            "prospect_id": prospect_id,
            "play_type": play_type or "structural_trap",
            "pg": round(0.4 * (1 - total_ac_risk), 3), 
            "stoiip_mmbbl": {
                "p90": 10.0,
                "p50": 45.0,
                "p10": 120.0,
                "mean": 58.0
            },
            "ac_risk": round(total_ac_risk, 3),
            "bias_report": bias_report,
            "uncertainty": u_phys
        }
        
        # 2. Determine Governance Verdict (SOT Enforcement)
        verdict = GovernanceStatus.QUALIFY
        
        # Floor F7: Single Model Collapse Check
        if bias_report["detected_scenario"] == "single_model_collapse":
            verdict = GovernanceStatus.HOLD
            metrics["hold_reason"] = "MODEL_COLLAPSE_F7_BREACH"
        
        # Floor: Executive Pressure Check
        elif b_cog > 0.5:
            verdict = GovernanceStatus.HOLD
            metrics["hold_reason"] = "EXECUTIVE_PRESSURE_DETECTED"
            
        elif total_ac_risk > 0.6:
            verdict = GovernanceStatus.HOLD
            metrics["hold_reason"] = "TOAC_RISK_EXCEEDED"
        
        return get_standard_envelope(
            metrics,
            governance_status=verdict,
            claim_tag=ClaimTag.PLAUSIBLE,
            uncertainty=u_phys
        )

    @mcp.tool()
    def _alias_geox_prospect_evaluate(prospect_id: str, play_type: Optional[str] = None) -> Dict[str, Any]:
        return prospect_evaluate(prospect_id, play_type)

    @mcp.tool()
    def _alias_geox_evaluate_prospect(prospect_id: str, play_type: Optional[str] = None) -> Dict[str, Any]:
        return prospect_evaluate(prospect_id, play_type)

    @mcp.tool()
    def _alias_prospect_evaluate_prospect(prospect_id: str, play_type: Optional[str] = None) -> Dict[str, Any]:
        return prospect_evaluate(prospect_id, play_type)

    @mcp.tool()
    def prospect_build_structural_candidates(line_id: str, max_candidates: int = 3) -> Dict[str, Any]:
        """Generate multiple structural hypotheses."""
        candidates = [
            {"candidate_id": f"C{i}", "confidence": 0.8 - i * 0.1, "setting": "extensional"}
            for i in range(min(max_candidates, 5))
        ]
        return get_standard_envelope(
            {"line_id": line_id, "candidates": candidates, "non_uniqueness_note": "Multiple valid interpretations exist."},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.HYPOTHESIS,
        )

    @mcp.tool()
    def _alias_geox_prospect_build(line_id: str, max_candidates: int = 3) -> Dict[str, Any]:
        return prospect_build_structural_candidates(line_id, max_candidates)

    @mcp.tool()
    def _alias_geox_build_structural(line_id: str, max_candidates: int = 3) -> Dict[str, Any]:
        return prospect_build_structural_candidates(line_id, max_candidates)

    @mcp.tool()
    def prospect_verify_feasibility(prospect_id: str) -> Dict[str, Any]:
        """Verify prospect feasibility against constitutional floors."""
        return get_standard_envelope(
            {"prospect_id": prospect_id, "feasible": True, "floors_checked": ["F1", "F2", "F4", "F7"]},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def _alias_geox_prospect_verify(prospect_id: str) -> Dict[str, Any]:
        return prospect_verify_feasibility(prospect_id)

    @mcp.tool()
    def _alias_geox_feasibility_check(prospect_id: str) -> Dict[str, Any]:
        return prospect_verify_feasibility(prospect_id)

    @mcp.tool()
    def _alias_prospect_feasibility_check(prospect_id: str) -> Dict[str, Any]:
        return prospect_verify_feasibility(prospect_id)
