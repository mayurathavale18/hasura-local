import { useState } from "react";
import { GraphQLProvider } from "./graphql/context";
import App from "./App";

export function MultiTenantApp() {
  const [tenantId, setTenantId] = useState("tenant-1");

  return (
    <div>
      <div
        style={{
          padding: "10px",
          background: "#333",
          color: "white",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <label htmlFor="tenant-select">Tenant:</label>
        <select
          id="tenant-select"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="tenant-1">Tenant 1</option>
          <option value="tenant-2">Tenant 2</option>
          <option value="tenant-3">Tenant 3</option>
        </select>
      </div>

      <GraphQLProvider
        endpoint="http://localhost:3000/graphql"
        tenantId={tenantId}
      >
        <App />
      </GraphQLProvider>
    </div>
  );
}
