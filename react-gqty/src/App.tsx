import { useState } from "react";
import { useQuery } from "./hooks/useQuery";
import { useMutation } from "./hooks/useMutation";
import { useGraphQL } from "./graphql/context";

interface Profile {
  id: number;
  name: string;
}

interface ProfilesResponse {
  profiles: Profile[];
}

interface InsertProfileResponse {
  insert_profiles: {
    returning: Profile[];
  };
}

export default function App() {
  const { schema, loading: schemaLoading, error: schemaError } = useGraphQL();
  const [newName, setNewName] = useState("");

  // Query to fetch profiles
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery<ProfilesResponse>(
    `
      query GetProfiles {
        profiles {
          id
          name
        }
      }
    `
  );

  // Mutation to insert profile
  const [insertProfile, { loading: mutationLoading, error: mutationError }] =
    useMutation<InsertProfileResponse>(
      `
        mutation InsertProfile($name: String!) {
          insert_profiles(objects: { name: $name }) {
            returning {
              id
              name
            }
          }
        }
      `
    );

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await insertProfile({ name: newName });
      setNewName("");
      refetch(); // Refetch profiles after insertion
    } catch (err) {
      console.error("Failed to add profile:", err);
    }
  };

  if (schemaLoading) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Runtime GraphQL Client POC</h1>
        <p>Loading schema from Hasura...</p>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Runtime GraphQL Client POC</h1>
        <div style={{ color: "red", padding: "10px", border: "1px solid red" }}>
          <strong>Schema Error:</strong> {schemaError.message}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>Runtime GraphQL Client POC</h1>

      {/* Schema Info */}
      <div
        style={{
          background: "#f0f0f0",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h3>Schema Loaded</h3>
        <p>
          <strong>Query Type:</strong> {schema?.__schema.queryType.name}
        </p>
        <p>
          <strong>Available Queries:</strong>{" "}
          {schema?.__schema.queryType.fields.map((f) => f.name).join(", ")}
        </p>
        {schema?.__schema.mutationType && (
          <>
            <p>
              <strong>Mutation Type:</strong>{" "}
              {schema.__schema.mutationType.name}
            </p>
            <p>
              <strong>Available Mutations:</strong>{" "}
              {schema?.__schema.mutationType.fields
                .map((f) => f.name)
                .join(", ")}
            </p>
          </>
        )}
      </div>

      {/* Add Profile Form */}
      <div
        style={{
          background: "#e3f2fd",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <h2>Add New Profile</h2>
        <form
          onSubmit={handleAddProfile}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter name"
            style={{
              flex: 1,
              padding: "8px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            type="submit"
            disabled={mutationLoading || !newName.trim()}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: mutationLoading ? "not-allowed" : "pointer",
              opacity: mutationLoading || !newName.trim() ? 0.6 : 1,
            }}
          >
            {mutationLoading ? "Adding..." : "Add Profile"}
          </button>
        </form>
        {mutationError && (
          <p style={{ color: "red", marginTop: "10px" }}>
            Error: {mutationError.message}
          </p>
        )}
      </div>

      {/* Profiles List */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Profiles</h2>
          <button
            onClick={refetch}
            disabled={queryLoading}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: queryLoading ? "not-allowed" : "pointer",
            }}
          >
            {queryLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {queryLoading && !data && <p>Loading profiles...</p>}

        {queryError && (
          <div
            style={{ color: "red", padding: "10px", border: "1px solid red" }}
          >
            Error: {queryError.message}
          </div>
        )}

        {data?.profiles && data.profiles.length === 0 && (
          <p style={{ color: "#666" }}>No profiles found. Add one above!</p>
        )}

        {data?.profiles && data.profiles.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {data.profiles.map((profile) => (
              <li
                key={profile.id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <strong>ID:</strong> {profile.id}
                </span>
                <span>
                  <strong>Name:</strong> {profile.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
