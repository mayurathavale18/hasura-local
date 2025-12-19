import { useState } from "react";
import { GraphQLProvider } from "./graphql/context";
import App from "./UpdatedApp";

export function MultiTenantApp() {
  const [tenantId, setTenantId] = useState("tenant-1");

  return (
    <div>
      <div
        style={{
          padding: "15px",
          background: "#333",
          color: "white",
          display: "flex",
          gap: "15px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label htmlFor="tenant-select" style={{ fontWeight: "bold" }}>
            Active Tenant:
          </label>
          <select
            id="tenant-select"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "none",
              fontSize: "14px",
            }}
          >
            <option value="tenant-1">Tenant 1 (Default)</option>
            <option value="tenant-2">Tenant 2 (Enterprise)</option>
            <option value="tenant-3">Tenant 3 (Startup)</option>
          </select>
        </div>

        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          Multi-Tenant POC - Schema fetched per tenant
        </div>
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
