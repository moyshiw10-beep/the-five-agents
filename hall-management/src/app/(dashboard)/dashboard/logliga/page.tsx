import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SyncButton } from "./SyncButton";

export default async function LogligaPage() {
  await requireRole("ADMIN");
  const [halls, logs] = await Promise.all([
    prisma.hall.findMany({ orderBy: { name: "asc" } }),
    prisma.logligaSyncLog.findMany({ orderBy: { startedAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">סנכרון לוגליג</h1>
        <SyncButton />
      </div>

      <div className="card">
        <h2 className="mb-3 font-medium">מיפוי אולמות למזהה לוגליג</h2>
        <p className="mb-3 text-sm text-slate-500">
          כדי שהסנכרון ימשוך שיבוצים עבור אולם, יש להגדיר לו "מזהה אולם בלוגליג" בעמוד ניהול
          האולמות. משחקים יוצמדו ליחידת האולם המתאימה לפי שם המגרש; אם אין התאמה, הם יוצמדו
          ליחידה הראשונה.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>אולם</th>
              <th>מזהה לוגליג</th>
            </tr>
          </thead>
          <tbody>
            {halls.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.logligaVenueId ?? <span className="text-amber-600">לא מוגדר</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="mb-3 font-medium">היסטוריית סנכרונים</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>סטטוס</th>
              <th>משחקים שנמצאו</th>
              <th>שגיאה</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{l.startedAt.toLocaleString("he-IL")}</td>
                <td>{l.success ? "הצליח" : "נכשל"}</td>
                <td>{l.gamesFound}</td>
                <td className="max-w-xs truncate text-red-600">{l.errorMessage}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-slate-500">
                  עדיין לא בוצע סנכרון
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card bg-amber-50 text-sm text-amber-800">
        <p>
          החיבור ללוגליג מבוסס כניסת משתמש (login) ודורש הגדרת <code>LOGLIGA_BASE_URL</code>,{" "}
          <code>LOGLIGA_USERNAME</code> ו-<code>LOGLIGA_PASSWORD</code> בקובץ ה-.env בשרת. אם
          מבנה ה-HTML של אתר לוגליג שונה מהמשוער, יש לעדכן את הקובץ{" "}
          <code>src/lib/logliga/selectors.ts</code> בהתאם (הוראות מפורטות בתוך הקובץ).
        </p>
      </div>
    </div>
  );
}
