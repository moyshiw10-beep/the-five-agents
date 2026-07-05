import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/app/lib/definitions";

export default async function DashboardPage() {
  await verifySession();

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const [dueFollowUps, leadCount, activePlayerCount, activeTeamCount] =
    await Promise.all([
      prisma.lead.findMany({
        where: {
          nextFollowUpDate: { lte: today },
          status: { notIn: ["CONVERTED", "NOT_INTERESTED"] },
        },
        orderBy: { nextFollowUpDate: "asc" },
      }),
      prisma.lead.count(),
      prisma.player.count({ where: { status: "ACTIVE" } }),
      prisma.team.count({ where: { status: "ACTIVE" } }),
    ]);

  return (
    <div className="p-4 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">דשבורד</h1>
        <p className="text-sm text-neutral-500">סקירה כללית של הליגה</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="לידים" value={leadCount} href="/leads" />
        <StatCard label="שחקנים פעילים" value={activePlayerCount} href="/players" />
        <StatCard label="קבוצות פעילות" value={activeTeamCount} href="/teams" />
      </div>

      <div>
        <h2 className="text-base font-bold text-neutral-900 mb-2">
          תזכורות להיום ומעבר לזמנן ({dueFollowUps.length})
        </h2>

        {dueFollowUps.length === 0 ? (
          <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-4 text-center">
            אין תזכורות ממתינות 🎉
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dueFollowUps.map((lead) => {
              const overdue =
                lead.nextFollowUpDate &&
                new Date(lead.nextFollowUpDate).setHours(23, 59, 59, 999) <
                  new Date().setHours(0, 0, 0, 0);
              return (
                <li key={lead.id}>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3 active:bg-neutral-50"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{lead.name}</p>
                      <p className="text-sm text-neutral-500" dir="ltr">
                        {lead.phone}
                      </p>
                    </div>
                    <div className="text-left">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          overdue
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {overdue ? "באיחור" : "היום"}
                      </span>
                      <p className="text-xs text-neutral-400 mt-1">
                        {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-col items-center active:bg-neutral-50"
    >
      <span className="text-2xl font-bold text-neutral-900">{value}</span>
      <span className="text-xs text-neutral-500 text-center mt-0.5">
        {label}
      </span>
    </Link>
  );
}
