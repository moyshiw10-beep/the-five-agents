import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSessionCookie } from "@/app/lib/session";

export const verifySession = cache(async () => {
  const authed = await readSessionCookie();
  if (!authed) {
    redirect("/login");
  }
  return { authed: true };
});

// Same check, without redirecting - for use in Server Actions, where throwing
// is more appropriate than a navigation redirect. Server Actions are directly
// reachable via POST regardless of proxy.ts, so every action must call this.
export async function requireAuth() {
  const authed = await readSessionCookie();
  if (!authed) {
    throw new Error("Unauthorized");
  }
}
