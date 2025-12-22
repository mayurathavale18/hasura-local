export interface TenantConfig {
  id: string;
  name: string;
  headers?: Record<string, string>;
}

export const GENERATOR_CONFIG = {
  outputDir: "./generated",
  hasuraEndpoint:
    process.env.HASURA_ENDPOINT || "http://localhost:8080/v1/graphql",
  proxyEndpoint: process.env.PROXY_ENDPOINT || "http://localhost:3000/graphql",

  tenants: [
    {
      id: "public",
      name: "Public",
    },
    // {
    //   id: "enterprise_1",
    //   name: "Enterprise 1",
    //   headers: { "x-tenant-id": "enterprise_1" },
    // },
    // {
    //   id: "enterprise_2",
    //   name: "Enterprise 2",
    //   headers: { "x-tenant-id": "enterprise_2" },
    // },
  ] as TenantConfig[],
};
