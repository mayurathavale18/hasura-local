export interface IntrospectionSchema {
  __schema: {
    queryType: {
      name: string;
      fields: Array<{
        name: string;
        args: any[];
      }>;
    };
    types: Array<{
      kind: string;
      name: string;
      fields?: Array<{
        name: string;
        type: any;
      }>;
    }>;
    mutationType?: {
      name: string;
      fields: any[];
    };
  };
}

export async function fetchHasuraSchema(
  proxyUrl: string = "http://localhost:3000/graphql",
  tenantId?: string
): Promise<IntrospectionSchema> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }

  const res = await fetch(proxyUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        query IntrospectionQuery {
          __schema {
            queryType {
              name
              fields {
                name
                args {
                  name
                  type {
                    name
                    kind
                    ofType {
                      name
                      kind
                    }
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
                args {
                  name
                  type {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `,
    }),
  });

  if (!res.ok) {
    throw new Error(`Schema fetch failed: ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}
