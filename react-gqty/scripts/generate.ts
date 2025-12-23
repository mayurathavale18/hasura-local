import fs from "fs";
import path from "path";
import { GENERATOR_CONFIG } from "./config";
import { fetchSchema, validateSchema } from "./fetch-schema";
import { analyzeSchema } from "./analyze-schema";
import { generateAllTypes } from "./generate-types";
import { generateAllClients } from "./generate-table-classes";

/**
 * Generate package.json for generated client
 */
function generatePackageJson(): void {
  const pkg = {
    name: "@generated/hasura-client",
    version: "1.0.0",
    private: true,
    type: "module",
    main: "index.ts",
    types: "index.ts",
    dependencies: {
      "graphql-request": "^7.4.0",
    },
  };

  fs.writeFileSync(
    path.join(GENERATOR_CONFIG.outputDir, "package.json"),
    JSON.stringify(pkg, null, 2)
  );
}

/**
 * Generate root index.ts
 */
function generateIndexFile(): void {
  const content = `// AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY

export * from './client';
export * from './types/tables';
`;

  fs.writeFileSync(path.join(GENERATOR_CONFIG.outputDir, "index.ts"), content);
}

/**
 * Generator entry point
 */
export async function generate(): Promise<void> {
  console.log("\n🚀 Starting Hasura client generation\n");

  if (fs.existsSync(GENERATOR_CONFIG.outputDir)) {
    fs.rmSync(GENERATOR_CONFIG.outputDir, { recursive: true });
  }

  fs.mkdirSync(GENERATOR_CONFIG.outputDir, { recursive: true });

  try {
    console.log("1️⃣ Fetching schema...");
    const schema = await fetchSchema();
    validateSchema(schema);

    console.log("2️⃣ Analyzing schema...");
    const metadata = analyzeSchema(schema);

    console.log("3️⃣ Generating types...");
    await generateAllTypes(metadata);

    console.log("4️⃣ Generating client...");
    await generateAllClients(metadata);

    console.log("5️⃣ Generating package files...");
    generatePackageJson();
    generateIndexFile();

    console.log("\nCode generation completed successfully");
    console.log(`Output: ${GENERATOR_CONFIG.outputDir}\n`);
  } catch (err) {
    console.error("\nCode generation failed\n");
    console.error(err);
    process.exit(1);
  }
}

/**
 * Allow CLI usage: `node generate.ts`
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  generate();
}
