import { verifySession } from "@/app/lib/dal";
import { TopBar } from "@/app/components/TopBar";
import { TeamForm } from "@/app/(app)/teams/TeamForm";
import { createTeam } from "@/app/actions/teams";

export default async function NewTeamPage() {
  await verifySession();

  return (
    <div>
      <TopBar title="קבוצה חדשה" />
      <TeamForm action={createTeam} submitLabel="שמור קבוצה" />
    </div>
  );
}
