"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { LeadFormSchema } from "@/app/lib/definitions";

function parseLeadForm(formData: FormData) {
  return LeadFormSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes") ?? "",
    status: formData.get("status"),
    nextFollowUpDate: formData.get("nextFollowUpDate") ?? "",
  });
}

export async function createLead(formData: FormData) {
  await requireAuth();
  const data = parseLeadForm(formData);

  await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      notes: data.notes || null,
      status: data.status,
      nextFollowUpDate: data.nextFollowUpDate
        ? new Date(data.nextFollowUpDate)
        : null,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/");
  redirect("/leads");
}

export async function updateLead(id: string, formData: FormData) {
  await requireAuth();
  const data = parseLeadForm(formData);

  await prisma.lead.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone,
      notes: data.notes || null,
      status: data.status,
      nextFollowUpDate: data.nextFollowUpDate
        ? new Date(data.nextFollowUpDate)
        : null,
    },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/");
  redirect("/leads");
}

export async function deleteLead(id: string) {
  await requireAuth();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  revalidatePath("/");
  redirect("/leads");
}
