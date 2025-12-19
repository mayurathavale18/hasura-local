import { useState } from "react";
import { useGraphQL } from "../graphql/context";

export function useMutation<T = any>(mutation: string) {
  const { client } = useGraphQL();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (variables?: any) => {
    if (!client) {
      throw new Error("GraphQL client not initialized");
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.mutate<T>(mutation, variables);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Mutation failed");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return [execute, { data, loading, error }] as const;
}
