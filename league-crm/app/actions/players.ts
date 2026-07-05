"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { PlayerFormSchema } from "@/app/lib/definitions";

function parsePlayerForm(formData: FormData) {
  return PlayerFormSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    notes: formData.get("notes") ?? "",
    status: formData.get("status"),
    teamId: formData.get("teamId") ?? "",
  });
}

export async function createPlayer(formData: FormData) {
  await requireAuth();
  const data = parsePlayerForm(formData);

  await prisma.player.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      notes: data.notes || null,
      status: data.status,
      teamId: data.teamId || null,
    },
  });

  revalidatePath("/players");
  revalidatePath("/teams");
  redirect("/players");
}

export async function updatePlayer(id: string, formData: FormData) {
  await requireAuth();
  const data = parsePlayerForm(formData);

  await prisma.player.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      notes: data.notes || null,
      status: data.status,
      teamId: data.teamId || null,
    },
  });

  revalidatePath("/players");
  revalidatePath(`/players/${id}`);
  revalidatePath("/teams");
  redirect("/players");
}

export async function deletePlayer(id: string) {
  await requireAuth();
  await prisma.player.delete({ where: { id } });
  revalidatePath("/players");
  revalidatePath("/teams");
  redirect("/players");
}
