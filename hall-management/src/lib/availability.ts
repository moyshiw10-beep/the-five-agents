import { prisma } from "@/lib/prisma";

/** רשת השעות הקבועה לשריון אימונים - שעה עגולה בכל פעם */
export const DAILY_SLOTS: { startTime: string; endTime: string }[] = Array.from(
  { length: 15 },
  (_, i) => {
    const startHour = 8 + i; // 08:00 עד 22:00
    return {
      startTime: `${String(startHour).padStart(2, "0")}:00`,
      endTime: `${String(startHour + 1).padStart(2, "0")}:00`,
    };
  }
);

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function slotsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type SlotStatus =
  | { status: "free" }
  | { status: "league"; label: string }
  | { status: "training"; label: string };

export interface UnitDayAvailability {
  hallUnitId: string;
  hallUnitName: string;
  slots: (SlotStatus & { startTime: string; endTime: string })[];
}

/** מחזיר את זמינות היחידות של אולם ביום נתון, לפי רשת השעות הקבועה */
export async function getHallDayAvailability(hallId: string, date: Date): Promise<UnitDayAvailability[]> {
  const day = startOfDay(date);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  const units = await prisma.hallUnit.findMany({
    where: { hallId },
    include: {
      leagueBookings: { where: { date: { gte: day, lt: nextDay } } },
      trainingBookings: {
        where: { date: { gte: day, lt: nextDay }, status: "CONFIRMED" },
        include: { team: true },
      },
    },
  });

  return units.map((unit) => ({
    hallUnitId: unit.id,
    hallUnitName: unit.name,
    slots: DAILY_SLOTS.map((slot) => {
      const league = unit.leagueBookings.find((b) =>
        slotsOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime)
      );
      if (league) {
        return {
          ...slot,
          status: "league" as const,
          label: `${league.homeTeamName ?? ""} נגד ${league.awayTeamName ?? ""}`.trim(),
        };
      }
      const training = unit.trainingBookings.find((b) =>
        slotsOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime)
      );
      if (training) {
        return { ...slot, status: "training" as const, label: training.team?.name ?? "שריון" };
      }
      return { ...slot, status: "free" as const };
    }),
  }));
}

/** בדיקה האם יחידת אולם פנויה בטווח שעות נתון ביום מסוים (ללא התנגשות עם ליגה/שריון אחר) */
export async function isUnitSlotFree(
  hallUnitId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeTrainingBookingId?: string
): Promise<boolean> {
  const day = startOfDay(date);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  const [league, training] = await Promise.all([
    prisma.leagueBooking.findMany({ where: { hallUnitId, date: { gte: day, lt: nextDay } } }),
    prisma.trainingBooking.findMany({
      where: {
        hallUnitId,
        date: { gte: day, lt: nextDay },
        status: "CONFIRMED",
        id: excludeTrainingBookingId ? { not: excludeTrainingBookingId } : undefined,
      },
    }),
  ]);

  const busy = [...league, ...training];
  return !busy.some((b) => slotsOverlap(startTime, endTime, b.startTime, b.endTime));
}
