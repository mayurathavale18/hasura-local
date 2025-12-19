/**
 * GQty: You can safely modify this file based on your needs.
 */

import { createReactClient } from "@gqty/react";
import { createClient as createSubscriptionsClient } from "graphql-ws";
import {
  Cache,
  createClient,
  defaultResponseHandler,
  type QueryFetcher,
} from "gqty";
import {
  generatedSchema,
  scalarsEnumsHash,
  type GeneratedSchema,
} from "./schema.generated";

const queryFetcher: QueryFetcher = async function (
  { query, variables, operationName },
  fetchOptions
) {
  // Modify "/api/graphql" if needed
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
      operationName,
    }),
    mode: "cors",
    ...fetchOptions,
  });

  return await defaultResponseHandler(response);
};

const subscriptionsClient =
  typeof window !== "undefined"
    ? createSubscriptionsClient({
        lazy: true,
        url: () => {
          // Modify if needed
          const url = new URL("/api/graphql", window.location.href);
          url.protocol = url.protocol.replace("http", "ws");
          return url.href;
        },
      })
    : undefined;

const cache = new Cache(
  undefined,
  /**
   * Cache is valid for 30 minutes, but starts revalidating after 5 seconds,
   * allowing soft refetches in background.
   */
  {
    maxAge: 5000,
    staleWhileRevalidate: 30 * 60 * 1000,
    normalization: true,
  }
);

export const client = createClient<GeneratedSchema>({
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  cache,
  fetchOptions: {
    fetcher: queryFetcher,
    subscriber: subscriptionsClient,
  },
});

// Core functions
export const { resolve, subscribe, schema } = client;

// Legacy functions
export const {
  query,
  mutation,
  mutate,
  subscription,
  resolved,
  refetch,
  track,
} = client;

export const {
  graphql,
  useQuery,
  usePaginatedQuery,
  useTransactionQuery,
  useLazyQuery,
  useRefetch,
  useMutation,
  useMetaState,
  prepareReactRender,
  useHydrateCache,
  prepareQuery,
  useSubscription,
} = createReactClient<GeneratedSchema>(client, {
  defaults: {
    // Enable Suspense, you can override this option for each hook.
    suspense: true,
  },
});

export * from "./schema.generated";
