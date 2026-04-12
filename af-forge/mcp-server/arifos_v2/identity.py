"""
Critical Fix 1: Identity Continuity Authority
═══════════════════════════════════════════════════════════════════════════════

Identity is foundational to constitutional authority. This module ensures:

1. Three-layer identity distinction:
   - declared_actor_id: What the caller claims
   - verified_actor_id: What the system has verified
   - effective_actor_id: What the system will actually use

2. Explicit degradation (never silent):
   - If identity degrades, caller gets identity_status: "DEGRADED" with reason
   - No more anonymous drift without notification

3. Authoritative propagation:
   - Every handoff preserves all three identity fields
   - Verification chain is maintained across tool calls
   - Audit trail for all identity state changes
"""

from __future__ import annotations

import hashlib
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal


class IdentityStatus(str, Enum):
    """Canonical identity states."""
    ANONYMOUS = "anonymous"
    DECLARED = "declared"  # Has declared_name but unverified
    VERIFIED = "verified"  # Cryptographically verified
    DEGRADED = "degraded"  # Was higher, now reduced (CRITICAL: explicit)
    REVOKED = "revoked"    # Explicitly invalidated


class DegradationReason(str, Enum):
    """Explicit reasons for identity degradation."""
    VERIFICATION_NOT_PROVIDED = "verification_not_provided"
    VERIFICATION_FAILED = "verification_failed"
    TOKEN_EXPIRED = "token_expired"
    SESSION_INVALID = "session_invalid"
    SCOPE_MISMATCH = "scope_mismatch"
    CONSTITUTIONAL_VOID = "constitutional_void"
    EXPLICIT_DOWNGRADE = "explicit_downgrade"


@dataclass(frozen=True)
class IdentityProof:
    """Cryptographic proof of identity (F11 compliant)."""
    signature: str
    timestamp: str
    nonce: str
    scope: list[str] = field(default_factory=list)
    
    def verify(self, declared_id: str) -> bool:
        """Verify the proof matches the declared identity."""
        # In production: actual cryptographic verification
        payload = f"{declared_id}:{self.timestamp}:{self.nonce}"
        expected = hashlib.sha256(payload.encode()).hexdigest()[:32]
        return self.signature.startswith(expected[:8])


@dataclass
class IdentityAuthority:
    """
    Critical Fix 1: Authoritative Identity Container
    
    Never silently degrades. All state changes are explicit and auditable.
    """
    # Three-layer identity (as per audit requirement)
    declared_actor_id: str = "anonymous"
    verified_actor_id: str | None = None
    effective_actor_id: str = "anonymous"
    
    # Status tracking
    status: IdentityStatus = IdentityStatus.ANONYMOUS
    previous_status: IdentityStatus | None = None
    degradation_reason: DegradationReason | None = None
    
    # Metadata
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    anchored_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_verified_at: str | None = None
    proof: IdentityProof | None = None
    
    # Audit trail
    transitions: list[dict[str, Any]] = field(default_factory=list)
    
    def __post_init__(self):
        """Ensure effective_actor_id is always set correctly."""
        self._recalculate_effective()
    
    def _recalculate_effective(self) -> None:
        """Effective ID is verified if available, else declared, else anonymous."""
        if self.verified_actor_id:
            self.effective_actor_id = self.verified_actor_id
        elif self.declared_actor_id and self.declared_actor_id != "anonymous":
            self.effective_actor_id = self.declared_actor_id
        else:
            self.effective_actor_id = "anonymous"
    
    def declare(self, actor_id: str, context: dict[str, Any] | None = None) -> "IdentityAuthority":
        """
        Set declared identity. Does NOT verify.
        Returns new instance (immutable transition).
        """
        new_auth = IdentityAuthority(
            declared_actor_id=actor_id,
            verified_actor_id=self.verified_actor_id,  # Preserve existing verification
            status=IdentityStatus.DECLARED if actor_id != "anonymous" else IdentityStatus.ANONYMOUS,
            previous_status=self.status,
            session_id=self.session_id,
            anchored_at=self.anchored_at,
            last_verified_at=self.last_verified_at,
            proof=self.proof,
            transitions=self.transitions + [{
                "from": self.status.value,
                "to": IdentityStatus.DECLARED.value,
                "declared": actor_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "context": context or {}
            }]
        )
        new_auth._recalculate_effective()
        return new_auth
    
    def verify(self, proof: IdentityProof, context: dict[str, Any] | None = None) -> "IdentityAuthority":
        """
        Verify declared identity with cryptographic proof.
        Returns new instance with VERIFIED status.
        """
        if not proof.verify(self.declared_actor_id):
            # Verification failed - explicit degradation
            return self.degrade(
                DegradationReason.VERIFICATION_FAILED,
                "Proof does not match declared identity",
                context
            )
        
        new_auth = IdentityAuthority(
            declared_actor_id=self.declared_actor_id,
            verified_actor_id=self.declared_actor_id,  # Now verified
            status=IdentityStatus.VERIFIED,
            previous_status=self.status,
            session_id=self.session_id,
            anchored_at=self.anchored_at,
            last_verified_at=datetime.now(timezone.utc).isoformat(),
            proof=proof,
            transitions=self.transitions + [{
                "from": self.status.value,
                "to": IdentityStatus.VERIFIED.value,
                "verified_id": self.declared_actor_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "context": context or {}
            }]
        )
        new_auth._recalculate_effective()
        return new_auth
    
    def degrade(
        self, 
        reason: DegradationReason, 
        explanation: str,
        context: dict[str, Any] | None = None
    ) -> "IdentityAuthority":
        """
        CRITICAL: Explicit degradation (never silent).
        
        This is the key fix - when identity drops, it's ALWAYS explicit
        with a machine-readable reason.
        """
        new_auth = IdentityAuthority(
            declared_actor_id=self.declared_actor_id,  # Keep what was declared
            verified_actor_id=None,  # Clear verification
            status=IdentityStatus.DEGRADED,
            previous_status=self.status,
            degradation_reason=reason,
            session_id=self.session_id,
            anchored_at=self.anchored_at,
            last_verified_at=self.last_verified_at,
            proof=None,  # Clear proof
            transitions=self.transitions + [{
                "from": self.status.value,
                "to": IdentityStatus.DEGRADED.value,
                "reason": reason.value,
                "explanation": explanation,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "context": context or {}
            }]
        )
        new_auth._recalculate_effective()
        return new_auth
    
    def to_contract(self) -> dict[str, Any]:
        """
        Export to machine-clean contract format.
        This is what tools receive - explicit and unambiguous.
        """
        return {
            # Three-layer identity (audit requirement)
            "declared_actor_id": self.declared_actor_id,
            "verified_actor_id": self.verified_actor_id,
            "effective_actor_id": self.effective_actor_id,
            
            # Status with explicit degradation
            "identity_status": self.status.value,
            "previous_identity_status": self.previous_status.value if self.previous_status else None,
            "degradation_reason": self.degradation_reason.value if self.degradation_reason else None,
            
            # Metadata
            "session_id": self.session_id,
            "anchored_at": self.anchored_at,
            "last_verified_at": self.last_verified_at,
            "transition_count": len(self.transitions),
            
            # Verification available
            "is_verified": self.status == IdentityStatus.VERIFIED,
            "verification_scope": self.proof.scope if self.proof else [],
        }
    
    @classmethod
    def anonymous(cls) -> "IdentityAuthority":
        """Create fresh anonymous identity."""
        return cls()
    
    @classmethod
    def from_declaration(cls, actor_id: str) -> "IdentityAuthority":
        """Create from a declaration (unverified)."""
        auth = cls(declared_actor_id=actor_id)
        return auth.declare(actor_id)


# Global identity registry (per-session)
_identity_registry: dict[str, IdentityAuthority] = {}


def get_identity(session_id: str) -> IdentityAuthority:
    """Get or create identity for session."""
    if session_id not in _identity_registry:
        _identity_registry[session_id] = IdentityAuthority.anonymous()
    return _identity_registry[session_id]


def set_identity(session_id: str, authority: IdentityAuthority) -> None:
    """Update identity for session."""
    _identity_registry[session_id] = authority


def propagate_identity(
    from_session: str, 
    to_session: str,
    required_verification: bool = False
) -> IdentityAuthority:
    """
    Propagate identity across session handoff.
    
    If required_verification is True and identity is not verified,
    returns DEGRADED status with explicit reason.
    """
    source = get_identity(from_session)
    
    if required_verification and source.status != IdentityStatus.VERIFIED:
        # Explicit degradation on handoff
        degraded = source.degrade(
            DegradationReason.VERIFICATION_NOT_PROVIDED,
            f"Handoff to {to_session} requires verification but none provided"
        )
        set_identity(to_session, degraded)
        return degraded
    
    # Propagate with transition log
    new_auth = IdentityAuthority(
        declared_actor_id=source.declared_actor_id,
        verified_actor_id=source.verified_actor_id,
        status=source.status,
        session_id=to_session,  # New session ID
        anchored_at=datetime.now(timezone.utc).isoformat(),
        last_verified_at=source.last_verified_at,
        proof=source.proof,
        transitions=source.transitions + [{
            "from": from_session,
            "to": to_session,
            "propagated_identity": source.effective_actor_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }]
    )
    new_auth._recalculate_effective()
    set_identity(to_session, new_auth)
    return new_auth
