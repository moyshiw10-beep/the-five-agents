import { evaluateImportRequest } from "../lib/importGate";

async function main() {
  const result = await evaluateImportRequest(process.env.IMPORT_SOURCE_PATH);
  console.error(result.reason);
  process.exit(2);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "import failed";
  console.error(message);
  process.exit(2);
});
