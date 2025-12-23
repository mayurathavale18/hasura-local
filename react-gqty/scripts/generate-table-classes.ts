import fs from "fs";
import path from "path";
import { GENERATOR_CONFIG } from "./config";
import type { SchemaMetadata, TableMetadata } from "./analyze-schema";

/**
 * Utilities
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Base GraphQL client (graphql-request wrapper)
 */
function generateBaseClient(): string {
  return `// AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY

import { GraphQLClient } from 'graphql-request';

export class BaseClient {
  protected client: GraphQLClient;

  constructor(
    protected endpoint: string,
    protected headers?: Record<string, string>
  ) {
    this.client = new GraphQLClient(endpoint, { headers });
  }

  protected request<T>(query: string, variables?: any): Promise<T> {
    return this.client.request<T>(query, variables);
  }
}
`;
}

/**
 * Generic strongly-typed table client
 */
function generateTableClient(): string {
  return `// AUTO-GENERATED FILE
 // DO NOT EDIT MANUALLY

 import { BaseClient } from './base-client';
 import type { QueryOptions } from '../types/tables';

 export class TableClient<
   TSelect,
   TInsert extends Record<string, any> | undefined,
   TUpdate extends Record<string, any> | undefined,
   TPK
 > extends BaseClient {
   constructor(
     endpoint: string,
     private tableName: string,
     private selectFields: string[],
     private pk?: { name: string; type: string },
     public requiredInsertFields: string[] = [],
     headers?: Record<string, string>
   ) {
     super(endpoint, headers);
   }

   async query(options: QueryOptions = {}): Promise<TSelect[]> {
     const { limit, offset, filters, orderBy, distinctOn } = options;

     const where: any = {};
     if (filters) {
       for (const f of filters) {
         where[f.field] = {
           [\`_\${f.op}\`]: f.value,
         };
       }
     }

     const args: string[] = [];
     if (limit !== undefined) args.push('limit: $limit');
     if (offset !== undefined) args.push('offset: $offset');
     if (filters?.length) args.push('where: $where');
     if (orderBy) args.push('order_by: $orderBy');
     if (distinctOn?.length) args.push('distinct_on: $distinctOn');

     const query = \`
     query (
       $limit: Int
       $offset: Int
       $where: \${this.tableName}_bool_exp
       $orderBy: [\${this.tableName}_order_by!]
       $distinctOn: [\${this.tableName}_select_column!]
     ) {
     \${this.tableName}\${args.length ? \`(\${args.join(', ')})\` : ''} {
         \${this.selectFields.join('\\n')}
       }
     }
   \`;

     const res = await this.request<any>(query, {
       limit,
       offset,
       where: filters?.length ? where : undefined,
       orderBy: orderBy
         ? [{ [orderBy.field]: orderBy.direction }]
         : undefined,
       distinctOn,
     });

     return res[this.tableName];
   }

   async queryByPk(id: TPK): Promise<TSelect | null> {
     if (!this.pk) {
       throw new Error(\`No primary key for table \${this.tableName}\`);
     }

     const query = \`
       query ($id: \${this.pk.type}!) {
         \${this.tableName}_by_pk(\${this.pk.name}: $id) {
           \${this.selectFields.join('\\n')}
         }
       }
     \`;

     const res = await this.request<any>(query, { id });
     return res[\`\${this.tableName}_by_pk\`] ?? null;
   }

   async insert(data: TInsert): Promise<TSelect> {
     const query = \`
       mutation ($object: \${this.tableName}_insert_input!) {
         insert_\${this.tableName}_one(object: $object) {
           \${this.selectFields.join('\\n')}
         }
       }
     \`;

     const res = await this.request<any>(query, { object: data });
     return res[\`insert_\${this.tableName}_one\`];
   }

   async updateByPk(id: TPK, set: TUpdate): Promise<TSelect> {
     if (!this.pk) {
       throw new Error(\`No primary key for table \${this.tableName}\`);
     }

     const query = \`
       mutation ($id: \${this.pk.type}!, $set: \${this.tableName}_set_input!) {
         update_\${this.tableName}_by_pk(
           pk_columns: { \${this.pk.name}: $id }
           _set: $set
         ) {
           \${this.selectFields.join('\\n')}
         }
       }
     \`;

     const res = await this.request<any>(query, { id, set });
     return res[\`update_\${this.tableName}_by_pk\`];
   }

   async deleteByPk(id: TPK): Promise<TSelect> {
     if (!this.pk) {
       throw new Error(\`No primary key for table \${this.tableName}\`);
     }

     const query = \`
       mutation ($id: \${this.pk.type}!) {
         delete_\${this.tableName}_by_pk(\${this.pk.name}: $id) {
           \${this.selectFields.join('\\n')}
         }
       }
     \`;

     const res = await this.request<any>(query, { id });
     return res[\`delete_\${this.tableName}_by_pk\`];
   }
 }
 `;
}

/**
 * Generate main Hasura client
 */
function generateMainClient(metadata: SchemaMetadata): string {
  const tables = Array.from(metadata.tables.values());

  const imports = tables
    .map((t) => {
      const name = capitalize(t.name);
      return `import type { ${name}, ${name}InsertInput, ${name}UpdateInput } from '../types/tables';`;
    })
    .join("\n");

  const properties = tables
    .map((t) => {
      const prop = toCamelCase(t.name);
      const name = capitalize(t.name);
      return `  readonly ${prop}: TableClient<${name}, ${name}InsertInput, ${name}UpdateInput, ${
        t.primaryKey?.type ?? "any"
      }>;`;
    })
    .join("\n");

  const initializers = tables
    .map((t) => {
      const prop = toCamelCase(t.name);
      const pk = t.primaryKey
        ? `{ name: '${t.primaryKey.name}', type: '${t.primaryKey.type}' }`
        : "undefined";
      const requiredInsertFields =
        t.insertInput?.requiredFields.map((f) => f.name) ?? [];
      return `
    this.${prop} = new TableClient(
      endpoint,
      '${t.name}',
      ${JSON.stringify(t.fields.map((f) => f.name))},
      ${pk},
      ${JSON.stringify(requiredInsertFields)},
      headers
    );`;
    })
    .join("\n");

  return `// AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY

import { TableClient } from './table-client';

${imports}

export interface ClientConfig {
  endpoint: string;
  headers?: Record<string, string>;
}

export class HasuraClient {
${properties}

  constructor(config: ClientConfig) {
    const { endpoint, headers } = config;
${initializers}
  }
}

export function createClient(config: ClientConfig): HasuraClient {
  return new HasuraClient(config);
}
`;
}

/**
 * Entry point: generate all client files
 */
export async function generateAllClients(
  metadata: SchemaMetadata
): Promise<void> {
  const clientDir = path.join(GENERATOR_CONFIG.outputDir, "client");

  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(clientDir, "base-client.ts"),
    generateBaseClient()
  );

  fs.writeFileSync(
    path.join(clientDir, "table-client.ts"),
    generateTableClient()
  );

  fs.writeFileSync(
    path.join(clientDir, "index.ts"),
    generateMainClient(metadata)
  );

  console.log("Generated client code");
}
