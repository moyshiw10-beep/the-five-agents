import type { LogligaConnector, LogligaGame } from "./types";

/**
 * מחזיר משחקי דמו קבועים - לפיתוח ובדיקות בלי חיבור אמיתי ללוגליג.
 * מופעל כאשר LOGLIGA_USE_MOCK=true ב-.env.
 */
export class MockLogligaConnector implements LogligaConnector {
  async fetchVenueSchedule(venueId: string, from: Date, to: Date): Promise<LogligaGame[]> {
    const games: LogligaGame[] = [];
    const cursor = new Date(from);
    let i = 0;
    while (cursor <= to) {
      // משחק ליגה כל יום שלישי וחמישי, לדוגמה
      if (cursor.getDay() === 2 || cursor.getDay() === 4) {
        games.push({
          gameId: `mock-${venueId}-${cursor.toISOString().slice(0, 10)}`,
          venueId,
          courtLabel: "מגרש 1",
          date: new Date(cursor),
          startTime: "18:00",
          endTime: "20:00",
          homeTeamName: `קבוצה ${(i % 5) + 1}`,
          awayTeamName: `קבוצה ${((i + 2) % 5) + 1}`,
          competitionName: "ליגת דמו",
        });
        i++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return games;
  }
}
