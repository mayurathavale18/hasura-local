module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.app.json",
  },
  plugins: ["react-refresh"],
  rules: {
    // Disable react-refresh warning for context providers
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true, allowExportNames: ["loader", "action"] },
    ],

    // Allow explicit any for POC (can tighten later)
    "@typescript-eslint/no-explicit-any": "warn",

    // Allow unused vars that start with underscore
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // Allow console for debugging POC
    "no-console": "off",

    // Relax these for development
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
  },
};
