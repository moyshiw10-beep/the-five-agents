import { createHash } from "crypto";
import { readFile } from "fs/promises";

/**
 * No operational extract has been identified.
 * The hall thread attached application source only:
 * - hall-management-patch_b517.txt
 * - hall-management-source_1dbf.zip
 * A slots workbook was mentioned separately and was not established as this import.
 */
export const APPROVED_OPERATIONAL_SOURCES: ReadonlyArray<{ filename: string; sha256: string }> = [];

export const TARGET_IMPORT_TABLES = [
  "User (idempotency: email, unique)",
  "LeagueBooking (idempotency: logligaGameId, unique)",
  "Team (no unique business key — import must stop until one is agreed)",
  "Hall (no unique business key — import must stop until one is agreed)",
  "HallUnit (no unique business key — import must stop until one is agreed)",
  "Player (no unique business key — import must stop until one is agreed)",
  "TrainingBooking (no unique business key — import must stop until one is agreed)",
] as const;

export async function evaluateImportRequest(sourcePath?: string): Promise<{ ok: false; reason: string }> {
  if (APPROVED_OPERATIONAL_SOURCES.length === 0) {
    return {
      ok: false,
      reason:
        "No operational source file is approved. Refusing to read or write records. " +
        "Required before any import: exact filename, sha256, and a column mapping onto the target tables. " +
        TARGET_IMPORT_TABLES.join("; "),
    };
  }
  if (!sourcePath) {
    return { ok: false, reason: "IMPORT_SOURCE_PATH is required." };
  }
  const bytes = await readFile(sourcePath);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const approved = APPROVED_OPERATIONAL_SOURCES.some(
    (source) => source.filename === sourcePath.split(/[\\/]/).pop() && source.sha256 === sha256
  );
  if (!approved) {
    return { ok: false, reason: `Source sha256 ${sha256} is not on the approved list. No records written.` };
  }
  return { ok: false, reason: "Approved source matched, but no column mapping is implemented. No records written." };
}
