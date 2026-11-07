"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "HALL_MANAGER", "ACCOUNTANT", "TEAM"]),
  teamId: z.string().optional(),
});

export async function createUser(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = userSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") as Role,
    teamId: formData.get("teamId") || undefined,
  });

  const passwordHash = await bcrypt.hash(parsed.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email.toLowerCase().trim(),
      passwordHash,
      role: parsed.role,
      teamId: parsed.role === "TEAM" ? parsed.teamId : undefined,
    },
  });
  revalidatePath("/dashboard/admin/users");
}

export async function deleteUser(userId: string) {
  await requireRole("ADMIN");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/admin/users");
}

export async function createTeam(formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim() || undefined;
  if (!name) throw new Error("שם קבוצה נדרש");
  await prisma.team.create({ data: { name, contactEmail } });
  revalidatePath("/dashboard/admin/users");
}
