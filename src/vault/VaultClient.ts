/**
 * VAULT999 Client
 *
 * Append-only seal persistence for the AF-FORGE constitutional runtime.
 * Every terminal verdict (SEAL, HOLD, SABAR, VOID) is hashed and written
 * to an immutable ledger — either a local JSONL file or a no-op sink.
 */

import { createHash, randomUUID } from "node:crypto";
import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { appendFile, readFile, mkdir } from "node:fs/promises";

export type VaultVerdict = "SEAL" | "HOLD" | "SABAR" | "VOID";

export type VaultTelemetrySnapshot = {
  dS: number;
  peace2: number;
  psi_le: number;
  W3: number;
  G: number;
};

export interface VaultSealRecord {
  sealId: string;
  sessionId: string;
  verdict: VaultVerdict;
  hashofinput: string;
  telemetrysnapshot: VaultTelemetrySnapshot;
  floors_triggered: string[];
  irreversibilityacknowledged: boolean;
  timestamp: string;
  task: string;
  finalText: string;
  turnCount: number;
  profileName: string;
  escalation?: {
    escalated: boolean;
    humanEndpoint?: string;
    humanDecision?: "APPROVE" | "REJECT" | "MODIFY" | "ASK_MORE";
    humanId?: string;
    signature?: string;
    ticketId?: string;
  };
}

export interface VaultClient {
  seal(record: VaultSealRecord): Promise<void>;
  query?(options?: {
    sessionId?: string;
    verdict?: VaultVerdict;
    since?: string;
    until?: string;
    limit?: number;
  }): Promise<VaultSealRecord[]>;
  findById?(sealId: string): Promise<VaultSealRecord | undefined>;
}

/**
 * No-op vault client for testing or environments where persistence
 * is handled externally.
 */
export class NoOpVaultClient implements VaultClient {
  async seal(_record: VaultSealRecord): Promise<void> {
    // Intentionally empty
  }

  async query(): Promise<VaultSealRecord[]> {
    return [];
  }

  async findById(): Promise<VaultSealRecord | undefined> {
    return undefined;
  }
}

/**
 * File-backed VAULT999 client writing append-only JSONL.
 * Default path: ~/.agent-workbench/vault999.jsonl
 */
export class FileVaultClient implements VaultClient {
  private readonly filePath: string;
  private initialized = false;

  constructor(filePath?: string) {
    this.filePath =
      filePath ??
      resolve(homedir(), ".agent-workbench", "vault999.jsonl");
  }

  async seal(record: VaultSealRecord): Promise<void> {
    await this.initialize();
    const line = JSON.stringify(record) + "\n";
    await appendFile(this.filePath, line, "utf-8");
  }

  async query(options?: {
    sessionId?: string;
    verdict?: VaultVerdict;
    since?: string;
    until?: string;
    limit?: number;
  }): Promise<VaultSealRecord[]> {
    await this.initialize();
    let text: string;
    try {
      text = await readFile(this.filePath, "utf-8");
    } catch {
      return [];
    }
    const results: VaultSealRecord[] = [];
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        const record = JSON.parse(line) as VaultSealRecord;
        if (options?.sessionId && record.sessionId !== options.sessionId) continue;
        if (options?.verdict && record.verdict !== options.verdict) continue;
        if (options?.since && record.timestamp < options.since) continue;
        if (options?.until && record.timestamp > options.until) continue;
        results.push(record);
      } catch {
        // skip corrupted line
      }
    }
    // newest first
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (options?.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }
    return results;
  }

  async findById(sealId: string): Promise<VaultSealRecord | undefined> {
    await this.initialize();
    let text: string;
    try {
      text = await readFile(this.filePath, "utf-8");
    } catch {
      return undefined;
    }
    let found: VaultSealRecord | undefined;
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        const record = JSON.parse(line) as VaultSealRecord;
        if (record.sealId === sealId) {
          found = record;
        }
      } catch {
        // skip corrupted line
      }
    }
    return found;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    await mkdir(dirname(this.filePath), { recursive: true });
    this.initialized = true;
  }
}

/**
 * Compute a deterministic sha256 hash over the session input and output.
 */
export function computeInputHash(
  task: string,
  finalText: string,
  sessionId: string,
  turnCount: number
): string {
  const data = JSON.stringify({ task, finalText, sessionId, turnCount });
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Generate a cryptographically random seal ID.
 */
export function generateSealId(): string {
  return randomUUID();
}
