import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

/** מחזיר את הסשן הנוכחי, ומפנה להתחברות אם אין כזה */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}

/** מוודא שהמשתמש הנוכחי הוא בעל אחד מהתפקידים המורשים, אחרת מפנה לדשבורד */
export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}

/** בדיקה האם מנהל אולם מנהל אולם מסוים - לשימוש ב-API routes */
export async function assertHallManagerAccess(hallId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("UNAUTHORIZED");
  if (session.user.role === "ADMIN") return session;
  if (session.user.role !== "HALL_MANAGER") throw new Error("FORBIDDEN");

  const { prisma } = await import("@/lib/prisma");
  const hall = await prisma.hall.findFirst({
    where: { id: hallId, managers: { some: { id: session.user.id } } },
  });
  if (!hall) throw new Error("FORBIDDEN");
  return session;
}
