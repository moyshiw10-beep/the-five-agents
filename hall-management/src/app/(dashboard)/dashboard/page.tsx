import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireSession();
  const { role } = session.user;

  if (role === "ADMIN") {
    const [halls, teams, upcomingLeague, upcomingTraining] = await Promise.all([
      prisma.hall.count(),
      prisma.team.count(),
      prisma.leagueBooking.count({ where: { date: { gte: new Date() } } }),
      prisma.trainingBooking.count({ where: { date: { gte: new Date() }, status: "CONFIRMED" } }),
    ]);
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="אולמות" value={halls} href="/dashboard/halls" />
        <StatCard label="קבוצות" value={teams} />
        <StatCard label="משחקי ליגה קרובים" value={upcomingLeague} href="/dashboard/bookings" />
        <StatCard label="שריוני אימון קרובים" value={upcomingTraining} href="/dashboard/bookings" />
      </div>
    );
  }

  if (role === "HALL_MANAGER") {
    const halls = await prisma.hall.findMany({
      where: { managers: { some: { id: session.user.id } } },
      include: { units: true },
    });
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">האולמות שלי</h1>
        {halls.length === 0 && <p className="text-slate-500">לא שויכו אליך אולמות עדיין.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {halls.map((h) => (
            <div key={h.id} className="card">
              <h2 className="font-medium">{h.name}</h2>
              <p className="text-sm text-slate-500">{h.address}</p>
              <p className="mt-2 text-sm">{h.units.length} יחידות</p>
              <Link href="/dashboard/bookings" className="mt-3 inline-block text-sm text-brand-600">
                צפייה בלוח השיבוצים ←
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (role === "ACCOUNTANT") {
    return (
      <div className="card">
        <h1 className="text-lg font-semibold">דוחות חודשיים</h1>
        <p className="mt-2 text-sm text-slate-600">
          כאן ניתן לצפות ולהפיק את הדוח החודשי המרכז את השימוש בכלל האולמות.
        </p>
        <Link href="/dashboard/reports" className="btn mt-4 inline-flex">
          מעבר לדוחות
        </Link>
      </div>
    );
  }

  // TEAM
  const myBookings = await prisma.trainingBooking.count({
    where: { teamId: session.user.teamId ?? undefined, status: "CONFIRMED", date: { gte: new Date() } },
  });
  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-lg font-semibold">שלום {session.user.name}</h1>
        <p className="mt-2 text-sm text-slate-600">יש לך {myBookings} שריוני אימון קרובים.</p>
        <Link href="/dashboard/book" className="btn mt-4 inline-flex">
          שריון אימון חדש
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
