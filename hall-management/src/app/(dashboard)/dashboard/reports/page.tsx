import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ReportTriggerButtons } from "./ReportTriggerButtons";

export default async function ReportsPage() {
  const session = await requireRole("ADMIN", "HALL_MANAGER", "ACCOUNTANT");

  const logs = await prisma.reportLog.findMany({
    where: session.user.role === "HALL_MANAGER" ? { type: "HALL_USAGE" } : undefined,
    orderBy: { sentAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">דוחות</h1>

      {session.user.role === "ADMIN" && <ReportTriggerButtons />}

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-medium">היסטוריית שליחות</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>סוג</th>
              <th>תקופה</th>
              <th>נמען</th>
              <th>נשלח</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{l.type === "HALL_USAGE" ? "דוח שימוש באולם" : "דוח חודשי לחשבונות"}</td>
                <td>
                  {l.periodStart.toLocaleDateString("he-IL")} – {l.periodEnd.toLocaleDateString("he-IL")}
                </td>
                <td>{l.recipient}</td>
                <td>{l.sentAt.toLocaleString("he-IL")}</td>
                <td className={l.success ? "text-green-700" : "text-red-600"}>
                  {l.success ? "נשלח בהצלחה" : l.errorMessage ?? "נכשל"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-slate-500">
                  לא נשלחו דוחות עדיין
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
