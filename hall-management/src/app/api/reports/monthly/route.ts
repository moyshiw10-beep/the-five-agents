import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMonthlyAccountingReport } from "@/lib/reports";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}` && !!process.env.CRON_SECRET;

  if (!isCron) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const now = new Date();
  const periodStart = body.periodStart
    ? new Date(body.periodStart)
    : new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = body.periodEnd ? new Date(body.periodEnd) : new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const results = await sendMonthlyAccountingReport(periodStart, periodEnd);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
