import { useState, useEffect } from "react";
import { useGraphQL } from "../graphql/context";
import { buildListQuery } from "../graphql/schema-utils";

interface UseDynamicQueryOptions {
  skip?: boolean;
  pollInterval?: number;
  limit?: number;
}

export function useDynamicQuery<T = any>(
  tableName: string,
  options: UseDynamicQueryOptions = {}
) {
  const { client, schema } = useGraphQL();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const executeQuery = async () => {
    if (!client || !schema || options.skip) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query dynamically from schema
      const query = buildListQuery(schema, tableName, {
        limit: options.limit,
      });

      console.log(`[useDynamicQuery] Generated query for ${tableName}:`, query);

      const result = await client.query<any>(query);
      setData(result[tableName] || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Query failed"));
      console.error(`[useDynamicQuery] Error for ${tableName}:`, err);
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
    tableName,
    options.skip,
    options.pollInterval,
    options.limit,
    client,
    schema,
  ]);

  return { data, loading, error, refetch: executeQuery };
}
