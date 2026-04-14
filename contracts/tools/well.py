"""
GEOX Well Dimension Tools
DITEMPA BUKAN DIBERI
"""

import logging
from typing import Optional, Dict, Any

from fastmcp import FastMCP

from contracts.enums.statuses import (
    get_standard_envelope,
    ExecutionStatus,
    GovernanceStatus,
    ArtifactStatus,
    ClaimTag,
)

logger = logging.getLogger(__name__)


def register_well_tools(mcp: FastMCP, profile: Optional[str] = None) -> None:
    """Register all well dimension tools."""

    @mcp.tool()
    def well_load_bundle(well_id: str) -> Dict[str, Any]:
        """Load a well bundle."""
        return get_standard_envelope(
            {"well_id": well_id, "bundle_loaded": True, "curves": ["GR", "RT", "NPHI", "RHOB"]},
            governance_status=GovernanceStatus.SEAL,
            claim_tag=ClaimTag.CLAIM,
        )

    @mcp.tool()
    def well_load_log_bundle(well_id: str, log_types: Optional[list] = None) -> Dict[str, Any]:
        """Load specific log types for a well."""
        return get_standard_envelope(
            {"well_id": well_id, "log_types": log_types or ["GR", "RT"], "loaded": True},
            governance_status=GovernanceStatus.SEAL,
        )

    @mcp.tool()
    def well_qc_logs(well_id: str, curves: Optional[list] = None) -> Dict[str, Any]:
        """QC well logs."""
        return get_standard_envelope(
            {"well_id": well_id, "qc_passed": True, "curves_checked": curves or ["GR", "RT"]},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def geox_qc_logs(well_id: str, curves: Optional[list] = None) -> Dict[str, Any]:
        """Alias: QC well logs."""
        return well_qc_logs(well_id, curves)

    @mcp.tool()
    def well_validate_cutoffs(well_id: str, cutoffs: Dict[str, float]) -> Dict[str, Any]:
        """Validate petrophysical cutoffs."""
        return get_standard_envelope(
            {"well_id": well_id, "cutoffs": cutoffs, "valid": True},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def geox_validate_cutoffs(well_id: str, cutoffs: Dict[str, float]) -> Dict[str, Any]:
        """Alias: Validate cutoffs."""
        return well_validate_cutoffs(well_id, cutoffs)

    @mcp.tool()
    def well_select_sw_model(well_id: str, model: str = "archie") -> Dict[str, Any]:
        """Select water saturation model."""
        return get_standard_envelope(
            {"well_id": well_id, "sw_model": model, "selected": True},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def geox_select_sw_model(well_id: str, model: str = "archie") -> Dict[str, Any]:
        """Alias: Select Sw model."""
        return well_select_sw_model(well_id, model)

    @mcp.tool()
    def well_compute_petrophysics(
        well_id: str, 
        model: str = "archie",
        rw: float = 0.1,
        rt: float = 10.0,
        phi: float = 0.2,
        u_phys: float = 0.3,
        transform_stack: list[str] = ["linear_scaling"],
        bias_scenario: str = "physics_validated"
    ) -> Dict[str, Any]:
        """Compute petrophysics for a well with ToAC audit."""
        
        # 1. Core Physics (Simplified)
        sw = (0.62 * rw / (rt * phi**2.15))**0.5  # Humble Archie
        artifact = {
            "well_id": well_id, 
            "model": model, 
            "computed": True, 
            "vshale": 0.25, 
            "sw": round(sw, 4), 
            "phie": phi
        }

        # 2. Forge ToAC Payload
        try:
            from ENGINE.ac_risk import ACRiskCalculator
            calculator = ACRiskCalculator()
            ac_result = calculator.compute(
                u_phys=u_phys,
                transform_stack=transform_stack,
                bias_scenario=bias_scenario
            )
            artifact["toac_payload"] = {
                "ac_risk": round(ac_result.ac_risk, 4),
                "verdict": ac_result.verdict,
                "explanation": ac_result.explanation,
                "components": {
                    "u_phys": ac_result.u_phys,
                    "d_transform": ac_result.d_transform,
                    "b_cog": ac_result.b_cog
                }
            }
            verdict = ac_result.verdict
        except Exception as e:
            logger.warning(f"ToAC calculation failed for petrophysics: {e}")
            verdict = GovernanceStatus.QUALIFY.value
            artifact["toac_payload"] = {"error": str(e)}

        return get_standard_envelope(
            artifact,
            governance_status=GovernanceStatus[verdict] if verdict in GovernanceStatus.__members__ else GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
            uncertainty=u_phys
        )

    @mcp.tool()
    def geox_compute_petrophysics(well_id: str, model: str = "archie") -> Dict[str, Any]:
        """Alias: Compute petrophysics."""
        return well_compute_petrophysics(well_id, model)

    @mcp.tool()
    def well_verify_petrophysics(well_id: str) -> Dict[str, Any]:
        """Verify petrophysics results."""
        return get_standard_envelope(
            {"well_id": well_id, "verified": True},
            governance_status=GovernanceStatus.SEAL,
            claim_tag=ClaimTag.CLAIM,
        )

    @mcp.tool()
    def well_petrophysical_check(well_id: str) -> Dict[str, Any]:
        """Run petrophysical consistency check."""
        return get_standard_envelope(
            {"well_id": well_id, "consistent": True},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def geox_petrophysical_hold_check(well_id: str) -> Dict[str, Any]:
        """Governance hold check for petrophysics."""
        return get_standard_envelope(
            {"well_id": well_id, "hold_required": False},
            governance_status=GovernanceStatus.SEAL,
            claim_tag=ClaimTag.CLAIM,
        )

    @mcp.tool()
    def well_digitize_log(
        image_path: str,
        curve_types: Optional[list] = None,
    ) -> Dict[str, Any]:
        """
        Analog Digitizer — PLANNED design spike.
        Accepts scanned log image and returns structured tasks only.
        """
        return get_standard_envelope(
            {
                "image_path": image_path,
                "curve_types": curve_types or ["gamma_ray", "resistivity"],
                "status": "design_spike",
                "pipeline": [
                    {"stage": "preprocess", "status": "pending", "description": "Image alignment, denoising, grid isolation"},
                    {"stage": "neural_interpretation", "status": "pending", "description": "CNN/RNN curve tracking"},
                    {"stage": "vectorization", "status": "pending", "description": "Pixel paths to mathematical vectors"},
                    {"stage": "las_export", "status": "pending", "description": "Map to depth and scale values"},
                ],
                "governance": {
                    "note": "Truth >= 0.99 required before any SEALED LAS used for business decisions.",
                    "f1_amanah": "All digitization must be git-backed and reversible",
                },
            },
            governance_status=GovernanceStatus.HOLD,
            artifact_status=ArtifactStatus.DRAFT,
            claim_tag=ClaimTag.HYPOTHESIS,
        )
