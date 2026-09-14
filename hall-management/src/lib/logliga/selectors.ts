/**
 * הגדרות ה-selectors מול אתר לוגליג.
 *
 * חשוב: הקוד הזה נכתב בלי גישה לאתר לוגליג האמיתי (לא נמסרה כתובת/הרשאות),
 * ולכן ה-selectors כאן הם שלד סביר שצריך להתאים לאחר בדיקה חד-פעמית של האתר
 * בדפדפן (F12 -> Elements). כל מה שצריך לעדכן מרוכז בקובץ הזה ובכתובת הבסיס
 * ב-.env (LOGLIGA_BASE_URL) - אין צורך לגעת בשאר הקוד.
 *
 * איך למצוא selector נכון: לפתוח את דף ההתחברות/הלו"ז באתר לוגליג, ללחוץ
 * ימני על השדה הרלוונטי -> Inspect, ולהעתיק את ה-id/name/class המתאים.
 */
export const logligaSelectors = {
  login: {
    // עמוד ההתחברות, יחסי ל-LOGLIGA_BASE_URL
    path: "/login",
    usernameInput: 'input[name="username"], input[type="email"]',
    passwordInput: 'input[name="password"], input[type="password"]',
    submitButton: 'button[type="submit"]',
    // selector שמופיע רק אחרי התחברות מוצלחת, לוודא שה-login עבד
    successIndicator: '[data-testid="user-menu"], .user-menu, nav',
  },
  schedule: {
    // תבנית הנתיב לדף הלו"ז של אולם - {venueId} יוחלף במזהה האולם
    pathTemplate: "/venues/{venueId}/schedule",
    gameRow: ".game-row, tr.game",
    gameId: { attr: "data-game-id" },
    court: ".court-label",
    date: ".game-date",
    startTime: ".start-time",
    endTime: ".end-time",
    homeTeam: ".home-team",
    awayTeam: ".away-team",
    competition: ".competition-name",
  },
};
