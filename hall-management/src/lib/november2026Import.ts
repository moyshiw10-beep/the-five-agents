import type { Prisma } from "@prisma/client";
import type { WorkbookPlan } from "./november2026Workbook";

const UNIT_LABEL = "יחידת 90 דק׳";

/**
 * Writes only the single reserved base slot.
 * Free rows stay absent. Clarification rows are not stored: BookingStatus cannot
 * represent טעון בירור without turning it into confirmed or cancelled.
 * Outside-base requests are not written.
 */
export async function applyReservedNovemberSlot(
  db: Prisma.TransactionClient,
  plan: WorkbookPlan,
  createdById: string
): Promise<{ written: number }> {
  const reserved = plan.slots.filter((slot) => slot.slotClass === "reserved");
  const importKey = reserved.length === 1 ? reserved[0].importKey : null;
  if (!importKey) {
    throw new Error("Reserved slot is ambiguous. Nothing written.");
  }
  const slot = reserved[0];

  const hall = await db.hall.upsert({
    where: { id: `import-hall:${slot.hall}` },
    update: { name: slot.hall },
    create: { id: `import-hall:${slot.hall}`, name: slot.hall },
  });
  const unit = await db.hallUnit.upsert({
    where: { id: `import-unit:${slot.hall}` },
    update: { name: UNIT_LABEL, hallId: hall.id },
    create: { id: `import-unit:${slot.hall}`, name: UNIT_LABEL, hallId: hall.id },
  });

  await db.trainingBooking.upsert({
    where: { importKey },
    update: {
      hallUnitId: unit.id,
      date: new Date(`${slot.date}T00:00:00.000Z`),
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "CONFIRMED",
      source: "MANUAL",
    },
    create: {
      hallUnitId: unit.id,
      date: new Date(`${slot.date}T00:00:00.000Z`),
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "CONFIRMED",
      source: "MANUAL",
      importKey,
      createdById,
      notes: slot.contactIncomplete
        ? "Workbook contact cell is marked incomplete. No team record was created."
        : "Imported reserved slot.",
    },
  });
  return { written: 1 };
}
