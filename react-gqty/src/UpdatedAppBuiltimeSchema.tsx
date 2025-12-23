import { useEffect, useMemo, useState } from "react";
import { createClient } from "../generated";

import type {
  Turnoverinvoice,
  TurnoverinvoiceInsertInput,
} from "../generated/types/tables";

/**
 * FINAL schema-agnostic, metadata-aware UI
 */
export default function UpdatedAppBuildtimeSchema() {
  const [client, setClient] = useState<ReturnType<typeof createClient> | null>(
    null
  );

  const [rows, setRows] = useState<Turnoverinvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Dynamic insert form state
   * Keys are validated by requiredInsertFields
   */
  const [form, setForm] = useState<Record<string, string | number>>({});

  /**
   * Initialize client
   */
  useEffect(() => {
    const c = createClient({
      endpoint:
        import.meta.env.VITE_PROXY_ENDPOINT ?? "http://localhost:3000/graphql",
      headers: {
        "x-hasura-admin-secret":
          import.meta.env.VITE_HASURA_SECRET ??
          "sWetrohoswlwro3tostaqawlthuql0ha",
      },
    });

    setClient(c);
  }, []);

  /**
   * Fetch table rows
   */
  async function fetchRows() {
    if (!client) return;

    try {
      setLoading(true);
      setError(null);
      const data = await client.turnoverinvoice.query();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch rows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, [client]);

  /**
   * REQUIRED INSERT FIELDS
   * (derived from Hasura metadata + DB constraints)
   */
  const requiredInsertFields = useMemo<string[]>(() => {
    if (!client) return [];
    console.log(
      "[required fields] : ",
      client.turnoverinvoice.requiredInsertFields
    );
    return client.turnoverinvoice.requiredInsertFields;
  }, [client]);

  /**
   * Insert handler
   */
  async function handleInsert(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;

    try {
      setLoading(true);
      setError(null);

      // for (const field of requiredInsertFields) {
      //   if (form[field] === undefined || form[field] === "") {
      //     throw new Error(`Missing required field: ${field}`);
      //   }
      // }

      await client.turnoverinvoice.insert(form as TurnoverinvoiceInsertInput);

      setForm({});
      await fetchRows();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Insert failed");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Delete handler
   */
  async function handleDelete(id: number | string) {
    if (!client) return;
    if (!confirm("Delete this row?")) return;

    try {
      setLoading(true);
      setError(null);
      await client.turnoverinvoice.deleteByPk(id);
      await fetchRows();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  console.log("[UpdatedAppBuildtimeSchema] : ", client?.turnoverinvoice);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Schema-Driven Hasura Client (Final)</h1>

      {error && (
        <div
          style={{
            background: "#ffebee",
            border: "1px solid #f44336",
            padding: 12,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* INSERT FORM */}
      <form
        onSubmit={handleInsert}
        style={{
          padding: 16,
          border: "1px solid #ddd",
          marginBottom: 24,
        }}
      >
        <h3>Insert turnoverinvoice</h3>

        {requiredInsertFields.map((field) => (
          <div key={field} style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
              }}
            >
              {field}
            </label>
            <input
              value={form[field] ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  [field]: e.target.value.match(/^\d+(\.\d+)?$/)
                    ? Number(e.target.value)
                    : e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: 8,
                fontSize: 14,
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            fontWeight: 600,
          }}
        >
          {loading ? "Saving..." : "Insert"}
        </button>
      </form>

      {/* TABLE */}
      <h3>Rows</h3>

      {loading && rows.length === 0 && <p>Loading…</p>}
      {!loading && rows.length === 0 && <p>No data</p>}

      {rows.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Invoice Number</th>
              <th>Amount</th>
              <th>Submitted By</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.invoice_number}</td>
                <td>{r.invoice_amount}</td>
                <td>{r.submittedby}</td>
                <td>
                  <button onClick={() => handleDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
