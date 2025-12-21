import { useState, useEffect } from "react";
import { createClient } from "../generated/client";
import type { TenantId } from "../generated/client";
// import type { DefaultClient } from "../generated/client/default-client";

export default function App() {
  const [tenantId, setTenantId] = useState<TenantId>("default");
  const [client, setClient] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  // Initialize client when tenant changes
  useEffect(() => {
    try {
      const newClient = createClient({
        endpoint: "http://localhost:3000/graphql",
        tenantId,
      });
      setClient(newClient);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    }
  }, [tenantId]);

  // Fetch profiles when client is ready
  const fetchProfiles = async () => {
    if (!client) return;

    try {
      setLoading(true);
      setError(null);

      // Type-safe method call generated at build time!
      const data = await client.queryProfiles({ limit: 50 });
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profiles");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [client]);

  // Insert profile
  const handleInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !newName.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Type-safe mutation generated at build time!
      await client.insertProfiles({ name: newName });
      setNewName("");
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to insert profile");
      console.error("Insert error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete profile
  const handleDelete = async (id: number) => {
    if (!client || !window.confirm("Delete this profile?")) return;

    try {
      setLoading(true);
      setError(null);

      // Type-safe mutation generated at build time!
      await client.deleteProfiles({ id: { _eq: id } });
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>Build-Time Generated GraphQL Client POC</h1>

      {/* Info Banner */}
      <div
        style={{
          background: "#e8f5e9",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #4caf50",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>
          Using Build-Time Generated Client
        </h3>
        <ul style={{ fontSize: "14px", lineHeight: "1.8", margin: 0 }}>
          <li>
            <strong>Client generated at build time</strong> from Hasura schema
          </li>
          <li>
            <strong>No runtime introspection</strong> queries needed
          </li>
          <li>
            <strong>Type-safe methods:</strong>{" "}
            <code>client.queryProfiles()</code>,{" "}
            <code>client.insertProfiles()</code>
          </li>
          <li>
            <strong>Multi-tenant support</strong> with pre-generated schemas
          </li>
          <li>
            <strong>Build fails if schema breaks</strong> → Production safety
          </li>
        </ul>
      </div>

      {/* Tenant Selector */}
      <div
        style={{
          background: "#e3f2fd",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h3>Select Tenant</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {(["default"] as TenantId[]).map((id) => (
            <button
              key={id}
              onClick={() => setTenantId(id)}
              style={{
                padding: "10px 20px",
                background: tenantId === id ? "#1976d2" : "#e0e0e0",
                color: tenantId === id ? "white" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: tenantId === id ? "bold" : "normal",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              {id === "default"
                ? "Default"
                : ((id ?? "") as string)
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          <strong>Active Tenant:</strong> {tenantId}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: "15px",
            background: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "5px",
            marginBottom: "20px",
            color: "#c62828",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Insert Form */}
      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add New Profile</h3>
        <form
          onSubmit={handleInsert}
          style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
        >
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Name:
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter profile name"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newName.trim()}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              background: loading || !newName.trim() ? "#ccc" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || !newName.trim() ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Adding..." : "Add Profile"}
          </button>
        </form>
      </div>

      {/* Profiles Table */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ margin: 0 }}>
            Profiles {profiles.length > 0 && `(${profiles.length})`}
          </h3>
          <button
            onClick={fetchProfiles}
            disabled={loading}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              background: loading ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && profiles.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "#f5f5f5",
              borderRadius: "5px",
            }}
          >
            <p style={{ fontSize: "16px", color: "#666" }}>
              Loading profiles...
            </p>
          </div>
        )}

        {!loading && profiles.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "#fff3e0",
              borderRadius: "5px",
              border: "1px solid #ff9800",
            }}
          >
            <p style={{ fontSize: "16px", color: "#e65100", margin: 0 }}>
              📭 No profiles found. Add one above!
            </p>
          </div>
        )}

        {profiles.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
                background: "white",
              }}
            >
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                      fontWeight: "bold",
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                      fontWeight: "bold",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "2px solid #ddd",
                      fontWeight: "bold",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr
                    key={profile.id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9f9f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <td style={{ padding: "12px" }}>{profile.id}</td>
                    <td style={{ padding: "12px" }}>{profile.name}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        disabled={loading}
                        style={{
                          padding: "6px 12px",
                          fontSize: "13px",
                          background: loading ? "#ccc" : "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code Example */}
      <div
        style={{
          marginTop: "30px",
          background: "#263238",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <h3 style={{ color: "#aed581", marginTop: 0 }}>Code Example</h3>
        <pre
          style={{
            color: "#aed581",
            margin: 0,
            overflow: "auto",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          {`// Generated client with type-safe methods
import { createClient } from '../generated/client';

const client = createClient({
  endpoint: 'http://localhost:3000/graphql',
  tenantId: '${tenantId}',
});

// Type-safe query
const profiles = await client.queryProfiles({
  limit: 10
});

// Type-safe mutation
await client.insertProfiles({
  name: 'John Doe'
});

// Type-safe delete
await client.deleteProfiles({
  id: { _eq: 1 }
});

// Raw queries still available
const result = await client.rawQuery(\`
  query { profiles { id name } }
\`);`}
        </pre>
      </div>
    </div>
  );
}
