import { prisma } from "@/lib/prisma";
import type { LogligaConnector, LogligaGame } from "./types";
import { PlaywrightLogligaConnector } from "./playwrightConnector";
import { MockLogligaConnector } from "./mockConnector";

function getConnector(): LogligaConnector {
  if (process.env.LOGLIGA_USE_MOCK === "true") {
    return new MockLogligaConnector();
  }
  return new PlaywrightLogligaConnector();
}

/**
 * מסנכרן משחקי ליגה מלוגליג לכל האולמות שהוגדר להם logligaVenueId.
 * ממופה לפי courtLabel אל יחידת האולם (HallUnit.name) - אם אין התאמה
 * מדויקת, המשחק משויך ליחידה הראשונה של האולם כברירת מחדל.
 */
export async function syncLogligaSchedule(daysAhead = 30): Promise<{
  gamesFound: number;
  hallsProcessed: number;
  errors: string[];
}> {
  const log = await prisma.logligaSyncLog.create({ data: {} });
  const errors: string[] = [];
  let gamesFound = 0;
  let hallsProcessed = 0;

  try {
    const connector = getConnector();
    const halls = await prisma.hall.findMany({
      where: { logligaVenueId: { not: null } },
      include: { units: true },
    });

    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + daysAhead);

    for (const hall of halls) {
      if (!hall.logligaVenueId || hall.units.length === 0) continue;
      try {
        const games = await connector.fetchVenueSchedule(hall.logligaVenueId, from, to);
        for (const game of games) {
          await upsertLeagueBooking(game, hall.units);
          gamesFound++;
        }
        hallsProcessed++;
      } catch (err) {
        errors.push(`${hall.name}: ${(err as Error).message}`);
      }
    }

    await prisma.logligaSyncLog.update({
      where: { id: log.id },
      data: {
        finishedAt: new Date(),
        success: errors.length === 0,
        gamesFound,
        errorMessage: errors.length ? errors.join(" | ") : null,
      },
    });
  } catch (err) {
    await prisma.logligaSyncLog.update({
      where: { id: log.id },
      data: { finishedAt: new Date(), success: false, errorMessage: (err as Error).message },
    });
    throw err;
  }

  return { gamesFound, hallsProcessed, errors };
}

async function upsertLeagueBooking(
  game: LogligaGame,
  units: { id: string; name: string }[]
) {
  const matchedUnit =
    units.find((u) => game.courtLabel && u.name.trim() === game.courtLabel?.trim()) ?? units[0];

  await prisma.leagueBooking.upsert({
    where: { logligaGameId: game.gameId },
    create: {
      logligaGameId: game.gameId,
      hallUnitId: matchedUnit.id,
      date: game.date,
      startTime: game.startTime,
      endTime: game.endTime,
      homeTeamName: game.homeTeamName,
      awayTeamName: game.awayTeamName,
      competitionName: game.competitionName,
    },
    update: {
      hallUnitId: matchedUnit.id,
      date: game.date,
      startTime: game.startTime,
      endTime: game.endTime,
      homeTeamName: game.homeTeamName,
      awayTeamName: game.awayTeamName,
      competitionName: game.competitionName,
      syncedAt: new Date(),
    },
  });
}
