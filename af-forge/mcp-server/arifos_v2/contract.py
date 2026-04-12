"""
Critical Fix 2: Execution/Governance Contract Separation
═══════════════════════════════════════════════════════════════════════════════

Every tool response must expose four top-level statuses:
1. execution_status: Did the tool run successfully? (SUCCESS | ERROR | TIMEOUT)
2. governance_verdict: Constitutional approval (SEAL | SABAR | HOLD | VOID)
3. artifact_state: Output state (USABLE | PARTIAL | STAGED | REJECTED)
4. continue_allowed: Can orchestration proceed? (true | false)

This eliminates the "success + SABAR" ambiguity that plagued v1.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Literal


class ExecutionStatus(str, Enum):
    """Did the tool execute without runtime errors?"""
    SUCCESS = "SUCCESS"      # Tool ran to completion
    ERROR = "ERROR"          # Runtime error (exception, crash)
    TIMEOUT = "TIMEOUT"      # Execution exceeded deadline
    DRY_RUN = "DRY_RUN"      # Simulated execution
    PARTIAL = "PARTIAL"      # Partial execution (some steps completed)


class GovernanceVerdict(str, Enum):
    """Constitutional approval state (13 Floors)."""
    SEAL = "SEAL"           # All floors passed, output approved
    SABAR = "SABAR"         # Needs clarification (F3 input clarity)
    HOLD = "HOLD"           # Requires human review (F7, F13)
    VOID = "VOID"           # Constitutional violation (F6, F9)
    PROVISIONAL = "PROVISIONAL"  # Preliminary approval, pending verification


class ArtifactState(str, Enum):
    """State of the output artifact."""
    USABLE = "USABLE"           # Complete, can be used downstream
    PARTIAL = "PARTIAL"         # Incomplete but usable with caveats
    STAGED = "STAGED"           # Prepared but not yet committed
    REJECTED = "REJECTED"       # Failed validation, do not use
    EMPTY = "EMPTY"             # No output produced


class ContinuationStatus(str, Enum):
    """Can the orchestration proceed?"""
    ALLOWED = "ALLOWED"         # Proceed to next step
    BLOCKED = "BLOCKED"         # Stop, do not proceed
    REQUIRES_HOLD = "REQUIRES_HOLD"  # Pause for human approval
    CLARIFY_FIRST = "CLARIFY_FIRST"  # Get more input, then retry


@dataclass
class ExecutionGovernanceContract:
    """
    Critical Fix 2: Clean separation of concerns.
    
    No more ambiguous combinations like:
    - status: "success" + verdict: "SABAR"  # Confusing!
    
    Now explicit:
    - execution_status: "SUCCESS"
    - governance_verdict: "SABAR" 
    - artifact_state: "STAGED"
    - continue_allowed: false
    """
    
    # Core four fields (machine-clean)
    execution_status: ExecutionStatus
    governance_verdict: GovernanceVerdict
    artifact_state: ArtifactState
    continue_allowed: bool
    
    # Human-readable
    message: str = ""
    
    # Detailed breakdown
    floors_checked: list[str] = field(default_factory=list)
    floors_failed: list[str] = field(default_factory=list)
    blocking_floor: str | None = None
    
    # Context for continuation
    next_allowed_tools: list[str] = field(default_factory=list)
    required_action: dict[str, Any] | None = None
    
    def to_dict(self) -> dict[str, Any]:
        """Export to machine-clean contract."""
        return {
            # The four critical fields
            "execution_status": self.execution_status.value,
            "governance_verdict": self.governance_verdict.value,
            "artifact_state": self.artifact_state.value,
            "continue_allowed": self.continue_allowed,
            
            # Human context
            "message": self.message,
            
            # Governance details
            "floors_checked": self.floors_checked,
            "floors_failed": self.floors_failed,
            "blocking_floor": self.blocking_floor,
            
            # Continuation guidance
            "next_allowed_tools": self.next_allowed_tools,
            "required_action": self.required_action,
        }
    
    @classmethod
    def success_seal(
        cls,
        message: str = "Execution successful, constitutionally approved",
        floors_checked: list[str] | None = None
    ) -> "ExecutionGovernanceContract":
        """Standard success path."""
        return cls(
            execution_status=ExecutionStatus.SUCCESS,
            governance_verdict=GovernanceVerdict.SEAL,
            artifact_state=ArtifactState.USABLE,
            continue_allowed=True,
            message=message,
            floors_checked=floors_checked or []
        )
    
    @classmethod
    def sabar_clarify(
        cls,
        message: str = "Input clarity required (F3)",
        floors_checked: list[str] | None = None,
        required_fields: list[str] | None = None
    ) -> "ExecutionGovernanceContract":
        """SABAR - needs clarification before proceeding."""
        return cls(
            execution_status=ExecutionStatus.SUCCESS,  # Tool ran fine
            governance_verdict=GovernanceVerdict.SABAR,  # But governance says wait
            artifact_state=ArtifactState.EMPTY,  # No usable output
            continue_allowed=False,
            message=message,
            floors_checked=floors_checked or ["F3"],
            floors_failed=["F3"],
            blocking_floor="F3",
            required_action={
                "type": "CLARIFY_INPUT",
                "required_fields": required_fields or [],
                "guidance": "Provide more specific input to proceed"
            }
        )
    
    @classmethod
    def hold_review(
        cls,
        message: str = "Human review required (F13)",
        floors_checked: list[str] | None = None,
        risk_level: str = "medium"
    ) -> "ExecutionGovernanceContract":
        """HOLD - requires human approval."""
        return cls(
            execution_status=ExecutionStatus.SUCCESS,
            governance_verdict=GovernanceVerdict.HOLD,
            artifact_state=ArtifactState.STAGED,  # Prepared but waiting
            continue_allowed=False,
            message=message,
            floors_checked=floors_checked or ["F13"],
            floors_failed=["F13"],
            blocking_floor="F13",
            required_action={
                "type": "HUMAN_APPROVAL",
                "approval_code": f"888-{__import__('datetime').datetime.now(__import__('datetime').timezone.utc).strftime('%Y%m%d%H%M')}",
                "risk_level": risk_level,
                "guidance": "Provide approval code to proceed"
            }
        )
    
    @classmethod
    def void_blocked(
        cls,
        message: str = "Constitutional violation detected",
        floors_checked: list[str] | None = None,
        blocking_floor: str = "F6"
    ) -> "ExecutionGovernanceContract":
        """VOID - blocked by constitutional floor."""
        return cls(
            execution_status=ExecutionStatus.SUCCESS,  # Tool ran and detected violation
            governance_verdict=GovernanceVerdict.VOID,
            artifact_state=ArtifactState.REJECTED,
            continue_allowed=False,
            message=message,
            floors_checked=floors_checked or [blocking_floor],
            floors_failed=[blocking_floor],
            blocking_floor=blocking_floor,
            required_action={
                "type": "ABORT",
                "guidance": "Request violates constitutional constraints. Aborting."
            }
        )
    
    @classmethod
    def error_runtime(
        cls,
        message: str = "Runtime error occurred",
        error_details: dict[str, Any] | None = None
    ) -> "ExecutionGovernanceContract":
        """Execution error (not governance)."""
        return cls(
            execution_status=ExecutionStatus.ERROR,
            governance_verdict=GovernanceVerdict.VOID,  # Error = no approval
            artifact_state=ArtifactState.REJECTED,
            continue_allowed=False,
            message=message,
            required_action={
                "type": "RETRY_OR_ABORT",
                "error_details": error_details or {},
                "guidance": "Check error details and retry if appropriate"
            }
        )


# Factory functions for common patterns

def contract_from_result(
    ok: bool,
    verdict: str,
    has_output: bool = True,
    floors_checked: list[str] | None = None,
    message: str = ""
) -> ExecutionGovernanceContract:
    """
    Create contract from simplified parameters.
    
    This bridges the old (ok, verdict) pattern to the new explicit contract.
    """
    floors = floors_checked or []
    
    # Map old verdict to new
    gov_verdict = GovernanceVerdict(verdict) if verdict in [v.value for v in GovernanceVerdict] else GovernanceVerdict.SABAR
    
    # Derive execution status
    if not ok:
        exec_status = ExecutionStatus.ERROR
    else:
        exec_status = ExecutionStatus.SUCCESS
    
    # Derive artifact state
    if gov_verdict == GovernanceVerdict.VOID:
        art_state = ArtifactState.REJECTED
    elif gov_verdict == GovernanceVerdict.HOLD:
        art_state = ArtifactState.STAGED
    elif gov_verdict == GovernanceVerdict.SABAR:
        art_state = ArtifactState.EMPTY
    elif has_output:
        art_state = ArtifactState.USABLE
    else:
        art_state = ArtifactState.PARTIAL
    
    # Derive continuation
    can_continue = gov_verdict == GovernanceVerdict.SEAL and ok
    
    # Determine failed floors
    failed_floors = []
    if gov_verdict == GovernanceVerdict.SABAR:
        failed_floors = ["F3"]
    elif gov_verdict == GovernanceVerdict.HOLD:
        failed_floors = ["F7", "F13"]
    elif gov_verdict == GovernanceVerdict.VOID:
        failed_floors = ["F6", "F9"]
    
    return ExecutionGovernanceContract(
        execution_status=exec_status,
        governance_verdict=gov_verdict,
        artifact_state=art_state,
        continue_allowed=can_continue,
        message=message or f"Execution {exec_status.value}, Governance {gov_verdict.value}",
        floors_checked=floors,
        floors_failed=failed_floors,
        blocking_floor=failed_floors[0] if failed_floors else None
    )
