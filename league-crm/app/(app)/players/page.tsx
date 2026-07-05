import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TopBar } from "@/app/components/TopBar";
import { Fab } from "@/app/components/Fab";
import { STATUS_LABELS } from "@/app/lib/definitions";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await verifySession();
  const { status } = await searchParams;
  const filter = status === "PAST" ? "PAST" : status === "ACTIVE" ? "ACTIVE" : undefined;

  const players = await prisma.player.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { name: "asc" },
    include: { team: true },
  });

  return (
    <div>
      <TopBar title="שחקנים" />

      <div className="flex gap-2 overflow-x-auto px-4 py-3 -mb-1">
        <FilterChip href="/players" label="הכול" active={!filter} />
        <FilterChip href="/players?status=ACTIVE" label={STATUS_LABELS.ACTIVE} active={filter === "ACTIVE"} />
        <FilterChip href="/players?status=PAST" label={STATUS_LABELS.PAST} active={filter === "PAST"} />
      </div>

      <div className="p-4 pt-2 flex flex-col gap-2">
        {players.length === 0 ? (
          <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-4 text-center">
            אין עדיין שחקנים
          </p>
        ) : (
          players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3 active:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{player.name}</p>
                <p className="text-sm text-neutral-500">
                  {player.team?.name ?? "ללא קבוצה"}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 shrink-0">
                {STATUS_LABELS[player.status as "ACTIVE" | "PAST"]}
              </span>
            </Link>
          ))
        )}
      </div>

      <Fab href="/players/new" />
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
