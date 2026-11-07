"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { isUnitSlotFree } from "@/lib/availability";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookingSchema = z.object({
  hallUnitId: z.string(),
  date: z.string(), // yyyy-mm-dd
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
});

export async function createTrainingBooking(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "TEAM" && session.user.role !== "ADMIN" && session.user.role !== "HALL_MANAGER") {
    throw new Error("אין הרשאה לשריין אימון");
  }
  const parsed = bookingSchema.parse({
    hallUnitId: formData.get("hallUnitId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    notes: formData.get("notes") || undefined,
  });

  if (session.user.role === "TEAM" && !session.user.teamId) {
    throw new Error("המשתמש אינו משויך לקבוצה - לא ניתן לבצע שריון");
  }

  if (session.user.role === "HALL_MANAGER") {
    const managedUnit = await prisma.hallUnit.findFirst({
      where: { id: parsed.hallUnitId, hall: { managers: { some: { id: session.user.id } } } },
    });
    if (!managedUnit) throw new Error("אין הרשאה לשריין ביחידה זו");
  }

  const date = new Date(`${parsed.date}T00:00:00`);

  const free = await isUnitSlotFree(parsed.hallUnitId, date, parsed.startTime, parsed.endTime);
  if (!free) {
    throw new Error("היחידה כבר תפוסה בשעה זו (משחק ליגה או שריון קיים)");
  }

  await prisma.trainingBooking.create({
    data: {
      hallUnitId: parsed.hallUnitId,
      date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      notes: parsed.notes,
      teamId: session.user.role === "TEAM" ? session.user.teamId : formData.get("teamId")?.toString() || null,
      createdById: session.user.id,
      source: session.user.role === "TEAM" ? "TRAINING" : "MANUAL",
    },
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/book");
}

export async function cancelTrainingBooking(bookingId: string) {
  const session = await requireSession();
  const booking = await prisma.trainingBooking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("שריון לא נמצא");

  const canCancel =
    session.user.role === "ADMIN" ||
    session.user.role === "HALL_MANAGER" ||
    booking.createdById === session.user.id ||
    (session.user.role === "TEAM" && booking.teamId === session.user.teamId);

  if (!canCancel) throw new Error("אין הרשאה לבטל שריון זה");

  await prisma.trainingBooking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  revalidatePath("/dashboard/bookings");
}
