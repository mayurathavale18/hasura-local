/**
 * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { type ScalarsEnumsHash } from "gqty";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  uuid: { input: any; output: any };
}

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export interface String_comparison_exp {
  _eq?: InputMaybe<Scalars["String"]["input"]>;
  _gt?: InputMaybe<Scalars["String"]["input"]>;
  _gte?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars["String"]["input"]>;
  _in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars["String"]["input"]>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars["String"]["input"]>;
  _lt?: InputMaybe<Scalars["String"]["input"]>;
  _lte?: InputMaybe<Scalars["String"]["input"]>;
  _neq?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars["String"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars["String"]["input"]>;
}

/** ordering argument of a cursor */
export enum cursor_ordering {
  /** ascending ordering of the cursor */
  ASC = "ASC",
  /** descending ordering of the cursor */
  DESC = "DESC",
}

/** column ordering options */
export enum order_by {
  /** in ascending order, nulls last */
  asc = "asc",
  /** in ascending order, nulls first */
  asc_nulls_first = "asc_nulls_first",
  /** in ascending order, nulls last */
  asc_nulls_last = "asc_nulls_last",
  /** in descending order, nulls first */
  desc = "desc",
  /** in descending order, nulls first */
  desc_nulls_first = "desc_nulls_first",
  /** in descending order, nulls last */
  desc_nulls_last = "desc_nulls_last",
}

/** Boolean expression to filter rows from the table "profiles". All fields are combined with a logical 'AND'. */
export interface profiles_bool_exp {
  _and?: InputMaybe<Array<profiles_bool_exp>>;
  _not?: InputMaybe<profiles_bool_exp>;
  _or?: InputMaybe<Array<profiles_bool_exp>>;
  id?: InputMaybe<uuid_comparison_exp>;
  name?: InputMaybe<String_comparison_exp>;
}

/** unique or primary key constraints on table "profiles" */
export enum profiles_constraint {
  /** unique or primary key constraint on columns "id" */
  profiles_pkey = "profiles_pkey",
}

/** input type for inserting data into table "profiles" */
export interface profiles_insert_input {
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
}

/** on_conflict condition type for table "profiles" */
export interface profiles_on_conflict {
  constraint: profiles_constraint;
  update_columns?: Array<profiles_update_column>;
  where?: InputMaybe<profiles_bool_exp>;
}

/** Ordering options when selecting data from "profiles". */
export interface profiles_order_by {
  id?: InputMaybe<order_by>;
  name?: InputMaybe<order_by>;
}

/** primary key columns input for table: profiles */
export interface profiles_pk_columns_input {
  id: Scalars["uuid"]["input"];
}

/** select columns of table "profiles" */
export enum profiles_select_column {
  /** column name */
  id = "id",
  /** column name */
  name = "name",
}

/** input type for updating data in table "profiles" */
export interface profiles_set_input {
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
}

/** Streaming cursor of the table "profiles" */
export interface profiles_stream_cursor_input {
  /** Stream column input with initial value */
  initial_value: profiles_stream_cursor_value_input;
  /** cursor ordering */
  ordering?: InputMaybe<cursor_ordering>;
}

/** Initial value of the column from where the streaming should start */
export interface profiles_stream_cursor_value_input {
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
}

/** update columns of table "profiles" */
export enum profiles_update_column {
  /** column name */
  id = "id",
  /** column name */
  name = "name",
}

export interface profiles_updates {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<profiles_set_input>;
  /** filter the rows which have to be updated */
  where: profiles_bool_exp;
}

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export interface uuid_comparison_exp {
  _eq?: InputMaybe<Scalars["uuid"]["input"]>;
  _gt?: InputMaybe<Scalars["uuid"]["input"]>;
  _gte?: InputMaybe<Scalars["uuid"]["input"]>;
  _in?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["uuid"]["input"]>;
  _lte?: InputMaybe<Scalars["uuid"]["input"]>;
  _neq?: InputMaybe<Scalars["uuid"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
}

export const scalarsEnumsHash: ScalarsEnumsHash = {
  Boolean: true,
  Int: true,
  String: true,
  cursor_ordering: true,
  order_by: true,
  profiles_constraint: true,
  profiles_select_column: true,
  profiles_update_column: true,
  uuid: true,
};
export const generatedSchema = {
  String_comparison_exp: {
    _eq: { __type: "String" },
    _gt: { __type: "String" },
    _gte: { __type: "String" },
    _ilike: { __type: "String" },
    _in: { __type: "[String!]" },
    _iregex: { __type: "String" },
    _is_null: { __type: "Boolean" },
    _like: { __type: "String" },
    _lt: { __type: "String" },
    _lte: { __type: "String" },
    _neq: { __type: "String" },
    _nilike: { __type: "String" },
    _nin: { __type: "[String!]" },
    _niregex: { __type: "String" },
    _nlike: { __type: "String" },
    _nregex: { __type: "String" },
    _nsimilar: { __type: "String" },
    _regex: { __type: "String" },
    _similar: { __type: "String" },
  },
  mutation: {
    __typename: { __type: "String!" },
    delete_profiles: {
      __type: "profiles_mutation_response",
      __args: { where: "profiles_bool_exp!" },
    },
    delete_profiles_by_pk: { __type: "profiles", __args: { id: "uuid!" } },
    insert_profiles: {
      __type: "profiles_mutation_response",
      __args: {
        objects: "[profiles_insert_input!]!",
        on_conflict: "profiles_on_conflict",
      },
    },
    insert_profiles_one: {
      __type: "profiles",
      __args: {
        object: "profiles_insert_input!",
        on_conflict: "profiles_on_conflict",
      },
    },
    update_profiles: {
      __type: "profiles_mutation_response",
      __args: { _set: "profiles_set_input", where: "profiles_bool_exp!" },
    },
    update_profiles_by_pk: {
      __type: "profiles",
      __args: {
        _set: "profiles_set_input",
        pk_columns: "profiles_pk_columns_input!",
      },
    },
    update_profiles_many: {
      __type: "[profiles_mutation_response]",
      __args: { updates: "[profiles_updates!]!" },
    },
  },
  profiles: {
    __typename: { __type: "String!" },
    id: { __type: "uuid!" },
    name: { __type: "String!" },
  },
  profiles_aggregate: {
    __typename: { __type: "String!" },
    aggregate: { __type: "profiles_aggregate_fields" },
    nodes: { __type: "[profiles!]!" },
  },
  profiles_aggregate_fields: {
    __typename: { __type: "String!" },
    count: {
      __type: "Int!",
      __args: { columns: "[profiles_select_column!]", distinct: "Boolean" },
    },
    max: { __type: "profiles_max_fields" },
    min: { __type: "profiles_min_fields" },
  },
  profiles_bool_exp: {
    _and: { __type: "[profiles_bool_exp!]" },
    _not: { __type: "profiles_bool_exp" },
    _or: { __type: "[profiles_bool_exp!]" },
    id: { __type: "uuid_comparison_exp" },
    name: { __type: "String_comparison_exp" },
  },
  profiles_insert_input: { id: { __type: "uuid" }, name: { __type: "String" } },
  profiles_max_fields: {
    __typename: { __type: "String!" },
    id: { __type: "uuid" },
    name: { __type: "String" },
  },
  profiles_min_fields: {
    __typename: { __type: "String!" },
    id: { __type: "uuid" },
    name: { __type: "String" },
  },
  profiles_mutation_response: {
    __typename: { __type: "String!" },
    affected_rows: { __type: "Int!" },
    returning: { __type: "[profiles!]!" },
  },
  profiles_on_conflict: {
    constraint: { __type: "profiles_constraint!" },
    update_columns: { __type: "[profiles_update_column!]!" },
    where: { __type: "profiles_bool_exp" },
  },
  profiles_order_by: {
    id: { __type: "order_by" },
    name: { __type: "order_by" },
  },
  profiles_pk_columns_input: { id: { __type: "uuid!" } },
  profiles_set_input: { id: { __type: "uuid" }, name: { __type: "String" } },
  profiles_stream_cursor_input: {
    initial_value: { __type: "profiles_stream_cursor_value_input!" },
    ordering: { __type: "cursor_ordering" },
  },
  profiles_stream_cursor_value_input: {
    id: { __type: "uuid" },
    name: { __type: "String" },
  },
  profiles_updates: {
    _set: { __type: "profiles_set_input" },
    where: { __type: "profiles_bool_exp!" },
  },
  query: {
    __typename: { __type: "String!" },
    profiles: {
      __type: "[profiles!]!",
      __args: {
        distinct_on: "[profiles_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[profiles_order_by!]",
        where: "profiles_bool_exp",
      },
    },
    profiles_aggregate: {
      __type: "profiles_aggregate!",
      __args: {
        distinct_on: "[profiles_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[profiles_order_by!]",
        where: "profiles_bool_exp",
      },
    },
    profiles_by_pk: { __type: "profiles", __args: { id: "uuid!" } },
  },
  subscription: {
    __typename: { __type: "String!" },
    profiles: {
      __type: "[profiles!]!",
      __args: {
        distinct_on: "[profiles_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[profiles_order_by!]",
        where: "profiles_bool_exp",
      },
    },
    profiles_aggregate: {
      __type: "profiles_aggregate!",
      __args: {
        distinct_on: "[profiles_select_column!]",
        limit: "Int",
        offset: "Int",
        order_by: "[profiles_order_by!]",
        where: "profiles_bool_exp",
      },
    },
    profiles_by_pk: { __type: "profiles", __args: { id: "uuid!" } },
    profiles_stream: {
      __type: "[profiles!]!",
      __args: {
        batch_size: "Int!",
        cursor: "[profiles_stream_cursor_input]!",
        where: "profiles_bool_exp",
      },
    },
  },
  uuid_comparison_exp: {
    _eq: { __type: "uuid" },
    _gt: { __type: "uuid" },
    _gte: { __type: "uuid" },
    _in: { __type: "[uuid!]" },
    _is_null: { __type: "Boolean" },
    _lt: { __type: "uuid" },
    _lte: { __type: "uuid" },
    _neq: { __type: "uuid" },
    _nin: { __type: "[uuid!]" },
  },
} as const;

export interface Mutation {
  __typename?: "Mutation";
  delete_profiles: (args: {
    where: profiles_bool_exp;
  }) => Maybe<profiles_mutation_response>;
  delete_profiles_by_pk: (args: {
    id: Scalars["uuid"]["input"];
  }) => Maybe<profiles>;
  insert_profiles: (args: {
    objects: Array<profiles_insert_input>;
    on_conflict?: Maybe<profiles_on_conflict>;
  }) => Maybe<profiles_mutation_response>;
  insert_profiles_one: (args: {
    object: profiles_insert_input;
    on_conflict?: Maybe<profiles_on_conflict>;
  }) => Maybe<profiles>;
  update_profiles: (args: {
    _set?: Maybe<profiles_set_input>;
    where: profiles_bool_exp;
  }) => Maybe<profiles_mutation_response>;
  update_profiles_by_pk: (args: {
    _set?: Maybe<profiles_set_input>;
    pk_columns: profiles_pk_columns_input;
  }) => Maybe<profiles>;
  update_profiles_many: (args: {
    updates: Array<profiles_updates>;
  }) => Maybe<Array<Maybe<profiles_mutation_response>>>;
}

/**
 * simple table to store minimal user profle
 */
export interface profiles {
  __typename?: "profiles";
  id?: Scalars["uuid"]["output"];
  name?: Scalars["String"]["output"];
}

/**
 * aggregated selection of "profiles"
 */
export interface profiles_aggregate {
  __typename?: "profiles_aggregate";
  aggregate?: Maybe<profiles_aggregate_fields>;
  nodes: Array<profiles>;
}

/**
 * aggregate fields of "profiles"
 */
export interface profiles_aggregate_fields {
  __typename?: "profiles_aggregate_fields";
  count: (args?: {
    columns?: Maybe<Array<profiles_select_column>>;
    distinct?: Maybe<Scalars["Boolean"]["input"]>;
  }) => Scalars["Int"]["output"];
  max?: Maybe<profiles_max_fields>;
  min?: Maybe<profiles_min_fields>;
}

/**
 * aggregate max on columns
 */
export interface profiles_max_fields {
  __typename?: "profiles_max_fields";
  id?: Maybe<Scalars["uuid"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
}

/**
 * aggregate min on columns
 */
export interface profiles_min_fields {
  __typename?: "profiles_min_fields";
  id?: Maybe<Scalars["uuid"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
}

/**
 * response of any mutation on the table "profiles"
 */
export interface profiles_mutation_response {
  __typename?: "profiles_mutation_response";
  /**
   * number of rows affected by the mutation
   */
  affected_rows?: Scalars["Int"]["output"];
  /**
   * data from the rows affected by the mutation
   */
  returning: Array<profiles>;
}

export interface Query {
  __typename?: "Query";
  profiles: (args?: {
    distinct_on?: Maybe<Array<profiles_select_column>>;
    limit?: Maybe<Scalars["Int"]["input"]>;
    offset?: Maybe<Scalars["Int"]["input"]>;
    order_by?: Maybe<Array<profiles_order_by>>;
    where?: Maybe<profiles_bool_exp>;
  }) => Array<profiles>;
  profiles_aggregate: (args?: {
    distinct_on?: Maybe<Array<profiles_select_column>>;
    limit?: Maybe<Scalars["Int"]["input"]>;
    offset?: Maybe<Scalars["Int"]["input"]>;
    order_by?: Maybe<Array<profiles_order_by>>;
    where?: Maybe<profiles_bool_exp>;
  }) => profiles_aggregate;
  profiles_by_pk: (args: { id: Scalars["uuid"]["input"] }) => Maybe<profiles>;
}

export interface Subscription {
  __typename?: "Subscription";
  profiles: (args?: {
    distinct_on?: Maybe<Array<profiles_select_column>>;
    limit?: Maybe<Scalars["Int"]["input"]>;
    offset?: Maybe<Scalars["Int"]["input"]>;
    order_by?: Maybe<Array<profiles_order_by>>;
    where?: Maybe<profiles_bool_exp>;
  }) => Array<profiles>;
  profiles_aggregate: (args?: {
    distinct_on?: Maybe<Array<profiles_select_column>>;
    limit?: Maybe<Scalars["Int"]["input"]>;
    offset?: Maybe<Scalars["Int"]["input"]>;
    order_by?: Maybe<Array<profiles_order_by>>;
    where?: Maybe<profiles_bool_exp>;
  }) => profiles_aggregate;
  profiles_by_pk: (args: { id: Scalars["uuid"]["input"] }) => Maybe<profiles>;
  profiles_stream: (args: {
    batch_size: Scalars["Int"]["input"];
    cursor: Array<Maybe<profiles_stream_cursor_input>>;
    where?: Maybe<profiles_bool_exp>;
  }) => Array<profiles>;
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}
