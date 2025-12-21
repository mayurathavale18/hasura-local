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
      return "number";
    case "String":
      return "string";
    case "Boolean":
      return "boolean";
    case "ID":
      return "string | number";
    default:
      return type.name || "any";
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
