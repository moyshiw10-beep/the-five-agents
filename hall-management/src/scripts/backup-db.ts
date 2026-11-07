import { spawn } from "child_process";
import { mkdir, stat } from "fs/promises";
import path from "path";

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

async function main() {
  if (process.env.BACKUP_CONFIRM !== "yes") {
    console.error("Refusing backup. Set BACKUP_CONFIRM=yes to write a dump. The database URL is not printed.");
    process.exit(2);
  }
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("DATABASE_URL is missing.");
    process.exit(2);
  }

  const directory = path.resolve(process.cwd(), "backups");
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, `hall-${timestamp()}.dump`);

  await new Promise<void>((resolve, reject) => {
    const child = spawn("pg_dump", ["--format=custom", "--file", file, "--dbname", databaseUrl], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let err = "";
    child.stderr.on("data", (chunk) => {
      err += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.replace(databaseUrl, "[redacted]") || `pg_dump exited ${code}`));
    });
  });

  const info = await stat(file);
  if (info.size <= 0) throw new Error("Backup file is empty.");
  console.log(`Backup written: ${file} (${info.size} bytes).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "backup failed");
  process.exit(1);
});
