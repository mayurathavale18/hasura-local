import React from "react";
import ReactDOM from "react-dom/client";
// import { GraphQLProvider } from "./graphql/context";
// import { MultiTenantApp } from "./UpdatedMultiTenantApp";
import BuildTimeSchemaApp from "./UpdatedAppBuiltimeSchema";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/*<GraphQLProvider endpoint="http://localhost:3000/graphql">*/}
    <BuildTimeSchemaApp />
    {/*</GraphQLProvider>*/}
  </React.StrictMode>
);
