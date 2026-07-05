import { verifySession } from "@/app/lib/dal";
import { TopBar } from "@/app/components/TopBar";
import { LeadForm } from "@/app/(app)/leads/LeadForm";
import { createLead } from "@/app/actions/leads";

export default async function NewLeadPage() {
  await verifySession();

  return (
    <div>
      <TopBar title="ליד חדש" />
      <LeadForm action={createLead} submitLabel="שמור ליד" />
    </div>
  );
}
