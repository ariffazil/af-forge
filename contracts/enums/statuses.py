"""
GEOX status enums and standard envelope.
DITEMPA BUKAN DIBERI
"""

from enum import Enum
from typing import Any, Dict, Optional


class Dimension(Enum):
    prospect = "prospect"
    well = "well"
    earth3d = "earth3d"
    map = "map"
    cross = "cross"
    section = "section"
    time4d = "time4d"
    physics = "physics"
    dashboard = "dashboard"


class ExecutionStatus(Enum):
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"
    HALT = "HALT"


class GovernanceStatus(Enum):
    APPROVED = "APPROVED"
    QUALIFY = "QUALIFY"
    HOLD = "HOLD"
    VOID = "VOID"
    SEAL = "SEAL"


class ArtifactStatus(Enum):
    USABLE = "USABLE"
    STAGED = "STAGED"
    REJECTED = "REJECTED"
    INCOMPLETE = "INCOMPLETE"
    DRAFT = "DRAFT"
    VERIFIED = "VERIFIED"
    COMPUTED = "COMPUTED"
    LOADED = "LOADED"
    IN_REVIEW = "IN_REVIEW"


class FloorStatus(Enum):
    active = "active"
    inactive = "inactive"
    void = "void"
    halt = "halt"


class Runtime(Enum):
    vps = "vps"
    fastmcp = "fastmcp"
    local = "local"


class Transport(Enum):
    http = "http"
    mcp = "mcp"
    stdio = "stdio"
    sse = "sse"


class ToolCategory(Enum):
    foundation = "foundation"
    physics = "physics"
    bridge = "bridge"
    demo = "demo"
    system = "system"


class ProspectVerdict(Enum):
    DRO = "DRO"
    DRIL = "DRIL"
    HOLD = "HOLD"
    DROP = "DROP"


class ClaimTag(Enum):
    CLAIM = "CLAIM"
    PLAUSIBLE = "PLAUSIBLE"
    HYPOTHESIS = "HYPOTHESIS"


def get_standard_envelope(
    data: Dict[str, Any],
    execution_status: ExecutionStatus = ExecutionStatus.SUCCESS,
    governance_status: GovernanceStatus = GovernanceStatus.QUALIFY,
    artifact_status: ArtifactStatus = ArtifactStatus.COMPUTED,
    uncertainty: Optional[float] = None,
    evidence_refs: Optional[list] = None,
    diagnostics: Optional[list] = None,
    ui_resource_uri: Optional[str] = None,
    claim_tag: Optional[ClaimTag] = None,
) -> Dict[str, Any]:
    """
    Canonical MCP Apps Response Envelope.
    Follows MCP spec + arifOS Governance + MCP Apps UI.
    """
    envelope = {
        "data": data,
        "_meta": {
            "seal": "DITEMPA BUKAN DIBERI",
            "execution_status": execution_status.value,
            "governance_status": governance_status.value,
            "artifact_status": artifact_status.value,
            "primary_artifact": data.get("artifact_type", "UnknownArtifact"),
            "tool_class": "compute",
            "uncertainty": uncertainty,
            "evidence_refs": evidence_refs or [],
            "diagnostics": diagnostics or [],
        },
    }
    if ui_resource_uri:
        envelope["ui"] = {"resourceUri": ui_resource_uri}
    if claim_tag:
        envelope["_meta"]["claim_tag"] = claim_tag.value
    return envelope
