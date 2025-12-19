import React from "react";
import ReactDOM from "react-dom/client";
import { GraphQLProvider } from "./graphql/context";
import { MultiTenantApp } from "./UpdatedMultiTenantApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GraphQLProvider endpoint="http://localhost:3000/graphql">
      <MultiTenantApp />
    </GraphQLProvider>
  </React.StrictMode>
);
