/**
 * Canonical schema analysis for Hasura
 * -----------------------------------
 * Single source of truth for:
 * - table fields (select)
 * - insert/update input shapes
 * - required fields
 * - primary keys
 * - available operations
 */

import { readHasuraMetadata } from "./read-metadata";

export interface Field {
  name: string;
  type: string;
  nullable: boolean;
}

export interface InputField extends Field {
  hasDefault: boolean;
}

export interface InputObject {
  typeName: string;
  fields: InputField[];
  requiredFields: InputField[];
}

export interface TableMetadata {
  name: string;

  // SELECT fields
  fields: Field[];

  // INSERT / UPDATE inputs
  insertInput?: InputObject;
  updateInput?: InputObject;

  // CRUD availability
  operations: {
    query: boolean;
    queryByPk: boolean;
    aggregate: boolean;
    insert: boolean;
    insertOne: boolean;
    update: boolean;
    updateByPk: boolean;
    delete: boolean;
    deleteByPk: boolean;
  };

  // Primary key (from *_by_pk)
  primaryKey?: {
    name: string;
    type: string;
  };
}

export interface SchemaMetadata {
  tables: Map<string, TableMetadata>;
}

/**
 * Recursively unwrap GraphQL types
 * - Handles NON_NULL
 * - Handles LIST
 */
function unwrapType(type: any): { name: string; nullable: boolean } {
  if (!type) {
    return { name: "any", nullable: true };
  }

  if (type.kind === "NON_NULL") {
    const inner = unwrapType(type.ofType);
    return { ...inner, nullable: false };
  }

  if (type.kind === "LIST") {
    const inner = unwrapType(type.ofType);
    return {
      name: `${inner.name}[]`,
      nullable: true,
    };
  }

  return {
    name: type.name ?? "any",
    nullable: true,
  };
}

/**
 * Extract INPUT_OBJECT (insert / update) definitions
 */
function extractInputObject(
  types: any[],
  inputName: string
): InputObject | undefined {
  const inputType = types.find(
    (t: any) => t.kind === "INPUT_OBJECT" && t.name === inputName
  );

  if (!inputType || !Array.isArray(inputType.inputFields)) {
    return undefined;
  }

  const fields: InputField[] = inputType.inputFields.map((f: any) => {
    const { name, nullable } = unwrapType(f.type);
    return {
      name: f.name,
      type: name,
      nullable,
      hasDefault: f.defaultValue != null,
    };
  });

  return {
    typeName: inputType.name,
    fields,
    requiredFields: fields.filter((f) => !f.nullable && !f.hasDefault),
  };
}

/**
 * Main analysis entry point
 */
export function analyzeSchema(schema: any): SchemaMetadata {
  console.log("Analyzing Hasura schema...");
  const metadataInsertMap = readHasuraMetadata();

  const tables = new Map<string, TableMetadata>();
  const types = schema.__schema.types ?? [];

  const queryFields = schema.__schema.queryType?.fields ?? [];
  const mutationFields = schema.__schema.mutationType?.fields ?? [];

  /**
   * Step 1: Discover base table names from query root
   * (ignore _by_pk, _aggregate)
   */
  const tableNames = new Set<string>();

  for (const field of queryFields) {
    if (!field.name.endsWith("_by_pk") && !field.name.endsWith("_aggregate")) {
      tableNames.add(field.name);
    }
  }

  console.log(`Found ${tableNames.size} tables`);

  /**
   * Step 2: Process each table
   */
  for (const tableName of tableNames) {
    const objectType = types.find(
      (t: any) => t.kind === "OBJECT" && t.name === tableName
    );

    if (!objectType || !Array.isArray(objectType.fields)) {
      console.warn(`Skipping table ${tableName}: object type not found`);
      continue;
    }

    /**
     * SELECT fields
     */
    const objectFieldNullability = new Map<string, boolean>();

    const fields: Field[] = objectType.fields
      .map((f: any) => {
        const { name, nullable } = unwrapType(f.type);

        objectFieldNullability.set(f.name, nullable);

        const baseType = name.replace("[]", "");
        if (!isScalarGraphQLType(baseType)) return null;

        return {
          name: f.name,
          type: name,
          nullable,
        };
      })
      .filter(Boolean) as Field[];
    /**
     * INSERT / UPDATE input objects
     */
    let insertInput = extractInputObject(types, `${tableName}_insert_input`);

    const meta = metadataInsertMap.get(tableName);

    // DB NOT NULL truth (from object type)
    const requiredByDb = insertInput
      ? insertInput.fields.filter((f) => {
          const isNullable = objectFieldNullability.get(f.name);
          return isNullable === false;
        })
      : [];

    // CASE A: permissions exist → intersect
    if (insertInput && meta) {
      const allowedColumns = new Set(meta.requiredColumns);

      const required = requiredByDb.filter((f) => allowedColumns.has(f.name));

      insertInput = {
        ...insertInput,
        requiredFields: required,
      };
    }

    // CASE B: no permissions → DB truth only
    else if (insertInput && !meta) {
      insertInput = {
        ...insertInput,
        requiredFields: requiredByDb,
      };
    }

    console.log(
      `[generator required fields] table=${tableName}`,
      insertInput?.requiredFields.map((f) => f.name)
    );

    const updateInput = extractInputObject(types, `${tableName}_set_input`);

    /**
     * Operation detection
     */
    const operations = {
      query: queryFields.some((f: any) => f.name === tableName),
      queryByPk: queryFields.some((f: any) => f.name === `${tableName}_by_pk`),
      aggregate: queryFields.some(
        (f: any) => f.name === `${tableName}_aggregate`
      ),

      insert: mutationFields.some((f: any) => f.name === `insert_${tableName}`),
      insertOne: mutationFields.some(
        (f: any) => f.name === `insert_${tableName}_one`
      ),
      update: mutationFields.some((f: any) => f.name === `update_${tableName}`),
      updateByPk: mutationFields.some(
        (f: any) => f.name === `update_${tableName}_by_pk`
      ),
      delete: mutationFields.some((f: any) => f.name === `delete_${tableName}`),
      deleteByPk: mutationFields.some(
        (f: any) => f.name === `delete_${tableName}_by_pk`
      ),
    };

    /**
     * Primary key detection (from query_by_pk args)
     */
    let primaryKey: TableMetadata["primaryKey"];

    const byPkQuery = queryFields.find(
      (f: any) => f.name === `${tableName}_by_pk`
    );

    if (byPkQuery?.args?.length === 1) {
      const arg = byPkQuery.args[0];
      const { name } = unwrapType(arg.type);
      primaryKey = {
        name: arg.name,
        type: name,
      };
    }

    tables.set(tableName, {
      name: tableName,
      fields,
      insertInput,
      updateInput,
      operations,
      primaryKey,
    });

    console.log(`✓ ${tableName}`);
  }

  console.log("Schema analysis complete");

  return { tables };
}

function isScalarGraphQLType(typeName: string): boolean {
  return [
    "Int",
    "Float",
    "String",
    "Boolean",
    "ID",
    "uuid",
    "timestamptz",
    "timestamp",
    "date",
    "time",
    "timetz",
    "numeric",
    "bigint",
    "json",
    "jsonb",
    "citext",
  ].includes(typeName);
}
