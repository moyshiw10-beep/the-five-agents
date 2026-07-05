# league-crm — אפליקציית CRM לניהול ליגת כדורסל

## Overview
פרויקט קוד עצמאי חדש (לא קשור לצוות התוכן/יעל/יובל/חן) בתת-תיקייה `league-crm/` — אפליקציית PWA (Next.js 16, App Router) שהמשתמש ביקש לניהול הליגה שהוא מריץ: פניות/לידים שמתעניינים להצטרף (שם, טלפון, סטטוס, תזכורות מעקב), והיסטוריית שחקנים/קבוצות (כולל סטטוס פעיל/עבר). המשתמש ביקש "להוסיף סוכן לצוות" אבל בפועל זו תוכנה אמיתית שראובן (Claude Code) בנה ישירות — לא persona-agent נוסף תחת `.claude/agents/`.

**Stack:** Next.js 16.2.10 (App Router, Turbopack) + TypeScript + Tailwind v4 + Prisma 7.8.0 (עם driver adapters — חובה ב-Prisma 7, אין יותר חיבור אוטומטי מ-schema.prisma) + zod + bcryptjs + jose. Auth: סיסמה משותפת יחידה (לא משתמשים מרובים), session חתום ב-JWT (`jose`) בעוגיית HTTP-only, נבדק גם ב-`proxy.ts` (שם חדש ל-middleware.ts ב-Next 16) וגם ב-`requireAuth()` בתוך כל Server Action (הגנה כפולה, כפי שמומלץ בתיעוד הרשמי).

**מסד נתונים:** מקומי לפיתוח — SQLite (`league-crm/dev.db`, gitignored) דרך `@prisma/adapter-better-sqlite3`. שדות סטטוס (LeadStatus/PlayerStatus/TeamStatus) הם `String` רגיל (לא Prisma enum) כדי לשמור פורטביליות מלאה בין SQLite ל-PostgreSQL — ולידציה מתבצעת ב-Zod (`app/lib/definitions.ts`). לפרודקשן: להתקין `@prisma/adapter-pg`, לשנות את `provider` ב-`prisma/schema.prisma` ל-`"postgresql"`, ולעדכן את ה-adapter ב-`app/lib/db.ts`.

**מבנה עמודים:** login, דשבורד (תזכורות מעקב + מונים), leads (רשימה+סינון+טופס), players (רשימה+סינון+טופס עם שיוך קבוצה), teams (רשימה+סינון+טופס+roster). PWA: `app/manifest.ts` + אייקונים שנוצרו עם `sharp` (כבר מותקן כתלות transitive של Next.js) בסקריפט `scripts/generate-icons.mjs`.

**תצורת סביבה:** `.claude/launch.json` כולל קונפיגורציה `league-crm-dev` (npm --prefix league-crm run dev, פורט 3000) לצורך תצוגה מקדימה. `.gitignore` בשורש עודכן לכלול את כל נתיבי league-crm הרלוונטיים (node_modules, .next, generated prisma client, .env, קבצי db).

## Open Questions
- **המשתמש טרם סיפק פרטי חשבון Supabase** (connection strings) — נדרש כדי לעבור ל-production DB אמיתי. עד אז האפליקציה פועלת מול SQLite מקומי בלבד ואינה נגישה מהאינטרנט.
- פריסה בפועל (Vercel) טרם בוצעה — דורשת גם חשבון Vercel וחיבור ל-GitHub repo.
- סיסמת האפליקציה הזמנית לצורך בדיקות היא `league2026` (hash שמור ב-`.env` תחת `APP_PASSWORD_HASH`) — **חובה להחליף לפני שימוש אמיתי/פריסה**.
- שם החברה/הפרויקט לא הוגדר במיוחד עבור ה-CRM (לא רלוונטי כרגע — זהו כלי פנימי, לא מוצר ללקוחות).
- לא בוצעה עדיין בדיקת "הוספה למסך הבית" (PWA installability) על מכשיר אמיתי — רק אומת ש-`/manifest.webmanifest` מחזיר תוכן תקין.

## Session Log

### 2026-07-05 — בניית ה-MVP המלא ואימות end-to-end [shipped]
- **What was done:** המשתמש ביקש CRM פשוט לניהול פניות/שחקנים/קבוצות לליגה שלו, נגיש מהנייד. אחרי שאלות הבהרה (PWA מול native, ענן מול מקומי, אילו נתונים, ייבוא נתונים) ועיצוב טכני (Plan agent), נבנה MVP מלא: scaffold עם `create-next-app`, סכימת Prisma (Lead/Team/Player), auth מבוסס סיסמה יחידה + JWT + proxy.ts + requireAuth בכל Server Action, כל עמודי ה-CRUD (דשבורד, לידים, שחקנים, קבוצות), PWA manifest + אייקונים. אומת end-to-end דרך preview tools: login → יצירת ליד עם תזכורת מעקב (הופיע נכון בדשבורד עם תיוג "באיחור"/"היום") → יצירת קבוצה → יצירת שחקן משויך לקבוצה (הופיע ב-roster) → שינוי סטטוס שחקן ל-PAST ואימות שהסינון ACTIVE/PAST עובד נכון. אין שגיאות קונסול, אין בקשות רשת כושלות.
- **Decisions:** נתקלנו בשתי בעיות טכניות משמעותיות שדרשו החלטה: (1) `npx prisma dev` (שרת Postgres מקומי מנוהל ע"י Prisma) סירב חיבורים בעקביות (P1017) בסביבה הזו — הוחלט לוותר עליו ולהשתמש ב-SQLite מקומי במקום, עם שדות String בלבד (לא enums) לפורטביליות; (2) גילינו ש-Prisma 7 דורש driver adapter מפורש (`@prisma/adapter-better-sqlite3` מקומית, `@prisma/adapter-pg` בפרודקשן) — אין יותר "התחברות אוטומטית" מה-schema. גם גילינו ש-Next.js 16 שינה את `middleware.ts` ל-`proxy.ts` (עם פונקציה בשם `proxy` לא `middleware`) ואת ה-Prisma client generator ליצור קובץ ללא `index.ts` (import מ-`/client` ישירות) — מידע שנשאב מ-`node_modules/next/dist/docs/` בעצמו, לפי הוראת `AGENTS.md` שנוצרה אוטומטית ע"י `create-next-app` להזהיר מפני ידע מיושן.
- **Notes / Caveats:** בדיקות עם `preview_click` על כפתורי submit היו לא אמינות (התנהגות לא עקבית — לפעמים לא הפעיל דבר, לפעמים גרם ל-GET רגיל במקום POST מנוהל ע"י React) — עברנו לבדיקה ישירה דרך `preview_eval` + `form.requestSubmit()` שהוכחה אמינה לחלוטין. גם `preview_screenshot` נכשל בטיימאאוט (30s) לאורך כל הסשן, כולל בתחילת השיחה על תוכן HTML סטטי — ככל הנראה מגבלת סביבה, לא קשור לקוד. השתמשנו ב-`preview_snapshot` (accessibility tree) ו-`preview_inspect` (CSS) במקום, ואלה עבדו באמינות מלאה.
- **Related:** none (first entry on this topic)
