import { notFound } from "next/navigation";
import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TopBar } from "@/app/components/TopBar";
import { PlayerForm } from "@/app/(app)/players/PlayerForm";
import { updatePlayer, deletePlayer } from "@/app/actions/players";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;

  const [player, teams] = await Promise.all([
    prisma.player.findUnique({ where: { id } }),
    prisma.team.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!player) notFound();

  const updatePlayerWithId = updatePlayer.bind(null, id);
  const deletePlayerWithId = deletePlayer.bind(null, id);

  return (
    <div>
      <TopBar title="עריכת שחקן" />
      <PlayerForm
        action={updatePlayerWithId}
        defaults={player}
        teams={teams}
        submitLabel="שמור שינויים"
      />
      <form action={deletePlayerWithId} className="px-4 pb-6">
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 text-red-600 font-semibold py-3 text-base active:bg-red-50"
        >
          מחק שחקן
        </button>
      </form>
    </div>
  );
}
