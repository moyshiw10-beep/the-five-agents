# מערכת ניהול אולמות ואימונים

מערכת Next.js לניהול אולמות ספורט, שיבוצי משחקי ליגה (נמשכים ממערכת **לוגליג**),
ושריון יחידות אולם פנויות לאימוני קבוצות/שחקנים. כוללת שליחת דוחות אוטומטיים
במייל: דוח שימוש שוטף למנהלי אולמות, ודוח חודשי מרוכז למנהלת חשבונות.

## סטאק טכנולוגי

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **PostgreSQL** + **Prisma** ORM
- **NextAuth** (Credentials) לניהול משתמשים ותפקידים
- **Playwright** לחיבור ללוגליג (login-based, אין API ציבורי ידוע)
- **Nodemailer** לשליחת דוחות במייל

## תפקידים במערכת

| תפקיד | הרשאות |
|---|---|
| `ADMIN` (מנהל מערכת) | ניהול אולמות/יחידות/משתמשים/קבוצות, הפעלת סנכרון לוגליג, הפעלת דוחות |
| `HALL_MANAGER` (מנהל אולם) | צפייה בלוח השיבוצים של האולמות שלו, קבלת דוח שימוש במייל |
| `ACCOUNTANT` (מנהלת חשבונות) | קבלת דוח חודשי מרוכז על כלל האולמות |
| `TEAM` (קבוצה/שחקן) | שריון יחידות פנויות לאימון בימים שאין בהם משחקי ליגה, וניהול השריונים שלו |

## התקנה מקומית

```bash
cd hall-management
npm install

cp .env.example .env
# ערכו את .env: DATABASE_URL, NEXTAUTH_SECRET וכו'

npx prisma migrate dev --name init
npm run prisma:seed   # יוצר משתמשי דמו (ראו פלט הפקודה לפרטי התחברות)

npm run dev
```

האתר יעלה בכתובת http://localhost:3000. משתמשי הדמו שנוצרים ע"י `prisma:seed`
מסומנים בפלט הפקודה, כולם עם הסיסמה `password123`.

## חיבור ללוגליג

לא סופקה גישת API ללוגליג, ולכן החיבור ממומש כניסת משתמש רגילה (login)
ושליפת לוח המשחקים מהדף באמצעות Playwright:

- הקוד נמצא ב-`src/lib/logliga/`.
- **חשוב:** לפני חיבור אמיתי יש לעדכן את `src/lib/logliga/selectors.ts` כך
  שיתאים למבנה ה-HTML בפועל של אתר לוגליג (יש הוראות מפורטות בתוך הקובץ –
  צריך לפתוח את האתר בדפדפן, להיכנס עם Inspect, ולהעתיק selectors נכונים
  לטופס ההתחברות ולטבלת הלו"ז).
- כדי לפתח/לבדוק את שאר המערכת בלי חשבון לוגליג אמיתי, הגדירו
  `LOGLIGA_USE_MOCK=true` ב-`.env` — המערכת תשתמש בנתוני דמו.
- לחיבור אמיתי: הגדירו ב-`.env` את `LOGLIGA_BASE_URL`, `LOGLIGA_USERNAME`,
  `LOGLIGA_PASSWORD`, והסירו/הפכו ל-`false` את `LOGLIGA_USE_MOCK`.
- בכל אולם, יש להגדיר "מזהה אולם בלוגליג" (עמוד ניהול אולמות) כדי שהסנכרון
  ידע אילו משחקים שייכים לאיזה אולם. משחקים ממופים ליחידת אולם (מגרש) לפי
  התאמת שם; אם אין התאמה הם משויכים ליחידה הראשונה של האולם.
- הפעלת סנכרון ידנית: כפתור "סנכרון עכשיו" בעמוד `/dashboard/logliga`
  (למנהל מערכת בלבד).
- הפעלה מתוזמנת: `npm run logliga:sync`, או קריאת `POST /api/logliga/sync`
  עם `Authorization: Bearer <CRON_SECRET>` משירות cron חיצוני (ראו "הרצה
  מתוזמנת" למטה).

## דוחות ושליחת מייל

- דוח שימוש באולם: מסכם שעות/משחקי ליגה ושעות/שריוני אימון ליחידה, לתקופה
  נתונה (ברירת מחדל: 7 הימים האחרונים), ונשלח לכל מנהלי האולם + אימייל
  ייעודי אם הוגדר לאולם.
- דוח חודשי: מסכם את השימוש בכלל האולמות ונשלח לכל המשתמשים בתפקיד
  "מנהלת חשבונות".
- דורש הגדרת פרטי SMTP ב-`.env` (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` וכו').
- הפעלה ידנית: עמוד `/dashboard/reports` (למנהל מערכת).
- הפעלה מתוזמנת: `npm run reports:weekly` / `npm run reports:monthly`, או
  קריאת `POST /api/reports/hall-usage` / `POST /api/reports/monthly` עם
  `Authorization: Bearer <CRON_SECRET>`.

## הרצה מתוזמנת (cron)

שלוש המשימות התקופתיות - סנכרון לוגליג, דוח שימוש שבועי, ודוח חודשי -
חשופות גם כ-API routes המקבלות הפעלה חיצונית עם `CRON_SECRET`, וגם
כסקריפטים (`npm run logliga:sync`, `npm run reports:weekly`,
`npm run reports:monthly`) שאפשר להריץ מ-cron רגיל בשרת, או כ-Scheduled
Function בפלטפורמת האירוח (למשל Vercel Cron / Render Cron Jobs).

דוגמת crontab (על שרת שמריץ את הפרויקט):

```
# סנכרון לוגליג כל שעתיים
0 */2 * * * cd /path/to/hall-management && npm run logliga:sync

# דוח שימוש שבועי - כל יום ראשון ב-07:00
0 7 * * 0 cd /path/to/hall-management && npm run reports:weekly

# דוח חודשי - ה-1 לחודש ב-07:00
0 7 1 * * cd /path/to/hall-management && npm run reports:monthly
```

## מבנה הפרויקט

```
prisma/schema.prisma        מודל הנתונים (אולמות, יחידות, שיבוצים, משתמשים)
prisma/seed.ts              נתוני דמו
src/lib/auth.ts             הגדרות NextAuth
src/lib/rbac.ts             בדיקות הרשאה לפי תפקיד
src/lib/availability.ts     חישוב זמינות יחידות אולם וזיהוי התנגשויות
src/lib/logliga/            מודול החיבור ללוגליג (Playwright + mock)
src/lib/reports.ts          בניית ושליחת דוחות
src/lib/email.ts            שליחת מייל (Nodemailer)
src/lib/actions/            Server Actions ל-CRUD ולשריונים
src/app/(dashboard)/        עמודי הממשק לפי תפקיד
src/app/api/                API routes לסנכרון/דוחות/אימות
src/scripts/                סקריפטים להרצה מתוזמנת (cron)
```

## פריסה לפרודקשן

1. ספקו PostgreSQL (למשל Render/Railway/Supabase) והגדירו `DATABASE_URL`.
2. `npx prisma migrate deploy` בזמן ה-build/deploy.
3. הגדירו את כל משתני הסביבה מ-`.env.example` בפלטפורמת האירוח.
4. חשוב: Playwright דורש שהדפדפן (Chromium) יהיה מותקן בסביבת ההרצה - ברוב
   הפלטפורמות (Render, VM רגיל) יש להריץ `npx playwright install --with-deps chromium`
   כחלק משלב ה-build. בפלטפורמות serverless טהורות (כמו Vercel) מומלץ
   להריץ את סנכרון הלוגליג כתהליך cron נפרד על שרת/קונטיינר, ולא כ-serverless
   function, בגלל מגבלות זמן ריצה וגודל.
