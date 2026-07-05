import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TopBar } from "@/app/components/TopBar";
import { TeamForm } from "@/app/(app)/teams/TeamForm";
import { updateTeam, deleteTeam } from "@/app/actions/teams";
import { STATUS_LABELS } from "@/app/lib/definitions";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;

  const team = await prisma.team.findUnique({
    where: { id },
    include: { players: { orderBy: { name: "asc" } } },
  });
  if (!team) notFound();

  const updateTeamWithId = updateTeam.bind(null, id);
  const deleteTeamWithId = deleteTeam.bind(null, id);

  return (
    <div>
      <TopBar title="עריכת קבוצה" />
      <TeamForm action={updateTeamWithId} defaults={team} submitLabel="שמור שינויים" />

      <div className="px-4 pb-4">
        <h2 className="text-base font-bold text-neutral-900 mb-2">
          שחקנים בקבוצה ({team.players.length})
        </h2>
        {team.players.length === 0 ? (
          <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-4 text-center">
            אין שחקנים משויכים לקבוצה זו
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {team.players.map((player) => (
              <li key={player.id}>
                <Link
                  href={`/players/${player.id}`}
                  className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3 active:bg-neutral-50"
                >
                  <span className="font-medium text-neutral-900">{player.name}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
                    {STATUS_LABELS[player.status as "ACTIVE" | "PAST"]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={deleteTeamWithId} className="px-4 pb-6">
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 text-red-600 font-semibold py-3 text-base active:bg-red-50"
        >
          מחק קבוצה
        </button>
      </form>
    </div>
  );
}
