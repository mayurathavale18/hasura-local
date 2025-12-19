import { useState } from "react";
import { useGraphQL } from "./graphql/context";
import { SmartTable } from "./components/smart-table";
import {
  getTableNames,
  getAvailableQueries,
  getAvailableMutations,
} from "./graphql/schema-utils";

export default function App() {
  const { schema, loading: schemaLoading, error: schemaError } = useGraphQL();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [showSchemaDetails, setShowSchemaDetails] = useState(true);

  // Get available tables from schema
  const tables = schema ? getTableNames(schema) : [];
  const queries = schema ? getAvailableQueries(schema) : [];
  const mutations = schema ? getAvailableMutations(schema) : [];

  // Auto-select first table
  if (tables.length > 0 && !selectedTable) {
    setSelectedTable(tables[0]);
  }

  if (schemaLoading) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Runtime GraphQL Client POC</h1>
        <div
          style={{
            padding: "20px",
            background: "#e3f2fd",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          <p>Loading schema from Hasura...</p>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #1976d2",
              borderRadius: "50%",
              margin: "20px auto",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Runtime GraphQL Client POC</h1>
        <div
          style={{
            color: "#d32f2f",
            padding: "15px",
            border: "2px solid #d32f2f",
            borderRadius: "5px",
            background: "#ffebee",
          }}
        >
          <strong>Schema Error:</strong> {schemaError.message}
          <p style={{ marginTop: "10px", fontSize: "14px" }}>
            Make sure:
            <ul>
              <li>Hasura is running on http://localhost:8080</li>
              <li>NestJS proxy is running on http://localhost:3000</li>
              <li>CORS is properly configured</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <h1>Runtime GraphQL Client POC</h1>

      {/* Schema Information */}
      <div
        style={{
          background: "#f0f0f0",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>schema loaded</h3>
          <button
            onClick={() => setShowSchemaDetails(!showSchemaDetails)}
            style={{
              padding: "5px 10px",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showSchemaDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {showSchemaDetails && (
          <>
            <p>
              <strong>Query Type:</strong> {schema?.__schema.queryType.name}
            </p>
            <p>
              <strong>Available Queries ({queries.length}):</strong>{" "}
              <span style={{ fontSize: "12px" }}>
                {queries.map((q) => q.name).join(", ")}
              </span>
            </p>

            {schema?.__schema.mutationType && (
              <>
                <p>
                  <strong>Mutation Type:</strong>{" "}
                  {schema.__schema.mutationType.name}
                </p>
                <p>
                  <strong>Available Mutations ({mutations.length}):</strong>{" "}
                  <span style={{ fontSize: "12px" }}>
                    {mutations.map((m) => m.name).join(", ")}
                  </span>
                </p>
              </>
            )}

            <p>
              <strong>Discovered Tables ({tables.length}):</strong>{" "}
              {tables.join(", ")}
            </p>
          </>
        )}
      </div>

      {/* Table Selector */}
      {tables.length > 0 && (
        <div
          style={{
            background: "#fff3e0",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Select Table to Manage</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                style={{
                  padding: "10px 15px",
                  background: selectedTable === table ? "#1976d2" : "#e0e0e0",
                  color: selectedTable === table ? "white" : "#333",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: selectedTable === table ? "bold" : "normal",
                }}
              >
                {table}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Table Component */}
      {selectedTable && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        >
          <SmartTable tableName={selectedTable} />
        </div>
      )}

      {/* No Tables Found */}
      {tables.length === 0 && (
        <div
          style={{
            padding: "20px",
            background: "#fff3e0",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          <h3>No Tables Found</h3>
          <p>
            Create a table in Hasura Console and refresh this page:
            <br />
            <a
              href="http://localhost:8080/console"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1976d2" }}
            >
              Open Hasura Console
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
