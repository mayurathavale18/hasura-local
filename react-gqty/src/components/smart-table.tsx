import React, { useState } from "react";
import { useDynamicQuery } from "../hooks/useDynamicQuery";
import { useDynamicMutation } from "../hooks/useDynamicMutation";
import { useTableMetadata } from "../hooks/useTableMetadata";

interface SmartTableProps {
  tableName: string;
  pageSize?: number;
}

export function SmartTable({ tableName, pageSize = 10 }: SmartTableProps) {
  const { fields, operations } = useTableMetadata(tableName);
  const { data, loading, error, refetch } = useDynamicQuery(tableName, {
    limit: pageSize,
  });
  const [insertRecord, { loading: inserting }] = useDynamicMutation(
    tableName,
    "insert"
  );
  const [deleteRecord, { loading: deleting }] = useDynamicMutation(
    tableName,
    "delete"
  );

  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await insertRecord(formData);
      setFormData({});
      refetch();
    } catch (err) {
      console.error("Insert failed:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteRecord({ where: { id: { _eq: id } } });
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (!operations.canQuery) {
    return <div>Table "{tableName}" not accessible</div>;
  }

  return (
    <div>
      <h2>{tableName}</h2>

      {operations.canInsert && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: "20px",
            padding: "15px",
            background: "#f5f5f5",
          }}
        >
          <h3>Add New</h3>
          {fields
            .filter((f) => f !== "id")
            .map((field) => (
              <div key={field} style={{ marginBottom: "10px" }}>
                <label>{field}: </label>
                <input
                  type="text"
                  value={formData[field] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  style={{ padding: "5px", width: "200px" }}
                />
              </div>
            ))}
          <button type="submit" disabled={inserting}>
            {inserting ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}

      {loading && <p>Loading...</p>}

      {data.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {fields.map((field) => (
                <th
                  key={field}
                  style={{ border: "1px solid #ddd", padding: "8px" }}
                >
                  {field}
                </th>
              ))}
              {operations.canDelete && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx) => (
              <tr key={row.id || idx}>
                {fields.map((field) => (
                  <td
                    key={field}
                    style={{ border: "1px solid #ddd", padding: "8px" }}
                  >
                    {row[field]}
                  </td>
                ))}
                {operations.canDelete && (
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={deleting}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
