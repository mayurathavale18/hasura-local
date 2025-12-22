import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Make process.env available in React components
    define: {
      "process.env.PROXY_ENDPOINT": JSON.stringify(
        env.PROXY_ENDPOINT || "http://localhost:3000/graphql"
      ),
      "process.env.HASURA_ENDPOINT": JSON.stringify(
        env.HASURA_ENDPOINT || "http://localhost:8080/v1/graphql"
      ),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
  };
});
