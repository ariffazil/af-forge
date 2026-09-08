// forge_face_tools.ts
// Identity Continuity — Face Tools Declaration (Ratified 2026-09-08)
// Doctrine: /root/AAA/instructions/identity-continuity.md
// Hardcoded: forge_face_embed + forge_face_match primitives
// Floor: F1 AMANAH (rented data) · F3 WITNESS · F6 MARUAH · F11 AUDIT · F13 SOVEREIGN

import type { ToolDeclaration, IdentityWitnessSpec } from "./types";

export const FORGE_FACE_TOOLS: ToolDeclaration[] = [
  {
    name: "forge_face_embed",
    domain: "biometric",
    description:
      "Extract 512-d face embedding from reference photo set, bind to actor handle. " +
      "Biometric data is RENTED, never permanent. TTL = min(consent_expiry, purpose_expiry). " +
      "Default 90-day purpose-bound embedding. Receipt-only in VAULT999.",
    identity_support: "BINDING_T1",
    identity_witness_written: "W1_face",
    required_consent_scope: "biometric.full",
    declared_side_effects: ["filesystem", "vault"],
    required_permissions: ["read", "write", "vault"],
    input_schema: {
      actor_handle: "string (canonical handle, e.g. 'syed_khairuddin')",
      photo_paths: "string[] (3-5 reference photos)",
      consent_token: "string (required, from well_consent_audit)",
      purpose: "string (default: 'identity_continuity_enrollment')",
      ttl_days: "number (default: 90)",
    },
    output_schema: {
      face_signature: {
        embedding_dim: 512,
        embedding_hash: "sha256:...",
        mean_embedding_path: "/root/AAA/registry/biometric/<actor>/embed_W1.npy (mode 600)",
        reference_set_path: "/root/AAA/registry/biometric/<actor>/refs/",
        ttl_days: 90,
        expiry: "iso8601",
        consent_scope: "biometric.full",
      },
      receipt: "VAULT999 receipt (fact-of-existence, not embedding)",
    },
    reversibility: "FULL — recompute from new photo set after expiry",
    receipt_policy: "mandatory — VAULT999 RECEIPT_ONLY (no embedding in vault)",
    constitutional_floors: ["F1", "F6", "F11", "F13"],
    gate_dependencies: ["well_consent_audit"],
    default_action_class: "EXECUTE_REVERSIBLE",
  },

  {
    name: "forge_face_match",
    domain: "biometric",
    description:
      "Verify candidate face embedding against actor's reference set. " +
      "Returns cosine similarity + grade (STRONG/WEAK/NONE). " +
      "ICL-1.1: never carries sole authority — must be combined with W3-W6 quorum.",
    identity_support: "BINDING_T1",
    identity_witness_used: "W1_face",
    declared_side_effects: [],
    required_permissions: ["read"],
    input_schema: {
      candidate_image_path: "string (path to candidate image)",
      actor_handle: "string",
      threshold: "number (default: 0.65)",
    },
    output_schema: {
      match: "boolean",
      similarity: "number (0.0-1.0)",
      match_grade: "STRONG | WEAK | NONE",
      detector_confidence: "number",
    },
    reversibility: "FULL",
    receipt_policy: "mandatory — VAULT999 RECEIPT_ONLY",
    constitutional_floors: ["F1", "F11"],
    default_action_class: "OBSERVE",
  },

  {
    name: "forge_face_enroll",
    domain: "biometric",
    description:
      "Full enrollment pipeline: consent grant → face_embed → identity_card update → VAULT999 receipt. " +
      "Establishes W1_face witness for an actor. Idempotent on re-enrollment after expiry.",
    identity_support: "BINDING_T1",
    identity_witness_written: "W1_face",
    required_consent_scope: "biometric.full",
    declared_side_effects: ["filesystem", "vault"],
    required_permissions: ["read", "write", "vault", "consent"],
    input_schema: {
      actor_handle: "string",
      photo_paths: "string[] (3-5 reference photos)",
      purpose: "string (e.g. 'Mr KL 2026 Master Open stage visualization')",
      ttl_days: "number (default: 90)",
    },
    output_schema: {
      identity_card_path: "/root/AAA/registry/identity_cards/<actor>.yaml",
      w1_status: "ENROLLED | EXPIRED | REVOKED",
      embedding_hash: "sha256:...",
      consent_granted_at: "iso8601",
      expiry: "iso8601",
      receipt_ref: "VAULT999 path",
    },
    reversibility: "FULL — tombstone on expiry via arif_memory(mode=forget)",
    receipt_policy: "mandatory",
    constitutional_floors: ["F1", "F6", "F11", "F13"],
    gate_dependencies: ["well_consent_set_scope", "forge_face_embed", "arif_memory(mode=remember)"],
    default_action_class: "EXECUTE_REVERSIBLE",
  },

  {
    name: "identity_continuity_check",
    domain: "governance",
    description:
      "Constitutional identity check — load identity_card.yaml, compute witness quorum, " +
      "return IdentityContinuityCheck with geometric mean ≥ 0.50 required for named actors. " +
      "Routing law: T2I FORBIDDEN if intent names a real actor and quorum fails.",
    identity_support: "BINDING_T3",
    identity_witness_used: ["W1_face", "W2_voice", "W3_name", "W4_history", "W5_relations", "W6_scar_ledger"],
    declared_side_effects: [],
    required_permissions: ["read"],
    input_schema: {
      actor_handle: "string",
      intent: "string",
      named_actor: "boolean (default: true)",
    },
    output_schema: {
      witness_set: "Record<W1-W6, number>",
      geometric_mean: "number",
      quorum_passed: "boolean",
      verdict: "MATCH | PARTIAL | NONE",
      single_witness_authority: "false (ICL-1.1 — constitutional)",
      rationale: "string",
    },
    reversibility: "FULL",
    receipt_policy: "optional",
    constitutional_floors: ["F3", "F11", "F13"],
    default_action_class: "OBSERVE",
  },
];

// === IDENTITY CONTINUITY ROUTING RULE (hardcoded) ===
// When user intent contains a self-reference (aku, me, saya, named actor),
// Hermes MUST route through identity_continuity_check() before any image/audio capability.

export const SELF_REFERENCE_PATTERNS: RegExp[] = [
  /\baku\b/i,
  /\bsaya\b/i,
  /\bme\b/i,
  /\bmyself\b/i,
  /\bsyed\b/i,
  /\bsyedsado\b/i,
  /\babang\s+sado\b/i,
  /\bmr\s+kl\b/i,
  /\bmaster\s+open\b/i,
];

export function detectSelfReference(message: string): { matched: boolean; actor_handle?: string } {
  for (const pattern of SELF_REFERENCE_PATTERNS) {
    if (pattern.test(message)) {
      // Default actor — extend with named-actor registry in production
      return { matched: true, actor_handle: "syed_khairuddin" };
    }
  }
  return { matched: false };
}