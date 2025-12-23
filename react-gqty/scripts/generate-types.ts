import fs from "fs";
import path from "path";
import { GENERATOR_CONFIG } from "./config";
import type {
  SchemaMetadata,
  TableMetadata,
  InputObject,
} from "./analyze-schema";

export type FilterOp = "eq" | "neq" | "gt" | "lt" | "ilike";

export interface Filter {
  field: string;
  op: FilterOp;
  value: string | number | boolean;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  filters?: Filter[];
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  distinctOn?: string[];
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Map GraphQL scalar → TypeScript
 * (Non-scalars default to any for now)
 */
function mapGraphQLTypeToTS(type: string): string {
  const base = type.replace("[]", "");

  const map: Record<string, string> = {
    Int: "number",
    Float: "number",
    String: "string",
    Boolean: "boolean",
    ID: "string",
    uuid: "string",
    timestamptz: "string",
    timestamp: "string",
    date: "string",
    time: "string",
    timetz: "string",
    numeric: "number",
    json: "any",
    jsonb: "any",
  };

  const ts = map[base] ?? "any";
  return type.endsWith("[]") ? `${ts}[]` : ts;
}

/**
 * Generate SELECT table interface
 */
function generateTableInterface(table: TableMetadata): string {
  const lines = table.fields.map((f) => {
    const optional = f.nullable ? "?" : "";
    return `  ${f.name}${optional}: ${mapGraphQLTypeToTS(f.type)};`;
  });

  return `
export interface ${capitalize(table.name)} {
${lines.join("\n")}
}
`;
}

/**
 * Generate INSERT / UPDATE input interfaces
 */
function generateInputInterface(
  interfaceName: string,
  input: InputObject
): string {
  const lines = input.fields.map((f) => {
    const optional = f.nullable || f.hasDefault ? "?" : "";
    return `  ${f.name}${optional}: ${mapGraphQLTypeToTS(f.type)};`;
  });

  return `
export interface ${interfaceName} {
${lines.join("\n")}
}
`;
}

/**
 * Generate all table-related types
 */
function generateTableTypes(metadata: SchemaMetadata): string {
  const parts: string[] = [];

  for (const table of metadata.tables.values()) {
    // SELECT type
    parts.push(generateTableInterface(table));

    // INSERT input
    if (table.insertInput) {
      parts.push(
        generateInputInterface(
          `${capitalize(table.name)}InsertInput`,
          table.insertInput
        )
      );
    }

    // UPDATE input
    if (table.updateInput) {
      parts.push(
        generateInputInterface(
          `${capitalize(table.name)}UpdateInput`,
          table.updateInput
        )
      );
    }
  }

  return parts.join("\n");
}

/**
 * Generate all types into /generated/types
 */
export async function generateAllTypes(
  metadata: SchemaMetadata
): Promise<void> {
  const typesDir = path.join(GENERATOR_CONFIG.outputDir, "types");

  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  const content = `// AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}

export type FilterOp = "eq" | "neq" | "gt" | "lt" | "ilike";

export interface Filter {
  field: string;
  op: FilterOp;
  value: string | number | boolean;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  filters?: Filter[];
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  distinctOn?: string[];
}

${generateTableTypes(metadata)}
`;

  fs.writeFileSync(path.join(typesDir, "tables.ts"), content);

  console.log("Generated types/tables.ts");
}
