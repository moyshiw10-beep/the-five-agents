import { spawn } from "child_process";
import { prisma } from "../lib/prisma";

async function dumpIsReadable(file: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("pg_restore", ["--list", file], { stdio: ["ignore", "ignore", "ignore"] });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: tsx src/scripts/restore-check.ts <dump>");
    process.exit(2);
  }
  const readable = await dumpIsReadable(file);
  if (!readable) {
    console.error("Dump is not a readable pg_restore custom archive. No restore attempted.");
    process.exit(2);
  }

  const [users, halls, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.hall.count(),
    prisma.trainingBooking.count(),
  ]);
  console.error(
    `Automatic restore is disabled. Target already has users=${users}, halls=${halls}, trainingBookings=${bookings}. No data was changed.`
  );
  process.exit(2);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "restore check failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
