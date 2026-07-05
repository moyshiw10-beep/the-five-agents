import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TopBar } from "@/app/components/TopBar";
import { Fab } from "@/app/components/Fab";
import { STATUS_LABELS } from "@/app/lib/definitions";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await verifySession();
  const { status } = await searchParams;
  const filter = status === "PAST" ? "PAST" : status === "ACTIVE" ? "ACTIVE" : undefined;

  const teams = await prisma.team.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div>
      <TopBar title="קבוצות" />

      <div className="flex gap-2 overflow-x-auto px-4 py-3 -mb-1">
        <FilterChip href="/teams" label="הכול" active={!filter} />
        <FilterChip href="/teams?status=ACTIVE" label={STATUS_LABELS.ACTIVE} active={filter === "ACTIVE"} />
        <FilterChip href="/teams?status=PAST" label={STATUS_LABELS.PAST} active={filter === "PAST"} />
      </div>

      <div className="p-4 pt-2 flex flex-col gap-2">
        {teams.length === 0 ? (
          <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-4 text-center">
            אין עדיין קבוצות
          </p>
        ) : (
          teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3 active:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{team.name}</p>
                <p className="text-sm text-neutral-500">
                  {team._count.players} שחקנים
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 shrink-0">
                {STATUS_LABELS[team.status as "ACTIVE" | "PAST"]}
              </span>
            </Link>
          ))
        )}
      </div>

      <Fab href="/teams/new" />
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border ${
        active
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-white border-neutral-200 text-neutral-600"
      }`}
    >
      {label}
    </Link>
  );
}
