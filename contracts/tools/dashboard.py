"""
GEOX Dashboard Tools
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


def register_dashboard_tools(mcp: FastMCP, profile: Optional[str] = None) -> None:
    """Register all dashboard tools."""

    @mcp.tool()
    def dashboard_open(app_id: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Open a GEOX dashboard application."""
        return get_standard_envelope(
            {"app_id": app_id, "opened": True, "context": context or {}},
            governance_status=GovernanceStatus.SEAL,
            claim_tag=ClaimTag.CLAIM,
        )

    @mcp.tool()
    def legacy_open_dashboard(app_id: str) -> Dict[str, Any]:
        """Legacy alias to open a dashboard."""
        return dashboard_open(app_id)
