export interface TenantConfig {
  id: string;
  name: string;
  hasuraEndpoint: string;
  headers?: Record<string, string>;
}

export const GENERATOR_CONFIG = {
  outputDir: "./generated",
  hasuraEndpoint:
    process.env.HASURA_ENDPOINT || "http://localhost:8080/v1/graphql",
  proxyEndpoint: process.env.PROXY_ENDPOINT || "http://localhost:3000/graphql",

  tenants: [
    {
      id: "default",
      name: "Default Tenant",
      hasuraEndpoint: "http://localhost:8080/v1/graphql",
    },
    // {
    //   id: "tenant-1",
    //   name: "Tenant 1",
    //   hasuraEndpoint: "http://localhost:8080/v1/graphql",
    //   headers: { "x-tenant-id": "tenant-1" },
    // },
    // {
    //   id: "tenant-2",
    //   name: "Tenant 2",
    //   hasuraEndpoint: "http://localhost:8080/v1/graphql",
    //   headers: { "x-tenant-id": "tenant-2" },
    // },
  ] as TenantConfig[],
};
