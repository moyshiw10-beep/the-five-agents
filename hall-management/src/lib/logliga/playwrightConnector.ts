import { chromium, type Browser } from "playwright";
import { logligaSelectors } from "./selectors";
import type { LogligaConnector, LogligaGame } from "./types";

/**
 * מתחבר ללוגליג עם משתמש/סיסמה (session מבוסס login) ושואב את לוח המשחקים
 * לכל אולם. מיושם עם Playwright כי ללוגליג אין API ציבורי ידוע - הגישה
 * היחידה שתוארה היא כניסה עם חשבון משתמש רגיל.
 *
 * לפני שימוש בסביבת אמת יש לוודא שה-selectors ב-./selectors.ts תואמים
 * בפועל למבנה ה-HTML של האתר (ראו הערה שם).
 */
export class PlaywrightLogligaConnector implements LogligaConnector {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(opts?: { baseUrl?: string; username?: string; password?: string }) {
    this.baseUrl = opts?.baseUrl ?? process.env.LOGLIGA_BASE_URL ?? "";
    this.username = opts?.username ?? process.env.LOGLIGA_USERNAME ?? "";
    this.password = opts?.password ?? process.env.LOGLIGA_PASSWORD ?? "";

    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error(
        "חסרים פרטי חיבור ללוגליג. יש להגדיר LOGLIGA_BASE_URL, LOGLIGA_USERNAME, LOGLIGA_PASSWORD בקובץ .env"
      );
    }
  }

  async fetchVenueSchedule(venueId: string, from: Date, to: Date): Promise<LogligaGame[]> {
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      await this.login(page);

      const schedulePath = logligaSelectors.schedule.pathTemplate.replace("{venueId}", venueId);
      await page.goto(new URL(schedulePath, this.baseUrl).toString(), { waitUntil: "networkidle" });

      const rows = await page.$$(logligaSelectors.schedule.gameRow);
      const games: LogligaGame[] = [];

      for (const row of rows) {
        const game = await this.extractGame(row, venueId);
        if (game && game.date >= from && game.date <= to) {
          games.push(game);
        }
      }

      return games;
    } finally {
      await browser?.close();
    }
  }

  private async login(page: import("playwright").Page) {
    const s = logligaSelectors.login;
    await page.goto(new URL(s.path, this.baseUrl).toString(), { waitUntil: "networkidle" });
    await page.fill(s.usernameInput, this.username);
    await page.fill(s.passwordInput, this.password);
    await Promise.all([page.click(s.submitButton), page.waitForLoadState("networkidle")]);

    const loggedIn = await page.$(s.successIndicator);
    if (!loggedIn) {
      throw new Error("ההתחברות ללוגליג נכשלה - יש לוודא שם משתמש/סיסמה, ושה-selectors בעדכניים לאתר");
    }
  }

  private async extractGame(
    row: import("playwright").ElementHandle,
    venueId: string
  ): Promise<LogligaGame | null> {
    const s = logligaSelectors.schedule;

    const gameId =
      (await row.getAttribute(s.gameId.attr)) ??
      (await row.evaluate((el) => (el as Element).getAttribute("id")));
    const dateText = await textOf(row, s.date);
    const startTime = await textOf(row, s.startTime);
    const endTime = await textOf(row, s.endTime);
    const homeTeamName = await textOf(row, s.homeTeam);
    const awayTeamName = await textOf(row, s.awayTeam);
    const competitionName = await textOf(row, s.competition);
    const courtLabel = await textOf(row, s.court);

    if (!gameId || !dateText || !startTime || !endTime) return null;

    const date = parseIsraeliDate(dateText);
    if (!date) return null;

    return {
      gameId,
      venueId,
      courtLabel: courtLabel || undefined,
      date,
      startTime: normalizeTime(startTime),
      endTime: normalizeTime(endTime),
      homeTeamName: homeTeamName ?? "",
      awayTeamName: awayTeamName ?? "",
      competitionName: competitionName || undefined,
    };
  }
}

async function textOf(row: import("playwright").ElementHandle, selector: string) {
  const el = await row.$(selector);
  if (!el) return null;
  const text = await el.textContent();
  return text?.trim() || null;
}

/** לוגליג בדרך כלל מציג תאריכים בפורמט dd/mm/yyyy */
function parseIsraeliDate(text: string): Date | null {
  const match = text.match(/(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
  if (!match) return null;
  const [, d, m, y] = match;
  const year = y.length === 2 ? Number(`20${y}`) : Number(y);
  return new Date(year, Number(m) - 1, Number(d));
}

function normalizeTime(text: string): string {
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (!match) return text.trim();
  const [, h, m] = match;
  return `${h.padStart(2, "0")}:${m}`;
}
