"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TeamFormSchema } from "@/app/lib/definitions";

function parseTeamForm(formData: FormData) {
  return TeamFormSchema.parse({
    name: formData.get("name"),
    notes: formData.get("notes") ?? "",
    status: formData.get("status"),
  });
}

export async function createTeam(formData: FormData) {
  await requireAuth();
  const data = parseTeamForm(formData);

  await prisma.team.create({
    data: {
      name: data.name,
      notes: data.notes || null,
      status: data.status,
    },
  });

  revalidatePath("/teams");
  revalidatePath("/");
  redirect("/teams");
}

export async function updateTeam(id: string, formData: FormData) {
  await requireAuth();
  const data = parseTeamForm(formData);

  await prisma.team.update({
    where: { id },
    data: {
      name: data.name,
      notes: data.notes || null,
      status: data.status,
    },
  });

  revalidatePath("/teams");
  revalidatePath(`/teams/${id}`);
  redirect("/teams");
}

export async function deleteTeam(id: string) {
  await requireAuth();
  await prisma.team.delete({ where: { id } });
  revalidatePath("/teams");
  revalidatePath("/");
  redirect("/teams");
}
