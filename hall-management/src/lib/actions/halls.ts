"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const hallSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  logligaVenueId: z.string().optional(),
  reportEmail: z.string().email().optional().or(z.literal("")),
});

export async function createHall(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = hallSchema.parse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    logligaVenueId: formData.get("logligaVenueId") || undefined,
    reportEmail: formData.get("reportEmail") || "",
  });

  await prisma.hall.create({
    data: {
      name: parsed.name,
      address: parsed.address,
      logligaVenueId: parsed.logligaVenueId,
      reportEmail: parsed.reportEmail || undefined,
    },
  });
  revalidatePath("/dashboard/halls");
}

export async function deleteHall(hallId: string) {
  await requireRole("ADMIN");
  await prisma.hall.delete({ where: { id: hallId } });
  revalidatePath("/dashboard/halls");
}

export async function addHallUnit(hallId: string, formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("שם היחידה נדרש");
  await prisma.hallUnit.create({ data: { hallId, name } });
  revalidatePath(`/dashboard/halls/${hallId}`);
}

export async function removeHallUnit(hallId: string, unitId: string) {
  await requireRole("ADMIN");
  await prisma.hallUnit.delete({ where: { id: unitId } });
  revalidatePath(`/dashboard/halls/${hallId}`);
}

export async function setHallManagers(hallId: string, managerIds: string[]) {
  await requireRole("ADMIN");
  await prisma.hall.update({
    where: { id: hallId },
    data: { managers: { set: managerIds.map((id) => ({ id })) } },
  });
  revalidatePath(`/dashboard/halls/${hallId}`);
}
