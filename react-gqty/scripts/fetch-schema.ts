import { GENERATOR_CONFIG } from "./config";

/**
 * FULL Hasura-safe introspection query
 * - Includes inputFields + defaultValue (critical for required fields)
 * - Includes mutation args (for PK detection)
 */
const INTROSPECTION_QUERY = `
query IntrospectionQuery {
  __schema {
  queryType {
        fields {
          name
          args {
                name
                type {
                  ...TypeRef
                }
              }
        }
      }
    mutationType {
      fields {
        name
        args {
          name
          type {
            ...TypeRef
          }
        }
      }
    }
    types {
      kind
      name
      fields {
        name
        type {
          ...TypeRef
        }
      }
      inputFields {
        name
        defaultValue
        type {
          ...TypeRef
        }
      }
    }
  }
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
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
`;

/**
 * Fetch unified schema from Hasura (or proxy)
 */
export async function fetchSchema(): Promise<any> {
  const endpoint = GENERATOR_CONFIG.useProxy
    ? GENERATOR_CONFIG.proxyEndpoint
    : GENERATOR_CONFIG.hasuraEndpoint;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-hasura-admin-secret":
      process.env.HASURA_ADMIN_SECRET ?? "sWetrohoswlwro3tostaqawlthuql0ha",
  };

  console.log(`Fetching schema from ${endpoint}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: INTROSPECTION_QUERY,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Schema fetch failed: ${response.status} ${response.statusText}`
    );
  }

  const result = (await response.json()) as any;

  if (result.errors) {
    throw new Error(
      `GraphQL introspection errors: ${JSON.stringify(result.errors, null, 2)}`
    );
  }

  if (!result.data?.__schema) {
    throw new Error("Invalid introspection response: missing __schema");
  }

  console.log("Schema fetched successfully");
  return result.data;
}

/**
 * Validate minimal schema structure
 */
export function validateSchema(schema: any): void {
  if (!schema.__schema) {
    throw new Error("Invalid schema: __schema missing");
  }

  if (!schema.__schema.queryType) {
    throw new Error("Invalid schema: queryType missing");
  }

  if (!Array.isArray(schema.__schema.types)) {
    throw new Error("Invalid schema: types array missing");
  }

  console.log("Schema validation passed");
}
