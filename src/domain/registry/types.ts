// types.ts — registry declaration types (created 2026-09-09)
//
//forge_face_tools.ts (ratified 2026-09-08) imported these from "./types.js"
// but the module was never committed — tsc has been failing at head since
// a41094c9 (nobody rebuilt until P1-5 wiring). Declared minimal, inferred
// from actual usage in forge_face_tools.ts. Loosen later when the biometric
// lane is implemented — do not tighten speculatively.

export interface ToolDeclaration {
  name: string;
  domain: string;
  description: string;
  identity_support?: string;
  identity_witness_written?: string;
  identity_witness_used?: string | string[];
  required_consent_scope?: string;
  declared_side_effects: string[];
  required_permissions: string[];
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  reversibility?: string;
  receipt_policy?: string;
  constitutional_floors?: string[];
  gate_dependencies?: string[];
  default_action_class?: string;
}

/** Placeholder witness spec — W1-W6 per identity-continuity doctrine. */
export interface IdentityWitnessSpec {
  witness_id: string; // "W1_face" | "W2_voice" | ... | "W6_scar_ledger"
  binding_tier: "T1" | "T2" | "T3";
  consent_scope_required?: string;
  ttl_days?: number;
  single_witness_authority: false; // ICL-1.1 — constitutional constant
}
