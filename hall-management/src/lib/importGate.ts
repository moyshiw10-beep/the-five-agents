import { readNovember2026Workbook, NOVEMBER_2026_SOURCE } from "./november2026Workbook";

export async function evaluateImportRequest(sourcePath?: string): Promise<{ ok: false; reason: string }> {
  if (!sourcePath) {
    return {
      ok: false,
      reason: `IMPORT_SOURCE_PATH is required. The only approved file is ${NOVEMBER_2026_SOURCE.filename}. No records written.`,
    };
  }
  const plan = await readNovember2026Workbook(sourcePath);
  return {
    ok: false,
    reason:
      `Dry run only. ${plan.counts.total} base units: free ${plan.counts.free}, reserved ${plan.counts.reserved}, needs clarification ${plan.counts.needsClarification}. ` +
      `Requests ${plan.requests.total}: in-base ${plan.requests.matchesBase}, outside-base ${plan.requests.outsideBase} (not added). ` +
      `Halls ${plan.halls.length}. Clarification rows are not written. Commit is disabled until a host is confirmed.`,
  };
}
