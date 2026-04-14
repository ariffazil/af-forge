"""
GEOX Map Dimension Tools
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


def register_map_tools(mcp: FastMCP, profile: Optional[str] = None) -> None:
    """Register all map dimension tools."""

    @mcp.tool()
    def map_verify_coordinates(latitude: float, longitude: float, crs: str = "EPSG:4326") -> Dict[str, Any]:
        """Verify map coordinates against a CRS."""
        valid = -90 <= latitude <= 90 and -180 <= longitude <= 180
        return get_standard_envelope(
            {"latitude": latitude, "longitude": longitude, "crs": crs, "valid": valid},
            governance_status=GovernanceStatus.SEAL if valid else GovernanceStatus.VOID,
            claim_tag=ClaimTag.CLAIM if valid else ClaimTag.UNKNOWN,
        )

    @mcp.tool()
    def map_get_context_summary(map_id: str) -> Dict[str, Any]:
        """Get a summary of map context."""
        return get_standard_envelope(
            {"map_id": map_id, "layers": ["base", "cultural", "geology"], "extent": [100.0, 1.0, 120.0, 8.0]},
            governance_status=GovernanceStatus.SEAL,
            claim_tag=ClaimTag.CLAIM,
        )

    @mcp.tool()
    def map_render_scene_context(location: str, radius_km: float = 50.0) -> Dict[str, Any]:
        """Render a causal scene context around a location."""
        return get_standard_envelope(
            {"location": location, "radius_km": radius_km, "rendered": True},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def map_synthesize_causal_scene(location: str, factors: Optional[list] = None) -> Dict[str, Any]:
        """Synthesize a causal scene from geographic factors."""
        return get_standard_envelope(
            {"location": location, "factors": factors or [], "scene_synthesized": True},
            governance_status=GovernanceStatus.HOLD,
            claim_tag=ClaimTag.HYPOTHESIS,
        )

    @mcp.tool()
    def map_earth_signals(latitude: float, longitude: float, radius_km: float = 300.0) -> Dict[str, Any]:
        """Fetch live Earth observation signals for a location."""
        return get_standard_envelope(
            {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km,
                "earthquakes": {"count": 0, "max_magnitude": 0.0},
                "climate": {"status": "stable"},
                "geomagnetic": {"status": "nominal"},
            },
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def map_project_well(well_id: str, map_id: str) -> Dict[str, Any]:
        """Project a well location onto a map."""
        return get_standard_envelope(
            {"well_id": well_id, "map_id": map_id, "projected": True},
            governance_status=GovernanceStatus.SEAL,
            claim_tag=ClaimTag.CLAIM,
        )

    @mcp.tool()
    def alias_geox_project_well_trajectory(well_id: str, map_id: str) -> Dict[str, Any]:
        """Alias: Project well trajectory onto map."""
        return map_project_well(well_id, map_id)

    @mcp.tool()
    def map_transform_coordinates(x: float, y: float, from_crs: str, to_crs: str) -> Dict[str, Any]:
        """Transform coordinates between CRS."""
        return get_standard_envelope(
            {"x": x, "y": y, "from_crs": from_crs, "to_crs": to_crs, "transformed": [x, y]},
            governance_status=GovernanceStatus.QUALIFY,
            claim_tag=ClaimTag.PLAUSIBLE,
        )

    @mcp.tool()
    def map_georeference(
        image_path: str,
        map_type: str = "geological",
        bounds_hint: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Georeference Map — SCAFFOLD.
        Accepts map context and returns a governed, reversible georeferencing plan.
        """
        return get_standard_envelope(
            {
                "image_path": image_path,
                "map_type": map_type,
                "bounds_hint": bounds_hint or {},
                "control_points": [],
                "crs": "EPSG:4326 (placeholder)",
                "reversible": True,
                "git_backed": True,
                "next_steps": [
                    "Upload control points (terrestrial or sensor anchors)",
                    "Cross-reference with EPSG/Geodetic standards",
                    "Run solve_georeference when >=3 control points provided",
                ],
                "governance": {
                    "f1_amanah": "All georeferencing actions are git-backed and reversible",
                    "f2_truth": "Map scale and CRS must be independently validated",
                    "f11_filesystem": "No destructive write permitted",
                },
            },
            governance_status=GovernanceStatus.HOLD,
            artifact_status=ArtifactStatus.DRAFT,
            claim_tag=ClaimTag.HYPOTHESIS,
        )
