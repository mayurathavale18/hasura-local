import { GraphQLClient } from "graphql-request";

export interface GraphQLClientConfig {
  endpoint: string;
  tenantId?: string;
  headers?: Record<string, string>;
}

export class RuntimeGraphQLClient {
  private client: GraphQLClient;
  private tenantId?: string;

  constructor(config: GraphQLClientConfig) {
    this.tenantId = config.tenantId;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    if (this.tenantId) {
      headers["x-tenant-id"] = this.tenantId;
    }

    this.client = new GraphQLClient(config.endpoint, {
      headers,
    });
  }

  async query<T = any>(query: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      console.error("GraphQL query error:", error);
      throw error;
    }
  }

  async mutate<T = any>(mutation: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(mutation, variables);
    } catch (error) {
      console.error("GraphQL mutation error:", error);
      throw error;
    }
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
    this.client.setHeader("x-tenant-id", tenantId);
  }

  removeTenantId() {
    this.tenantId = undefined;
    this.client.setHeader("x-tenant-id", "");
  }
}

export function createRuntimeClient(
  config: GraphQLClientConfig
): RuntimeGraphQLClient {
  return new RuntimeGraphQLClient(config);
}
