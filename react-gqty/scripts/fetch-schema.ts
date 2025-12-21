import fs from "fs";
import path from "path";
import { GENERATOR_CONFIG, TenantConfig } from "./config";

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType {
        name
        fields {
          name
          description
          args {
            name
            description
            type {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
          type {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
      mutationType {
        name
        fields {
          name
          description
          args {
            name
            description
            type {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
          type {
            kind
            name
          }
        }
      }
      types {
        kind
        name
        description
        fields {
          name
          description
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
        inputFields {
          name
          type {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
    }
  }
`;

async function fetchSchemaForTenant(tenant: TenantConfig): Promise<any> {
  console.log(`Fetching schema for tenant: ${tenant.name} (${tenant.id})`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...tenant.headers,
  };

  try {
    const response = await fetch(tenant.hasuraEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: INTROSPECTION_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if ((result as any).errors) {
      throw new Error(
        `GraphQL errors: ${JSON.stringify((result as any).errors)}`
      );
    }

    return (result as any).data;
  } catch (error) {
    console.error(`Failed to fetch schema for ${tenant.id}:`, error);
    throw error;
  }
}

export async function fetchAllSchemas(): Promise<Map<string, any>> {
  const schemas = new Map<string, any>();

  for (const tenant of GENERATOR_CONFIG.tenants) {
    try {
      const schema = await fetchSchemaForTenant(tenant);
      schemas.set(tenant.id, schema);
      console.log(`Schema fetched for ${tenant.id}`);
    } catch (error) {
      console.error(`Skipping ${tenant.id} due to error`);
      // Continue with other tenants
    }
  }

  if (schemas.size === 0) {
    throw new Error("No schemas could be fetched. Check your configuration.");
  }

  return schemas;
}

export async function saveSchemas(schemas: Map<string, any>): Promise<void> {
  const schemasDir = path.join(GENERATOR_CONFIG.outputDir, "schemas");

  // Create directory if it doesn't exist
  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
  }

  for (const [tenantId, schema] of schemas.entries()) {
    const filePath = path.join(schemasDir, `${tenantId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
    console.log(`Saved schema: ${filePath}`);
  }
}
