import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createHall, deleteHall } from "@/lib/actions/halls";

export default async function HallsPage() {
  await requireRole("ADMIN");
  const halls = await prisma.hall.findMany({
    include: { units: true, managers: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">אולמות</h1>

      <div className="card">
        <h2 className="mb-3 font-medium">הוספת אולם</h2>
        <form action={createHall} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">שם האולם</label>
            <input name="name" required className="input" />
          </div>
          <div>
            <label className="label">כתובת</label>
            <input name="address" className="input" />
          </div>
          <div>
            <label className="label">מזהה אולם בלוגליג (אם ידוע)</label>
            <input name="logligaVenueId" className="input" />
          </div>
          <div>
            <label className="label">אימייל לדוח שימוש (אופציונלי)</label>
            <input name="reportEmail" type="email" className="input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn">הוספה</button>
          </div>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>שם</th>
              <th>כתובת</th>
              <th>יחידות</th>
              <th>מנהלים</th>
              <th>מזהה לוגליג</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {halls.map((h) => (
              <tr key={h.id}>
                <td>
                  <Link href={`/dashboard/halls/${h.id}`} className="text-brand-600">
                    {h.name}
                  </Link>
                </td>
                <td>{h.address}</td>
                <td>{h.units.length}</td>
                <td>{h.managers.map((m) => m.name).join(", ") || "—"}</td>
                <td>{h.logligaVenueId ?? "—"}</td>
                <td>
                  <form
                    action={async () => {
                      "use server";
                      await deleteHall(h.id);
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
