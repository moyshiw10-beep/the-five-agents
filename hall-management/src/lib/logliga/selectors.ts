/**
 * הגדרות ה-selectors מול אתר לוגליג (loglig.com).
 *
 * מה שכן אומת: קיבלנו מהמשתמש כתובת אמיתית מהאתר -
 * https://loglig.com/Unions/Edit/241?roleType=unionmgr&seasonId=1572
 * זה מאשר את הדומיין (loglig.com) ומראה סגנון ניתוב של ASP.NET MVC
 * (Controller/Action/id בנתיב, עם roleType ו-seasonId כפרמטרי query).
 *
 * מה שלא אומת: לא הצלחנו לגשת בפועל לאתר מתוך סביבת הפיתוח הזו כדי לבדוק
 * את ה-HTML האמיתי - יש חסימת רשת (egress policy) שחוסמת חיבור ל-loglig.com
 * מהסביבה הזו. לכן ה-selectors וה-path המדויקים למטה (מלבד הדומיין) הם עדיין
 * שלד סביר שצריך להתאים לפני שימוש אמיתי.
 *
 * איך להשלים את ההתאמה (אחת מהשתיים):
 * 1. להריץ את הפרויקט מסביבה עם גישה לאינטרנט הרגילה, להתחבר ללוגליג
 *    בדפדפן, וללחוץ ימני על שדה ההתחברות ועל שורת משחק בלו"ח -> Inspect,
 *    ולהעתיק את ה-id/name/class המתאימים לכאן.
 * 2. או: לשמור את קוד המקור (View Source / Ctrl+U) של דף ההתחברות ושל דף
 *    הלו"ח של אולם, ולהעביר את הטקסט כדי שנעדכן את הקובץ הזה בהתאם.
 */
export const logligaSelectors = {
  login: {
    // עמוד ההתחברות, יחסי ל-LOGLIGA_BASE_URL. "/Account/Login" הוא ניחוש
    // סביר לאפליקציית ASP.NET MVC (ברירת המחדל של ASP.NET Identity), אך
    // טרם אומת מול האתר עצמו.
    path: "/Account/Login",
    usernameInput: 'input[name="username"], input[name="Email"], input[type="email"]',
    passwordInput: 'input[name="password"], input[name="Password"], input[type="password"]',
    submitButton: 'button[type="submit"], input[type="submit"]',
    // selector שמופיע רק אחרי התחברות מוצלחת, לוודא שה-login עבד
    successIndicator: '[data-testid="user-menu"], .user-menu, nav',
  },
  schedule: {
    // תבנית הנתיב לדף הלו"ז של אולם - {venueId} יוחלף במזהה האולם.
    // עדיין לא אומת - ראו הערה למעלה. סביר שהשם האמיתי של ה-controller
    // שונה (למשל Venues/Halls/Games), בדומה לדוגמה שנמסרה (Unions/Edit/{id}).
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
