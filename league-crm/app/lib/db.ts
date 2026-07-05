import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// NOTE: local dev uses SQLite via the better-sqlite3 driver adapter (Prisma 7
// requires an explicit adapter - there is no more implicit "read the
// datasource url from schema.prisma" connection). When moving to
// production/Supabase, swap this for `@prisma/adapter-pg` pointed at
// DATABASE_URL, and update prisma/schema.prisma's datasource provider to
// "postgresql" to match.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
