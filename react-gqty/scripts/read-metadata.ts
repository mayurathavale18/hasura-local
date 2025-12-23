import fs from "fs";
import { GENERATOR_CONFIG } from "./config";

export interface MetadataInsertInfo {
  table: string;
  requiredColumns: string[];
}

/**
 * Read Hasura metadata and extract required insert columns
 * for the configured runtime role
 */
export function readHasuraMetadata(): Map<string, MetadataInsertInfo> {
  const raw = fs.readFileSync(GENERATOR_CONFIG.metadataPath, "utf-8");

  const metadata = JSON.parse(raw);
  const role = GENERATOR_CONFIG.runtimeRole;

  const result = new Map<string, MetadataInsertInfo>();

  const sources = metadata.metadata?.sources ?? metadata.sources ?? [];

  for (const source of sources) {
    for (const table of source.tables ?? []) {
      const tableName =
        typeof table.table === "string" ? table.table : table.table?.name;

      // console.log("[metadata] : ", table);

      if (!tableName) continue;

      const insertPerm = (table.insert_permissions ?? []).find(
        (p: any) => p.role === role
      );

      if (!insertPerm) continue;

      const columns: string[] = insertPerm.permission?.columns ?? [];

      console.log("[metadata]", tableName, insertPerm?.permission?.columns);

      /**
       * IMPORTANT:
       * These columns are allowed, but NOT auto-filled.
       * If DB column is NOT NULL and has no default,
       * client MUST provide it.
       *
       * We assume metadata already excludes
       * session variables / defaults.
       */
      result.set(tableName, {
        table: tableName,
        requiredColumns: columns,
      });
    }
  }

  return result;
}
