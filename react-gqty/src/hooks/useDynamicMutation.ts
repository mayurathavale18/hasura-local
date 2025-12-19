import { useState } from "react";
import { useGraphQL } from "../graphql/context";
import {
  buildInsertMutation,
  buildUpdateMutation,
  buildDeleteMutation,
} from "../graphql/schema-utils";

type MutationType = "insert" | "update" | "delete";

export function useDynamicMutation<T = any>(
  tableName: string,
  type: MutationType
) {
  const { client, schema } = useGraphQL();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (variables?: any) => {
    if (!client || !schema) {
      throw new Error("GraphQL client or schema not initialized");
    }

    try {
      setLoading(true);
      setError(null);

      let mutation: string;
      let mutationVars: any = variables;

      switch (type) {
        case "insert": {
          const { mutation: insertMutation, variableName } =
            buildInsertMutation(schema, tableName);
          mutation = insertMutation;
          mutationVars = { [variableName]: variables };
          console.log(`[useDynamicMutation] Insert mutation:`, mutation);
          break;
        }
        case "update": {
          const { mutation: updateMutation } = buildUpdateMutation(
            schema,
            tableName
          );
          mutation = updateMutation;
          console.log(`[useDynamicMutation] Update mutation:`, mutation);
          break;
        }
        case "delete": {
          const { mutation: deleteMutation } = buildDeleteMutation(
            schema,
            tableName
          );
          mutation = deleteMutation;
          console.log(`[useDynamicMutation] Delete mutation:`, mutation);
          break;
        }
        default:
          throw new Error(`Unknown mutation type: ${type}`);
      }

      const result = await client.mutate<T>(mutation, mutationVars);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Mutation failed");
      setError(error);
      console.error(`[useDynamicMutation] Error:`, err);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return [execute, { data, loading, error }] as const;
}
