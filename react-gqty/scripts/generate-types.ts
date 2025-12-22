import fs from "fs";
import path from "path";
import { GENERATOR_CONFIG } from "./config";

interface Field {
  name: string;
  type: {
    kind: string;
    name: string | null;
    ofType?: {
      kind: string;
      name: string | null;
    };
  };
}

interface TypeDef {
  kind: string;
  name: string;
  fields?: Field[];
}

function getTypeScriptType(graphqlType: any): string {
  if (!graphqlType) return "any";

  const type = graphqlType.ofType || graphqlType;

  switch (type.name) {
    case "Int":
    case "Float":
    case "numeric":
    case "String":
    case "uuid":
    case "timestamp":
    case "timestamptz":
    case "date":
    case "time":
    case "timetz":
    case "citext":
      return "string";
    case "bigint":
      return "bigint";
    case "Boolean":
      return "boolean";
    case "ID":
      return "string | number";
    case "json":
    case "jsonb":
      return "any";
    default:
      // If it's not a recognized type, assume it's a string
      // This handles custom scalars from Hasura
      return "any";
  }
}

function generateInterfaceForType(typeDef: TypeDef): string {
  if (!typeDef.fields || typeDef.fields.length === 0) {
    return "";
  }

  // Skip internal types
  if (typeDef.name.startsWith("__")) {
    return "";
  }

  const fields = typeDef.fields
    .filter((field) => field?.type.name !== "bigint")
    .map((field) => {
      const tsType = getTypeScriptType(field.type);
      const isNullable = field.type.kind !== "NON_NULL";
      return `  ${field.name}${isNullable ? "?" : ""}: ${tsType};`;
    })
    .join("\n");

  return `
export interface ${typeDef.name} {
${fields}
}
`;
}

export function generateTypesForSchema(tenantId: string, schema: any): string {
  const types = schema.__schema.types as TypeDef[];

  // Filter to only object types that are likely user tables
  const userTypes = types.filter(
    (t) =>
      t.kind === "OBJECT" &&
      !t.name.startsWith("__") &&
      !t.name.endsWith("_mutation_response") &&
      !t.name.endsWith("_aggregate") &&
      !t.name.endsWith("_aggregate_fields") &&
      !t.name.endsWith("_max_fields") &&
      !t.name.endsWith("_min_fields") &&
      !t.name.endsWith("_stddev_fields") &&
      !t.name.endsWith("_sum_fields") &&
      !t.name.endsWith("_var_pop_fields") &&
      !t.name.endsWith("_var_samp_fields") &&
      !t.name.endsWith("_variance_fields") &&
      t.name !== "query_root" &&
      t.name !== "mutation_root" &&
      t.name !== "subscription_root"
  );

  const interfaces = userTypes.map(generateInterfaceForType).filter(Boolean);

  return `// Generated types for tenant: ${tenantId}
// Generated at: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY

${interfaces.join("\n")}
`;
}

export function generateCommonTypes(): string {
  return `// Common types used across all tenants
// DO NOT EDIT MANUALLY

// Hasura/PostgreSQL scalar types mapped to TypeScript
export type uuid = string;
export type timestamptz = string;
export type timestamp = string;
export type date = string;
export type time = string;
export type timetz = string;
export type numeric = number;
export type jsonb = any;
export type json = any;
export type citext = string;

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  where?: any;
}

export interface MutationResponse<T> {
  affected_rows: number;
  returning: T[];
}

export interface InsertMutationResponse<T> {
  insert_returning: T[];
}

export interface GraphQLError {
  message: string;
  extensions?: Record<string, any>;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}
`;
}

export async function generateAllTypes(
  schemas: Map<string, any>
): Promise<void> {
  const typesDir = path.join(GENERATOR_CONFIG.outputDir, "types");

  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  // Generate common types
  const commonTypes = generateCommonTypes();
  fs.writeFileSync(path.join(typesDir, "common.ts"), commonTypes);
  console.log("Generated common types");

  // Generate types for each tenant
  for (const [tenantId, schema] of schemas.entries()) {
    const types = generateTypesForSchema(tenantId, schema);
    const filePath = path.join(typesDir, `${tenantId}.ts`);
    fs.writeFileSync(filePath, types);
    console.log(`Generated types for ${tenantId}`);
  }
}
