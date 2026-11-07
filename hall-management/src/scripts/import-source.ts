import { readNovember2026Workbook } from "../lib/november2026Workbook";

async function main() {
  const sourcePath = process.env.IMPORT_SOURCE_PATH;
  if (!sourcePath) {
    console.error("IMPORT_SOURCE_PATH is required. No records written.");
    process.exit(2);
  }
  if (process.env.IMPORT_COMMIT === "yes") {
    console.error("Commit is disabled. The hosting target is not confirmed. No records written.");
    process.exit(2);
  }
  const plan = await readNovember2026Workbook(sourcePath);
  console.log(
    JSON.stringify({
      mode: "dry-run",
      written: 0,
      total: plan.counts.total,
      free: plan.counts.free,
      reserved: plan.counts.reserved,
      needsClarification: plan.counts.needsClarification,
      outsideBaseRequests: plan.requests.outsideBase,
      matchingBaseRequest: plan.requests.matchesBase,
      halls: plan.halls.length,
      reservedContactIncomplete: plan.slots.some((slot) => slot.slotClass === "reserved" && slot.contactIncomplete),
    })
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "import failed");
  process.exit(2);
});
