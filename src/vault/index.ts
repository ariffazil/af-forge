import {
  PostgresVaultClient,
  type FloorRule,
  type SessionRecord,
  type ToolCallRecord,
} from "./PostgresVaultClient.js";
export { PostgresVaultClient, type FloorRule, type SessionRecord, type ToolCallRecord };
import {
  type VaultClient,
  type VaultSealRecord,
  type VaultTelemetrySnapshot,
  type VaultVerdict,
  NoOpVaultClient,
  FileVaultClient,
  computeInputHash,
  generateSealId,
} from "./VaultClient.js";
export {
  type VaultClient,
  type VaultSealRecord,
  type VaultTelemetrySnapshot,
  type VaultVerdict,
  NoOpVaultClient,
  FileVaultClient,
  computeInputHash,
  generateSealId,
};

let _postgresVaultClient: PostgresVaultClient | null = null;

export function getPostgresVaultClient(connectionString?: string): PostgresVaultClient {
  if (!_postgresVaultClient) {
    _postgresVaultClient = new PostgresVaultClient(
      connectionString ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "",
    );
  }
  return _postgresVaultClient;
}
