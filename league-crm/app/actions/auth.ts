"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSessionCookie, deleteSessionCookie } from "@/app/lib/session";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { error: "יש להזין סיסמה" };
  }

  const hash = process.env.APP_PASSWORD_HASH;
  if (!hash) {
    return { error: "המערכת אינה מוגדרת כראוי (חסר APP_PASSWORD_HASH)" };
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return { error: "סיסמה שגויה" };
  }

  await createSessionCookie();
  redirect("/");
}

export async function logout() {
  "use server";
  await deleteSessionCookie();
  redirect("/login");
}
