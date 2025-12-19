import { useState, useEffect } from "react";
import { useGraphQL } from "../graphql/context";

interface UseQueryOptions {
  skip?: boolean;
  pollInterval?: number;
}

export function useQuery<T = any>(
  query: string,
  variables?: any,
  options: UseQueryOptions = {}
) {
  const { client } = useGraphQL();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const executeQuery = async () => {
    if (!client || options.skip) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await client.query<T>(query, variables);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Query failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeQuery();

    if (options.pollInterval && !options.skip) {
      const interval = setInterval(executeQuery, options.pollInterval);
      return () => clearInterval(interval);
    }
  }, [
    query,
    JSON.stringify(variables),
    options.skip,
    options.pollInterval,
    client,
  ]);

  return { data, loading, error, refetch: executeQuery };
}
