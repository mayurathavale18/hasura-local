import type { IntrospectionSchema } from "./schema";

export interface FieldInfo {
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

export interface TypeInfo {
  kind: string;
  name: string;
  fields?: FieldInfo[];
}

export interface QueryField {
  name: string;
  args: Array<{
    name: string;
    type: any;
  }>;
}

/**
 * Extract all available queries from schema
 */
export function getAvailableQueries(schema: IntrospectionSchema): QueryField[] {
  return schema.__schema.queryType.fields;
}

/**
 * Extract all available mutations from schema
 */
export function getAvailableMutations(
  schema: IntrospectionSchema
): QueryField[] {
  return schema.__schema.mutationType?.fields || [];
}

/**
 * Find a type definition by name in the schema
 */
export function findTypeByName(
  schema: IntrospectionSchema,
  typeName: string
): TypeInfo | null {
  return schema.__schema.types.find((t) => t.name === typeName) || null;
}

/**
 * Extract scalar fields from a type (for selection sets)
 * Excludes complex types and relations
 */
export function getScalarFields(
  schema: IntrospectionSchema,
  typeName: string
): string[] {
  const type = findTypeByName(schema, typeName);
  if (!type || !type.fields) return [];

  const scalarKinds = ["SCALAR", "ENUM"];

  return type.fields
    .filter((field) => {
      const fieldType = field.type.ofType || field.type;
      return scalarKinds.includes(fieldType.kind);
    })
    .map((field) => field.name);
}

/**
 * Build a query string for fetching a list
 * Example: profiles table -> "query GetProfiles { profiles { id name } }"
 */
export function buildListQuery(
  schema: IntrospectionSchema,
  tableName: string,
  options: {
    operationName?: string;
    limit?: number;
    where?: string;
  } = {}
): string {
  // Find the query field
  const queryField = getAvailableQueries(schema).find(
    (q) => q.name === tableName
  );
  if (!queryField) {
    throw new Error(`Query field "${tableName}" not found in schema`);
  }

  // Get the return type name (e.g., "profiles" returns array of "profiles" type)
  const scalarFields = getScalarFields(schema, tableName);

  if (scalarFields.length === 0) {
    throw new Error(`No scalar fields found for type "${tableName}"`);
  }

  const operationName = options.operationName || `Get${capitalize(tableName)}`;
  const fields = scalarFields.join("\n      ");

  // Build arguments
  let args = "";
  if (options.limit !== undefined) {
    args += `limit: ${options.limit}`;
  }
  if (options.where) {
    args += (args ? ", " : "") + `where: ${options.where}`;
  }
  const argsStr = args ? `(${args})` : "";

  return `
    query ${operationName} {
      ${tableName}${argsStr} {
        ${fields}
      }
    }
  `.trim();
}

/**
 * Build an insert mutation string
 * Example: "mutation InsertProfile($name: String!) { insert_profiles(...) { ... } }"
 */
export function buildInsertMutation(
  schema: IntrospectionSchema,
  tableName: string,
  options: {
    operationName?: string;
    returningFields?: string[];
  } = {}
): { mutation: string; variableName: string } {
  const mutationName = `insert_${tableName}`;
  const mutationField = getAvailableMutations(schema).find(
    (m) => m.name === mutationName
  );

  if (!mutationField) {
    throw new Error(`Mutation "${mutationName}" not found in schema`);
  }

  const operationName =
    options.operationName || `Insert${capitalize(tableName)}`;
  const returningFields =
    options.returningFields || getScalarFields(schema, tableName);

  // For Hasura, the input type is typically "table_insert_input"
  const inputType = `${tableName}_insert_input`;

  return {
    mutation: `
      mutation ${operationName}($object: ${inputType}!) {
        ${mutationName}(objects: [$object]) {
          returning {
            ${returningFields.join("\n            ")}
          }
        }
      }
    `.trim(),
    variableName: "object",
  };
}

/**
 * Build an update mutation string
 */
export function buildUpdateMutation(
  schema: IntrospectionSchema,
  tableName: string,
  options: {
    operationName?: string;
    returningFields?: string[];
  } = {}
): { mutation: string } {
  const mutationName = `update_${tableName}`;
  const mutationField = getAvailableMutations(schema).find(
    (m) => m.name === mutationName
  );

  if (!mutationField) {
    throw new Error(`Mutation "${mutationName}" not found in schema`);
  }

  const operationName =
    options.operationName || `Update${capitalize(tableName)}`;
  const returningFields =
    options.returningFields || getScalarFields(schema, tableName);

  const setType = `${tableName}_set_input`;
  const whereType = `${tableName}_bool_exp`;

  return {
    mutation: `
      mutation ${operationName}($where: ${whereType}!, $_set: ${setType}!) {
        ${mutationName}(where: $where, _set: $_set) {
          affected_rows
          returning {
            ${returningFields.join("\n            ")}
          }
        }
      }
    `.trim(),
  };
}

/**
 * Build a delete mutation string
 */
export function buildDeleteMutation(
  schema: IntrospectionSchema,
  tableName: string,
  options: {
    operationName?: string;
    returningFields?: string[];
  } = {}
): { mutation: string } {
  const mutationName = `delete_${tableName}`;
  const mutationField = getAvailableMutations(schema).find(
    (m) => m.name === mutationName
  );

  if (!mutationField) {
    throw new Error(`Mutation "${mutationName}" not found in schema`);
  }

  const operationName =
    options.operationName || `Delete${capitalize(tableName)}`;
  const returningFields =
    options.returningFields || getScalarFields(schema, tableName);

  const whereType = `${tableName}_bool_exp`;

  return {
    mutation: `
      mutation ${operationName}($where: ${whereType}!) {
        ${mutationName}(where: $where) {
          affected_rows
          returning {
            ${returningFields.join("\n            ")}
          }
        }
      }
    `.trim(),
  };
}

/**
 * Helper to capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get all tables from schema (queries ending without _aggregate, _by_pk)
 */
export function getTableNames(schema: IntrospectionSchema): string[] {
  const queries = getAvailableQueries(schema);
  const tableNames = new Set<string>();

  queries.forEach((query) => {
    // Remove suffixes to get base table name
    const baseName = query.name
      .replace(/_aggregate$/, "")
      .replace(/_by_pk$/, "");

    // Only include if it's not a suffixed version
    if (query.name === baseName) {
      tableNames.add(baseName);
    }
  });

  return Array.from(tableNames);
}

/**
 * Check if a table has specific operations available
 */
export function getTableOperations(
  schema: IntrospectionSchema,
  tableName: string
): {
  canQuery: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canAggregate: boolean;
  canQueryByPk: boolean;
} {
  const queries = getAvailableQueries(schema);
  const mutations = getAvailableMutations(schema);

  return {
    canQuery: queries.some((q) => q.name === tableName),
    canInsert: mutations.some((m) => m.name === `insert_${tableName}`),
    canUpdate: mutations.some((m) => m.name === `update_${tableName}`),
    canDelete: mutations.some((m) => m.name === `delete_${tableName}`),
    canAggregate: queries.some((q) => q.name === `${tableName}_aggregate`),
    canQueryByPk: queries.some((q) => q.name === `${tableName}_by_pk`),
  };
}
