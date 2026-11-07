import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { cancelTrainingBooking } from "@/lib/actions/bookings";

export default async function BookingsPage() {
  const session = await requireSession();
  const { role } = session.user;

  let hallFilter = {};
  if (role === "HALL_MANAGER") {
    hallFilter = { hallUnit: { hall: { managers: { some: { id: session.user.id } } } } };
  }

  const teamFilter = role === "TEAM" ? { teamId: session.user.teamId ?? "__none__" } : {};

  const [leagueBookings, trainingBookings] = await Promise.all([
    role === "TEAM"
      ? Promise.resolve([])
      : prisma.leagueBooking.findMany({
          where: { date: { gte: new Date() }, ...hallFilter },
          include: { hallUnit: { include: { hall: true } } },
          orderBy: { date: "asc" },
          take: 50,
        }),
    prisma.trainingBooking.findMany({
      where: {
        date: { gte: new Date() },
        status: "CONFIRMED",
        ...hallFilter,
        ...teamFilter,
      },
      include: { hallUnit: { include: { hall: true } }, team: true, createdBy: true },
      orderBy: { date: "asc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">{role === "TEAM" ? "השריונים שלי" : "לוח שיבוצים"}</h1>

      {role !== "TEAM" && (
        <div className="card overflow-x-auto">
          <h2 className="mb-3 font-medium">משחקי ליגה קרובים (מלוגליג)</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>אולם</th>
                <th>יחידה</th>
                <th>תאריך</th>
                <th>שעה</th>
                <th>משחק</th>
              </tr>
            </thead>
            <tbody>
              {leagueBookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.hallUnit.hall.name}</td>
                  <td>{b.hallUnit.name}</td>
                  <td>{b.date.toLocaleDateString("he-IL")}</td>
                  <td>
                    {b.startTime}–{b.endTime}
                  </td>
                  <td>
                    {b.homeTeamName} נגד {b.awayTeamName}
                  </td>
                </tr>
              ))}
              {leagueBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-slate-500">
                    אין משחקים קרובים
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-medium">שריוני אימונים קרובים</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>אולם</th>
              <th>יחידה</th>
              <th>תאריך</th>
              <th>שעה</th>
              <th>קבוצה</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trainingBookings.map((b) => (
              <tr key={b.id}>
                <td>{b.hallUnit.hall.name}</td>
                <td>{b.hallUnit.name}</td>
                <td>{b.date.toLocaleDateString("he-IL")}</td>
                <td>
                  {b.startTime}–{b.endTime}
                </td>
                <td>{b.team?.name ?? "—"}</td>
                <td>
                  <form
                    action={async () => {
                      "use server";
                      await cancelTrainingBooking(b.id);
                    }}
                  >
                    <button className="text-sm text-red-600">ביטול</button>
                  </form>
                </td>
              </tr>
            ))}
            {trainingBookings.length === 0 && (
              <tr>
                <td colSpan={6} className="text-slate-500">
                  אין שריונים קרובים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
