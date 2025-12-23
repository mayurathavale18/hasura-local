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
        env.HASURA_ENDPOINT || "https://hasura-qa.zotok.ai:8443/v1/graphql"
      ),
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.HASURA_ADMIN_SECRET": JSON.stringify(
        env.HASURA_ADMIN_SECRET || "sWetrohoswlwro3tostaqawlthuql0ha"
      ),
    },
  };
});
