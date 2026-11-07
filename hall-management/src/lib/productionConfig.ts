const REQUIRED = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET", "CRON_SECRET"] as const;

/** Names only. Values are never included in the error. */
export function missingProductionConfig(): string[] {
  const missing: string[] = [];
  for (const name of REQUIRED) {
    const value = process.env[name]?.trim() ?? "";
    if (!value) missing.push(name);
  }
  if ((process.env.NEXTAUTH_SECRET?.trim().length ?? 0) > 0 && (process.env.NEXTAUTH_SECRET?.trim().length ?? 0) < 32) {
    missing.push("NEXTAUTH_SECRET");
  }
  if ((process.env.CRON_SECRET?.trim().length ?? 0) > 0 && (process.env.CRON_SECRET?.trim().length ?? 0) < 32) {
    missing.push("CRON_SECRET");
  }
  return [...new Set(missing)];
}

export function assertProductionConfig(): void {
  if (process.env.NODE_ENV !== "production") return;
  const missing = missingProductionConfig();
  if (missing.length > 0) {
    throw new Error(`Missing production configuration: ${missing.join(", ")}`);
  }
}
