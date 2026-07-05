import { notFound } from "next/navigation";
import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TopBar } from "@/app/components/TopBar";
import { LeadForm } from "@/app/(app)/leads/LeadForm";
import { updateLead, deleteLead } from "@/app/actions/leads";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const updateLeadWithId = updateLead.bind(null, id);
  const deleteLeadWithId = deleteLead.bind(null, id);

  return (
    <div>
      <TopBar title="עריכת ליד" />
      <LeadForm
        action={updateLeadWithId}
        defaults={lead}
        submitLabel="שמור שינויים"
      />
      <form action={deleteLeadWithId} className="px-4 pb-6">
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 text-red-600 font-semibold py-3 text-base active:bg-red-50"
        >
          מחק ליד
        </button>
      </form>
    </div>
  );
}
