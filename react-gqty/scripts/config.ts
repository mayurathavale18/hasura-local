export const GENERATOR_CONFIG = {
  outputDir: "./generated",

  hasuraEndpoint:
    process.env.HASURA_ENDPOINT ?? "https://hasura-qa.zotok.ai:8443/v1/graphql",

  proxyEndpoint: process.env.PROXY_ENDPOINT ?? "http://localhost:3000/graphql",

  useProxy: process.env.USE_PROXY === "true",

  /**
   * Path to Hasura metadata JSON
   * REQUIRED for correct insert validation
   */
  metadataPath: process.env.HASURA_METADATA_PATH ?? "./hasura_metadata.json",

  /**
   * Role used by client at runtime
   * Must match Hasura insert permissions
   */
  runtimeRole: process.env.HASURA_RUNTIME_ROLE ?? "server",
} as const;
