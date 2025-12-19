import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { RuntimeGraphQLClient, createRuntimeClient } from "./client";
import { fetchHasuraSchema } from "./schema";
import type { IntrospectionSchema } from "./schema";

interface GraphQLContextValue {
  client: RuntimeGraphQLClient | null;
  schema: IntrospectionSchema | null;
  loading: boolean;
  error: Error | null;
  refetchSchema: () => Promise<void>;
}

const GraphQLContext = createContext<GraphQLContextValue>({
  client: null,
  schema: null,
  loading: true,
  error: null,
  refetchSchema: async () => {},
});

interface GraphQLProviderProps {
  children: ReactNode;
  endpoint?: string;
  tenantId?: string;
}

export function GraphQLProvider({
  children,
  endpoint = "http://localhost:3000/graphql",
  tenantId,
}: GraphQLProviderProps) {
  const [client, setClient] = useState<RuntimeGraphQLClient | null>(null);
  const [schema, setSchema] = useState<IntrospectionSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAndSetupClient = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch schema
      const schemaData = await fetchHasuraSchema(endpoint, tenantId);
      setSchema(schemaData);

      // Create client
      const newClient = createRuntimeClient({
        endpoint,
        tenantId,
      });
      setClient(newClient);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Failed to initialize GraphQL client:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetupClient();
  }, [endpoint, tenantId]);

  return (
    <GraphQLContext.Provider
      value={{
        client,
        schema,
        loading,
        error,
        refetchSchema: fetchAndSetupClient,
      }}
    >
      {children}
    </GraphQLContext.Provider>
  );
}

export function useGraphQL() {
  const context = useContext(GraphQLContext);
  if (!context) {
    throw new Error("useGraphQL must be used within GraphQLProvider");
  }
  return context;
}
