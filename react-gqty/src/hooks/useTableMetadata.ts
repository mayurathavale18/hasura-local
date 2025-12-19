import { useMemo } from "react";
import { useGraphQL } from "../graphql/context";
import {
  getScalarFields,
  getTableOperations,
  findTypeByName,
} from "../graphql/schema-utils";

export function useTableMetadata(tableName: string) {
  const { schema } = useGraphQL();

  const metadata = useMemo(() => {
    if (!schema) {
      return {
        fields: [],
        operations: {
          canQuery: false,
          canInsert: false,
          canUpdate: false,
          canDelete: false,
          canAggregate: false,
          canQueryByPk: false,
        },
        typeInfo: null,
      };
    }

    const fields = getScalarFields(schema, tableName);
    const operations = getTableOperations(schema, tableName);
    const typeInfo = findTypeByName(schema, tableName);

    return { fields, operations, typeInfo };
  }, [schema, tableName]);

  return metadata;
}
