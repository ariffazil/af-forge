from fastmcp import FastMCP
import json
import os
from pathlib import Path
from typing import Any, Dict, List

# Initialize FastMCP
mcp = FastMCP("WELL — Biological Substrate")

# Constants
WELL_STATE_PATH = Path(os.environ.get("WELL_STATE_PATH", "/root/WELL/state.json"))

def _get_raw_state() -> Dict[str, Any]:
    """Helper to read WELL state with fallback."""
    if not WELL_STATE_PATH.exists():
        return {
            "ok": False,
            "well_score": 50.0,
            "verdict": "UNKNOWN",
            "bandwidth": "NORMAL",
            "floors_violated": [],
            "message": "WELL substrate offline or state missing."
        }
    try:
        with open(WELL_STATE_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        return {"error": str(e), "ok": False}

@mcp.tool()
def mcp_P_well_state_read() -> Dict[str, Any]:
    """
    Read the current biological telemetry snapshot from the WELL substrate.
    Returns: A dictionary containing scores, metrics, and readiness verdict.
    """
    state = _get_raw_state()
    return state

@mcp.tool()
def mcp_P_well_readiness_check() -> Dict[str, Any]:
    """
    Perform a biological readiness check for constitutional governance.
    Returns: A verdict (OPTIMAL, FUNCTIONAL, DEGRADED, LOW_CAPACITY) and supporting metrics.
    """
    state = _get_raw_state()
    score = state.get("well_score", 50.0)
    violations = state.get("floors_violated", [])

    if violations:
        verdict = "DEGRADED"
        bandwidth = "RESTRICTED"
    elif score >= 80:
        verdict = "OPTIMAL"
        bandwidth = "FULL"
    elif score >= 60:
        verdict = "FUNCTIONAL"
        bandwidth = "NORMAL"
    else:
        verdict = "LOW_CAPACITY"
        bandwidth = "REDUCED"

    return {
        "verdict": verdict,
        "well_score": score,
        "bandwidth": bandwidth,
        "violations": violations,
        "timestamp": state.get("timestamp")
    }

@mcp.tool()
def mcp_P_well_floor_scan() -> Dict[str, Any]:
    """
    Scan the 13 W-Floors (Well-being dimensions) for any constitutional violations.
    Returns: A list of violated floors and current system health.
    """
    state = _get_raw_state()
    return {
        "floors_violated": state.get("floors_violated", []),
        "metrics": state.get("metrics", {}),
        "health_score": state.get("well_score", 0.0)
    }

if __name__ == "__main__":
    mcp.run()
