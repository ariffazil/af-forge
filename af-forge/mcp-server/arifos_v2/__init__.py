"""
arifOS MCP Server v2.0 - Critical Fixes Implementation
═══════════════════════════════════════════════════════════════════════════════

Addresses all 5 critical fixes from the ChatGPT audit:

1. IDENTITY CONTINUITY (Critical Fix 1)
   - Authoritative identity propagation with declared/verified/effective distinction
   - Explicit degradation notification (never silent drift)
   - IdentityAuthority class manages all identity state transitions

2. EXECUTION/GOVERNANCE SEPARATION (Critical Fix 2)
   - Every response exposes: execution_status, governance_verdict, artifact_state, continue_allowed
   - No more ambiguous "success + SABAR" patterns
   - Machine-clean contract for orchestration layers

3. KERNEL CONTRACT HARDENING (Critical Fix 3)
   - Returns only: READY, HOLD, BLOCKED
   - Clean handoff spec: next_stage, required_inputs, release_condition
   - No nested ambiguity spirals

4. VAULT SEMANTICS (Critical Fix 4)
   - Binary outcomes: SEALED, STAGED_NOT_SEALED, REJECTED
   - Unambiguous persistence contract
   - Auditable by design

5. USABLE ARTIFACTS (Critical Fix 5)
   - Mind/Reply return structured payloads: answer_basis, claims, assumptions, uncertainties
   - Substance over constitutional theatre
   - recommended_render for direct use

Author: arifOS Engineering
Version: 2.0.0-CRITICAL-FIXES
"""

__version__ = "2.0.0-CRITICAL-FIXES"
__all__ = ["mcp", "IdentityAuthority", "ExecutionGovernanceContract", "KernelState"]
