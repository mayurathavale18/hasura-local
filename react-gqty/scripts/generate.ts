// scripts/generate.ts - Main generator orchestrator
import fs from "fs";
import path from "path";
import { GENERATOR_CONFIG } from "./config";
import { fetchAllSchemas, saveSchemas } from "./fetch-schema";
import { generateAllTypes, generateCommonTypes } from "./generate-types";

// You'll also need these functions from generate-client-code.ts
interface TableInfo {
  name: string;
  fields: string[];
}

function capitalize(str: string): string {
  return str
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function extractTablesFromSchema(schema: any): TableInfo[] {
  const types = schema.__schema.types;
  const queries = schema.__schema.queryType.fields;

  const tables: TableInfo[] = [];
  const processedTables = new Set<string>();

  for (const query of queries) {
    const tableName = query.name;

    // Skip aggregate and by_pk queries
    if (tableName.endsWith("_aggregate") || tableName.endsWith("_by_pk")) {
      continue;
    }

    if (processedTables.has(tableName)) {
      continue;
    }

    // Find the type definition for this table
    const tableType = types.find((t: any) => t.name === tableName);

    if (tableType && tableType.fields) {
      const fields = tableType.fields
        .filter((f: any) => {
          const type = f.type.ofType || f.type;
          return ["SCALAR", "ENUM"].includes(type.kind);
        })
        .map((f: any) => f.name);

      if (fields.length > 0) {
        tables.push({ name: tableName, fields });
        processedTables.add(tableName);
      }
    }
  }

  return tables;
}

function generateClientForTenant(tenantId: string, schema: any): string {
  const tables = extractTablesFromSchema(schema);

  const queryFunctions = tables
    .map((table) => {
      const fieldsStr = table.fields.map((f) => `      ${f}`).join("\n");
      return `
  async query${capitalize(
    table.name
  )}(options: QueryOptions = {}): Promise<any[]> {
    const query = \`
      query Get${capitalize(
        table.name
      )}(\$limit: Int, \$offset: Int, \$where: ${table.name}_bool_exp) {
        ${table.name}(limit: \$limit, offset: \$offset, where: \$where) {
${fieldsStr}
        }
      }
    \`;
    const result = await this.client.request(query, options);
    return result.${table.name} || [];
  }`;
    })
    .join("\n");

  const mutationFunctions = tables
    .map((table) => {
      const fieldsStr = table.fields.map((f) => `          ${f}`).join("\n");
      return `
  async insert${capitalize(table.name)}(data: any): Promise<any> {
    const mutation = \`
      mutation Insert${capitalize(table.name)}(\$object: ${
        table.name
      }_insert_input!) {
        insert_${table.name}(objects: [\$object]) {
          returning {
${fieldsStr}
          }
        }
      }
    \`;
    const result = await this.client.request(mutation, { object: data });
    return result.insert_${table.name}.returning[0];
  }

  async update${capitalize(table.name)}(where: any, data: any): Promise<any> {
    const mutation = \`
      mutation Update${capitalize(table.name)}(\$where: ${
        table.name
      }_bool_exp!, \$_set: ${table.name}_set_input!) {
        update_${table.name}(where: \$where, _set: \$_set) {
          affected_rows
          returning {
${fieldsStr}
          }
        }
      }
    \`;
    const result = await this.client.request(mutation, { where, _set: data });
    return result.update_${table.name};
  }

  async delete${capitalize(table.name)}(where: any): Promise<number> {
    const mutation = \`
      mutation Delete${capitalize(table.name)}(\$where: ${
        table.name
      }_bool_exp!) {
        delete_${table.name}(where: \$where) {
          affected_rows
        }
      }
    \`;
    const result = await this.client.request(mutation, { where });
    return result.delete_${table.name}.affected_rows;
  }`;
    })
    .join("\n");

  return `// Generated client for tenant: ${tenantId}
// Generated at: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY

import { GraphQLClient } from 'graphql-request';
import type { QueryOptions } from '../types/common';

export class ${capitalize(tenantId)}Client {
  private client: GraphQLClient;

  constructor(endpoint: string, headers?: Record<string, string>) {
    this.client = new GraphQLClient(endpoint, { headers });
  }

  // Query methods
${queryFunctions}

  // Mutation methods
${mutationFunctions}

  // Raw query/mutation methods
  async rawQuery<T = any>(query: string, variables?: any): Promise<T> {
    return await this.client.request<T>(query, variables);
  }

  async rawMutation<T = any>(mutation: string, variables?: any): Promise<T> {
    return await this.client.request<T>(mutation, variables);
  }
}
`;
}

async function generateAllClients(schemas: Map<string, any>): Promise<void> {
  const clientDir = path.join(GENERATOR_CONFIG.outputDir, "client");

  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  for (const [tenantId, schema] of schemas.entries()) {
    const clientCode = generateClientForTenant(tenantId, schema);
    const filePath = path.join(clientDir, `${tenantId}-client.ts`);
    fs.writeFileSync(filePath, clientCode);
    console.log(`Generated client for ${tenantId}`);
  }

  // Generate main client factory
  generateMainClient(Array.from(schemas.keys()));
}

function generateMainClient(tenantIds: string[]): void {
  const imports = tenantIds
    .map((id) => `import { ${capitalize(id)}Client } from './${id}-client';`)
    .join("\n");

  const clientMap = tenantIds
    .map((id) => `  '${id}': ${capitalize(id)}Client,`)
    .join("\n");

  const code = `// Main client factory
// Generated at: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY

${imports}

export interface ClientConfig {
  endpoint: string;
  tenantId?: string;
  headers?: Record<string, string>;
}

const CLIENT_MAP = {
${clientMap}
} as const;

export type TenantId = keyof typeof CLIENT_MAP;

export function createClient(config: ClientConfig) {
  const tenantId = (config.tenantId || 'public') as TenantId;

  if (!CLIENT_MAP[tenantId]) {
    throw new Error(\`Unknown tenant: \${tenantId}. Available: \${Object.keys(CLIENT_MAP).join(', ')}\`);
  }

  const ClientClass = CLIENT_MAP[tenantId];
  const headers = {
    ...config.headers,
    ...(config.tenantId ? { 'x-tenant-id': config.tenantId } : {}),
  };

  return new ClientClass(config.endpoint, headers);
}

export { ${tenantIds.map((id) => `${capitalize(id)}Client`).join(", ")} };
`;

  const filePath = path.join(GENERATOR_CONFIG.outputDir, "client", "index.ts");
  fs.writeFileSync(filePath, code);
  console.log("Generated main client factory");
}

async function generatePackageJson(): Promise<void> {
  const packageJson = {
    name: "@generated/graphql-client",
    version: "1.0.0",
    description: "Auto-generated GraphQL client for multi-tenant Hasura",
    main: "index.ts",
    types: "index.ts",
    scripts: {},
    dependencies: {
      graphql: "^16.8.1",
      "graphql-request": "^7.4.0",
    },
    devDependencies: {
      typescript: "^5.2.2",
    },
  };

  const filePath = path.join(GENERATOR_CONFIG.outputDir, "package.json");
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
  console.log("Generated package.json");
}

async function generateIndexFile(tenantIds: string[]): Promise<void> {
  const code = `// Main entry point for generated GraphQL client
// Generated at: ${new Date().toISOString()}

export * from './client';
export * from './types/common';
${tenantIds.map((id) => `export * from './types/${id}';`).join("\n")}

// Re-export schemas for runtime inspection if needed
${tenantIds
  .map(
    (id) => `import ${id.replace(/-/g, "_")}Schema from './schemas/${id}.json';`
  )
  .join("\n")}

export const schemas = {
${tenantIds
  .map((id) => `  '${id}': ${id.replace(/-/g, "_")}Schema,`)
  .join("\n")}
};
`;

  const filePath = path.join(GENERATOR_CONFIG.outputDir, "index.ts");
  fs.writeFileSync(filePath, code);
  console.log("Generated index.ts");
}

async function generateReadme(): Promise<void> {
  const readme = `# Auto-Generated GraphQL Client

Generated at: ${new Date().toISOString()}

## Usage

\`\`\`typescript
import { createClient } from './generated';

// Create client for specific tenant
const client = createClient({
  endpoint: 'http://localhost:3000/graphql',
  tenantId: 'tenant-1',
});

// Use generated methods
const profiles = await client.queryProfiles({ limit: 10 });
const newProfile = await client.insertProfiles({ name: 'John' });
await client.updateProfiles({ id: { _eq: 1 } }, { name: 'Jane' });
await client.deleteProfiles({ id: { _eq: 1 } });

// Or use raw queries
const result = await client.rawQuery('{ profiles { id name } }');
\`\`\`

## Regenerating

Run \`npm run generate\` to regenerate this client from current Hasura schemas.
`;

  const filePath = path.join(GENERATOR_CONFIG.outputDir, "README.md");
  fs.writeFileSync(filePath, readme);
  console.log("Generated README.md");
}

export async function generate(): Promise<void> {
  console.log("Starting code generation...\n");

  if (fs.existsSync(path.resolve(GENERATOR_CONFIG.outputDir))) {
    console.log("Removing existing output directory...");
    fs.rmSync(path.resolve(GENERATOR_CONFIG.outputDir), { recursive: true });
  }

  try {
    // Step 1: Fetch schemas
    console.log("Step 1: Fetching schemas from Hasura...");
    const schemas = await fetchAllSchemas();
    console.log("schemas : ", schemas);
    await saveSchemas(schemas);
    console.log("");

    // Step 2: Generate types
    console.log("Step 2: Generating TypeScript types...");
    await generateAllTypes(schemas);
    console.log("");

    // Step 3: Generate client code
    console.log("Step 3: Generating client code...");
    await generateAllClients(schemas);
    console.log("");

    // Step 4: Generate package files
    console.log("Step 4: Generating package files...");
    await generatePackageJson();
    await generateIndexFile(Array.from(schemas.keys()));
    await generateReadme();
    console.log("");

    console.log("Code generation complete!");
    console.log(`Generated files in: ${GENERATOR_CONFIG.outputDir}`);
    console.log("");
    console.log("Next steps:");
    console.log("  1. Import from ./generated in your React app");
    console.log("  2. Use createClient() to get a typed client");
    console.log("  3. Enjoy type-safe GraphQL queries!");
  } catch (error) {
    console.error("Code generation failed:", error);
    process.exit(1);
  }
}

// Run generator if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generate();
}
