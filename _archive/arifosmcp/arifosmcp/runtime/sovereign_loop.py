"""
arifosmcp/runtime/sovereign_loop.py — L3 Sovereign Loop Invariant Enforcement

Enforces the 5 minimal invariants of the sovereign execution path:

1. A SEAL verdict must reference exactly one decision_packet_id.
2. A forge manifest cannot be created without valid judgment_id + matching vault_id + matching decision_packet_id.
3. Every execution must reference one manifest_id.
4. Every post-execution attestation must reference execution_id + manifest_id + judgment_id.
5. Every object must be replayable from hashes alone.

ΔΩΨ | DITEMPA BUKAN DIBERI
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from arifosmcp.runtime.contracts import (
    DecisionPacket,
    ForgeManifest,
    Judgment,
    VaultPostRecord,
    VaultPreRecord,
)


@dataclass
class InvariantViolation:
    """Record of a sovereign loop invariant violation."""

    invariant: str
    message: str
    stage: str
    offending_id: str = ""
    expected: Any = None
    actual: Any = None
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict[str, Any]:
        return {
            "invariant": self.invariant,
            "message": self.message,
            "stage": self.stage,
            "offending_id": self.offending_id,
            "expected": self.expected,
            "actual": self.actual,
            "timestamp": self.timestamp,
        }


class SovereignLoopEnforcer:
    """
    Enforces L3 sovereign loop invariants.

    Usage:
        enforcer = SovereignLoopEnforcer()
        enforcer.register_packet(packet)
        enforcer.register_judgment(judgment)
        enforcer.register_vault_pre(vault_pre)
        enforcer.register_manifest(manifest)
        enforcer.register_execution(execution)
        enforcer.register_vault_post(vault_post)

        if enforcer.is_valid():
            print("Sovereign loop is closed and valid")
        else:
            for v in enforcer.violations:
                print(v.message)
    """

    def __init__(self) -> None:
        self.packet: DecisionPacket | None = None
        self.judgment: Judgment | None = None
        self.vault_pre: VaultPreRecord | None = None
        self.manifest: ForgeManifest | None = None
        self.execution: Any | None = None  # ExecutionRecord or dict
        self.vault_post: VaultPostRecord | None = None
        self.violations: list[InvariantViolation] = []

    # ═══════════════════════════════════════════════════════════════════════════════
    # Registration Methods
    # ═══════════════════════════════════════════════════════════════════════════════

    def register_packet(self, packet: DecisionPacket) -> None:
        self.packet = packet

    def register_judgment(self, judgment: Judgment) -> None:
        self.judgment = judgment
        self._check_invariant_1()

    def register_vault_pre(self, vault_pre: VaultPreRecord) -> None:
        self.vault_pre = vault_pre

    def register_manifest(self, manifest: ForgeManifest) -> None:
        self.manifest = manifest
        self._check_invariant_2()

    def register_execution(self, execution: Any) -> None:
        self.execution = execution
        self._check_invariant_3()

    def register_vault_post(self, vault_post: VaultPostRecord) -> None:
        self.vault_post = vault_post
        self._check_invariant_4()

    # ═══════════════════════════════════════════════════════════════════════════════
    # Invariant Checks
    # ═══════════════════════════════════════════════════════════════════════════════

    def _check_invariant_1(self) -> None:
        """A SEAL verdict must reference exactly one decision_packet_id."""
        if not self.judgment:
            return
        if self.judgment.verdict == "SEAL" and not self.judgment.decision_packet_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-1",
                    message="SEAL verdict missing decision_packet_id linkage",
                    stage="judge",
                    offending_id=self.judgment.judgment_id,
                    expected="non-empty decision_packet_id",
                    actual=self.judgment.decision_packet_id,
                )
            )

    def _check_invariant_2(self) -> None:
        """
        A forge manifest cannot be created without:
        - valid judgment_id
        - matching vault_id
        - matching decision_packet_id
        """
        if not self.manifest:
            return

        # Check judgment_id presence
        if not self.manifest.judgment_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-2a",
                    message="Forge manifest missing judgment_id",
                    stage="forge",
                    offending_id=self.manifest.manifest_id,
                    expected="non-empty judgment_id",
                    actual=self.manifest.judgment_id,
                )
            )

        # Check vault_id matches registered vault_pre
        if self.vault_pre and self.manifest.vault_id != self.vault_pre.vault_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-2b",
                    message="Forge manifest vault_id does not match vault_pre",
                    stage="forge",
                    offending_id=self.manifest.manifest_id,
                    expected=self.vault_pre.vault_id,
                    actual=self.manifest.vault_id,
                )
            )

        # Check decision_packet_id matches registered packet
        if self.packet and self.manifest.decision_packet_id != self.packet.packet_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-2c",
                    message="Forge manifest decision_packet_id does not match registered packet",
                    stage="forge",
                    offending_id=self.manifest.manifest_id,
                    expected=self.packet.packet_id,
                    actual=self.manifest.decision_packet_id,
                )
            )

        # Check judgment is not expired
        if self.judgment and self.judgment.is_expired():
            self.violations.append(
                InvariantViolation(
                    invariant="INV-2d",
                    message="Forge attempted with expired judgment",
                    stage="forge",
                    offending_id=self.manifest.manifest_id,
                    expected=f"expires_at > {datetime.now(timezone.utc).isoformat()}",
                    actual=self.judgment.expires_at,
                )
            )

    def _check_invariant_3(self) -> None:
        """Every execution must reference one manifest_id."""
        if not self.execution:
            return
        manifest_id = getattr(self.execution, "manifest_id", self.execution.get("manifest_id") if isinstance(self.execution, dict) else None)
        if not manifest_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-3",
                    message="Execution record missing manifest_id linkage",
                    stage="execute",
                    offending_id=getattr(self.execution, "execution_id", self.execution.get("execution_id", "") if isinstance(self.execution, dict) else ""),
                    expected="non-empty manifest_id",
                    actual=manifest_id,
                )
            )

    def _check_invariant_4(self) -> None:
        """Every post-execution attestation must reference execution_id + manifest_id + judgment_id."""
        if not self.vault_post:
            return

        if not self.vault_post.execution_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-4a",
                    message="Vault post attestation missing execution_id",
                    stage="vault_post",
                    offending_id=self.vault_post.attestation_id,
                    expected="non-empty execution_id",
                    actual=self.vault_post.execution_id,
                )
            )

        if not self.vault_post.manifest_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-4b",
                    message="Vault post attestation missing manifest_id",
                    stage="vault_post",
                    offending_id=self.vault_post.attestation_id,
                    expected="non-empty manifest_id",
                    actual=self.vault_post.manifest_id,
                )
            )

        if not self.vault_post.judgment_id:
            self.violations.append(
                InvariantViolation(
                    invariant="INV-4c",
                    message="Vault post attestation missing judgment_id",
                    stage="vault_post",
                    offending_id=self.vault_post.attestation_id,
                    expected="non-empty judgment_id",
                    actual=self.vault_post.judgment_id,
                )
            )

    def _check_invariant_5(self) -> None:
        """Every object must be replayable from hashes alone."""
        objects_to_check = [
            ("packet", self.packet, lambda p: p.compute_hash() if p else ""),
            ("judgment", self.judgment, lambda j: j.compute_hash() if j else ""),
            ("manifest", self.manifest, lambda m: m.manifest_hash if m else ""),
        ]

        for name, obj, hash_fn in objects_to_check:
            if obj and not hash_fn(obj):
                self.violations.append(
                    InvariantViolation(
                        invariant="INV-5",
                        message=f"{name} object missing replay hash",
                        stage=name,
                        offending_id=getattr(obj, f"{name}_id", getattr(obj, "judgment_id", "")),
                        expected="non-empty hash",
                        actual="",
                    )
                )

    # ═══════════════════════════════════════════════════════════════════════════════
    # Validation Interface
    # ═══════════════════════════════════════════════════════════════════════════════

    def is_valid(self) -> bool:
        """Run all invariant checks and return True if no violations."""
        self._check_invariant_5()
        return len(self.violations) == 0

    def get_report(self) -> dict[str, Any]:
        """Get full validation report."""
        return {
            "valid": self.is_valid(),
            "violation_count": len(self.violations),
            "violations": [v.to_dict() for v in self.violations],
            "stages_present": {
                "packet": self.packet is not None,
                "judgment": self.judgment is not None,
                "vault_pre": self.vault_pre is not None,
                "manifest": self.manifest is not None,
                "execution": self.execution is not None,
                "vault_post": self.vault_post is not None,
            },
            "loop_closed": all([
                self.packet is not None,
                self.judgment is not None,
                self.vault_pre is not None,
                self.manifest is not None,
                self.execution is not None,
                self.vault_post is not None,
            ]),
        }

    def clear(self) -> None:
        """Reset enforcer state."""
        self.packet = None
        self.judgment = None
        self.vault_pre = None
        self.manifest = None
        self.execution = None
        self.vault_post = None
        self.violations = []


# ═══════════════════════════════════════════════════════════════════════════════
# Static Validation Helpers (for use in tool dispatch)
# ═══════════════════════════════════════════════════════════════════════════════


def validate_forge_input(
    judgment_id: str,
    vault_id: str,
    decision_packet_id: str,
    expected_judgment: Judgment | None = None,
    expected_vault: VaultPreRecord | None = None,
    expected_packet: DecisionPacket | None = None,
) -> tuple[bool, list[str]]:
    """
    Validate forge manifest creation request.

    Returns (valid: bool, errors: list[str]).
    """
    errors = []

    if not judgment_id:
        errors.append("INV-2a: judgment_id is required")
    if not vault_id:
        errors.append("INV-2b: vault_id is required")
    if not decision_packet_id:
        errors.append("INV-2c: decision_packet_id is required")

    if expected_judgment and judgment_id != expected_judgment.judgment_id:
        errors.append(f"INV-2a: judgment_id mismatch (expected {expected_judgment.judgment_id}, got {judgment_id})")

    if expected_judgment and expected_judgment.is_expired():
        errors.append("INV-2d: judgment has expired")

    if expected_vault and vault_id != expected_vault.vault_id:
        errors.append(f"INV-2b: vault_id mismatch (expected {expected_vault.vault_id}, got {vault_id})")

    if expected_packet and decision_packet_id != expected_packet.packet_id:
        errors.append(f"INV-2c: decision_packet_id mismatch (expected {expected_packet.packet_id}, got {decision_packet_id})")

    return len(errors) == 0, errors


def validate_execution_input(
    manifest_id: str,
    expected_manifest: ForgeManifest | None = None,
) -> tuple[bool, list[str]]:
    """
    Validate execution request.

    Returns (valid: bool, errors: list[str]).
    """
    errors = []

    if not manifest_id:
        errors.append("INV-3: manifest_id is required")

    if expected_manifest and manifest_id != expected_manifest.manifest_id:
        errors.append(f"INV-3: manifest_id mismatch (expected {expected_manifest.manifest_id}, got {manifest_id})")

    return len(errors) == 0, errors


def validate_vault_post_input(
    execution_id: str,
    manifest_id: str,
    judgment_id: str,
    expected_execution: Any | None = None,
    expected_manifest: ForgeManifest | None = None,
    expected_judgment: Judgment | None = None,
) -> tuple[bool, list[str]]:
    """
    Validate post-execution attestation request.

    Returns (valid: bool, errors: list[str]).
    """
    errors = []

    if not execution_id:
        errors.append("INV-4a: execution_id is required")
    if not manifest_id:
        errors.append("INV-4b: manifest_id is required")
    if not judgment_id:
        errors.append("INV-4c: judgment_id is required")

    if expected_execution:
        exec_id = getattr(expected_execution, "execution_id", expected_execution.get("execution_id") if isinstance(expected_execution, dict) else None)
        if execution_id != exec_id:
            errors.append(f"INV-4a: execution_id mismatch (expected {exec_id}, got {execution_id})")

    if expected_manifest and manifest_id != expected_manifest.manifest_id:
        errors.append(f"INV-4b: manifest_id mismatch (expected {expected_manifest.manifest_id}, got {manifest_id})")

    if expected_judgment and judgment_id != expected_judgment.judgment_id:
        errors.append(f"INV-4c: judgment_id mismatch (expected {expected_judgment.judgment_id}, got {judgment_id})")

    return len(errors) == 0, errors


__all__ = [
    "InvariantViolation",
    "SovereignLoopEnforcer",
    "validate_forge_input",
    "validate_execution_input",
    "validate_vault_post_input",
]
