import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TopBar } from "@/app/components/TopBar";
import { PlayerForm } from "@/app/(app)/players/PlayerForm";
import { createPlayer } from "@/app/actions/players";

export default async function NewPlayerPage() {
  await verifySession();
  const teams = await prisma.team.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <TopBar title="שחקן חדש" />
      <PlayerForm action={createPlayer} teams={teams} submitLabel="שמור שחקן" />
    </div>
  );
}
