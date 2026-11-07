import { prisma } from "../lib/prisma";
import { isUnitSlotFree } from "../lib/availability";
import { evaluateImportRequest } from "../lib/importGate";
import { isLoginRateLimited, LOGIN_RATE_LIMIT, recordLoginFailure, resetLoginFailuresForTests } from "../lib/loginRateLimit";

const base = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";

function fail(name: string, detail: string): never {
  console.error(`FAIL ${name}: ${detail}`);
  process.exit(1);
}

function pass(name: string) {
  console.log(`PASS ${name}`);
}

async function login(email: string, password: string) {
  const jar = new Map<string, string>();
  const store = (res: Response) => {
    const headers = res.headers as Headers & { getSetCookie?: () => string[] };
    const raw = headers.getSetCookie?.() ?? [];
    for (const line of raw) {
      const [pair] = line.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1));
    }
  };
  const cookie = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

  const csrfRes = await fetch(`${base}/api/auth/csrf`, { headers: { cookie: cookie() } });
  store(csrfRes);
  if (!csrfRes.ok) fail("csrf", String(csrfRes.status));
  const csrf = (await csrfRes.json()) as { csrfToken?: string };
  if (!csrf.csrfToken) fail("csrf", "missing token");

  const body = new URLSearchParams({
    csrfToken: csrf.csrfToken,
    email,
    password,
    callbackUrl: `${base}/dashboard`,
    json: "true",
  });
  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", cookie: cookie() },
    body,
    redirect: "manual",
  });
  store(loginRes);
  return { status: loginRes.status, cookie: cookie(), location: loginRes.headers.get("location") };
}

async function main() {
  const password = process.env.SEED_PASSWORD ?? "";
  const cron = process.env.CRON_SECRET ?? "";
  if (password.length < 12 || cron.length < 12) fail("env", "required test secrets are missing");

  resetLoginFailuresForTests();
  const probe = "rate-limit-probe@example.com";
  for (let i = 0; i < LOGIN_RATE_LIMIT.MAX_FAILURES; i += 1) recordLoginFailure(probe);
  if (!isLoginRateLimited(probe)) fail("rate-limit", "threshold not reached");
  resetLoginFailuresForTests();
  pass("rate-limit");

  const importGate = await evaluateImportRequest();
  if (importGate.ok !== false || !importGate.reason.includes("No operational source")) {
    fail("import-gate", "gate did not refuse");
  }
  pass("import-gate");

  const loginPage = await fetch(`${base}/login`);
  if (loginPage.status !== 200) fail("login-page", String(loginPage.status));
  pass("login-page");

  const health = await fetch(`${base}/api/health`);
  const healthBody = (await health.json()) as { ok?: boolean; db?: string };
  if (health.status !== 200 || healthBody.ok !== true || healthBody.db !== "up") {
    fail("health", String(health.status));
  }
  pass("health");

  const anon = await fetch(`${base}/dashboard`, { redirect: "manual" });
  if (anon.status !== 307 && anon.status !== 302) fail("anon-dashboard", String(anon.status));
  if (!anon.headers.get("location")?.includes("/login")) fail("anon-dashboard", "not sent to login");
  pass("anon-dashboard");

  const bad = await login("admin@example.com", `${password}-wrong`);
  const badDash = await fetch(`${base}/dashboard`, { headers: { cookie: bad.cookie }, redirect: "manual" });
  if (badDash.status === 200) fail("bad-password", "dashboard opened");
  pass("bad-password");

  const admin = await login("admin@example.com", password);
  const dash = await fetch(`${base}/dashboard`, { headers: { cookie: admin.cookie }, redirect: "manual" });
  if (dash.status !== 200) fail("admin-dashboard", String(dash.status));
  pass("admin-dashboard");

  const halls = await fetch(`${base}/dashboard/halls`, { headers: { cookie: admin.cookie }, redirect: "manual" });
  if (halls.status !== 200) fail("admin-halls", String(halls.status));
  pass("admin-halls");

  const manager = await login("hallmanager@example.com", password);
  const managerBook = await fetch(`${base}/dashboard/book`, {
    headers: { cookie: manager.cookie },
    redirect: "manual",
  });
  if (managerBook.status !== 200) fail("manager-book", String(managerBook.status));
  pass("manager-book");

  const team = await login("team@example.com", password);
  const book = await fetch(`${base}/dashboard/book`, { headers: { cookie: team.cookie }, redirect: "manual" });
  if (book.status !== 200) fail("team-book", String(book.status));
  pass("team-book");

  const accountant = await login("accounting@example.com", password);
  const accountantBook = await fetch(`${base}/dashboard/book`, {
    headers: { cookie: accountant.cookie },
    redirect: "manual",
  });
  if (![302, 307].includes(accountantBook.status)) fail("accountant-book", String(accountantBook.status));
  pass("accountant-book");

  const noCron = await fetch(`${base}/api/logliga/sync`, { method: "POST" });
  if (noCron.status !== 401) fail("cron-missing", String(noCron.status));
  pass("cron-missing");

  const wrongCron = await fetch(`${base}/api/logliga/sync`, {
    method: "POST",
    headers: { authorization: "Bearer not-the-secret" },
  });
  if (wrongCron.status !== 401) fail("cron-wrong", String(wrongCron.status));
  pass("cron-wrong");

  const sync = await fetch(`${base}/api/logliga/sync`, {
    method: "POST",
    headers: { authorization: `Bearer ${cron}` },
  });
  const syncBody = (await sync.json()) as { gamesFound?: number; error?: string };
  if (sync.status !== 200 || typeof syncBody.gamesFound !== "number" || syncBody.gamesFound < 1) {
    fail("mock-sync", `${sync.status} ${syncBody.error ?? "no games"}`);
  }
  pass(`mock-sync games=${syncBody.gamesFound}`);

  const report = await fetch(`${base}/api/reports/hall-usage`, {
    method: "POST",
    headers: { authorization: `Bearer ${cron}`, "content-type": "application/json" },
    body: "{}",
  });
  const reportBody = (await report.json()) as { error?: string; results?: { success: boolean }[] };
  const results = reportBody.results ?? [];
  if (report.status !== 200 || results.length < 1 || results.some((item) => item.success)) {
    fail("report-without-smtp", String(report.status));
  }
  pass("report-without-smtp");

  const unit = await prisma.hallUnit.findFirst({ where: { name: "מגרש 2" } });
  const teamRow = await prisma.user.findUnique({ where: { email: "team@example.com" } });
  if (!unit || !teamRow) fail("fixture", "missing synthetic hall unit or team user");

  const date = new Date("2030-01-15T00:00:00.000Z");
  await prisma.leagueBooking.deleteMany({ where: { logligaGameId: "synthetic-overlap" } });
  await prisma.trainingBooking.deleteMany({ where: { hallUnitId: unit.id, date } });
  await prisma.leagueBooking.create({
    data: {
      hallUnitId: unit.id,
      date,
      startTime: "10:00",
      endTime: "11:00",
      logligaGameId: "synthetic-overlap",
      homeTeamName: "בית",
      awayTeamName: "חוץ",
    },
  });
  const blocked = await isUnitSlotFree(unit.id, date, "10:00", "11:00");
  if (blocked) fail("overlap", "league slot was reported free");
  const open = await isUnitSlotFree(unit.id, date, "11:00", "12:00");
  if (!open) fail("overlap", "adjacent slot was reported busy");
  await prisma.trainingBooking.create({
    data: {
      hallUnitId: unit.id,
      date,
      startTime: "11:00",
      endTime: "12:00",
      teamId: teamRow.teamId,
      createdById: teamRow.id,
      source: "TRAINING",
    },
  });
  const taken = await isUnitSlotFree(unit.id, date, "11:00", "12:00");
  if (taken) fail("training-block", "booked training slot was reported free");
  pass("booking-overlap");

  await prisma.$disconnect();
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`FAIL uncaught: ${message}`);
  await prisma.$disconnect();
  process.exit(1);
});
