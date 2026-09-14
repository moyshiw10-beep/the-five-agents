import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createUser, deleteUser, createTeam } from "@/lib/actions/users";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "מנהל מערכת",
  HALL_MANAGER: "מנהל אולם",
  ACCOUNTANT: "מנהלת חשבונות",
  TEAM: "קבוצה / שחקן",
};

export default async function UsersPage() {
  await requireRole("ADMIN");
  const [users, teams] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { team: true } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">משתמשים וקבוצות</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-medium">הוספת משתמש</h2>
          <form action={createUser} className="space-y-3">
            <div>
              <label className="label">שם</label>
              <input name="name" required className="input" />
            </div>
            <div>
              <label className="label">אימייל</label>
              <input name="email" type="email" required className="input" />
            </div>
            <div>
              <label className="label">סיסמה זמנית</label>
              <input name="password" type="password" required minLength={6} className="input" />
            </div>
            <div>
              <label className="label">תפקיד</label>
              <select name="role" className="input">
                <option value="HALL_MANAGER">מנהל אולם</option>
                <option value="ACCOUNTANT">מנהלת חשבונות</option>
                <option value="TEAM">קבוצה / שחקן</option>
                <option value="ADMIN">מנהל מערכת</option>
              </select>
            </div>
            <div>
              <label className="label">קבוצה (רק לתפקיד "קבוצה/שחקן")</label>
              <select name="teamId" className="input">
                <option value="">— ללא —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn">יצירה</button>
          </form>
        </div>

        <div className="card">
          <h2 className="mb-3 font-medium">הוספת קבוצה</h2>
          <form action={createTeam} className="space-y-3">
            <div>
              <label className="label">שם קבוצה</label>
              <input name="name" required className="input" />
            </div>
            <div>
              <label className="label">אימייל ליצירת קשר</label>
              <input name="contactEmail" type="email" className="input" />
            </div>
            <button className="btn">הוספה</button>
          </form>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-slate-600">קבוצות קיימות</h3>
            <ul className="space-y-1 text-sm">
              {teams.map((t) => (
                <li key={t.id}>{t.name}</li>
              ))}
              {teams.length === 0 && <li className="text-slate-500">אין קבוצות עדיין</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-medium">רשימת משתמשים</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>שם</th>
              <th>אימייל</th>
              <th>תפקיד</th>
              <th>קבוצה</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{ROLE_LABELS[u.role]}</td>
                <td>{u.team?.name ?? "—"}</td>
                <td>
                  <form
                    action={async () => {
                      "use server";
                      await deleteUser(u.id);
                    }}
                  >
                    <button className="text-sm text-red-600">מחיקה</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
