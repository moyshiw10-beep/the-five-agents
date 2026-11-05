import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isCronAuthorized } from "@/lib/cronAuth";
import { sendHallUsageReports } from "@/lib/reports";

export async function POST(req: NextRequest) {
  const isCron = isCronAuthorized(req.headers.get("authorization"));

  if (!isCron) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const periodEnd = body.periodEnd ? new Date(body.periodEnd) : new Date();
  const periodStart = body.periodStart
    ? new Date(body.periodStart)
    : new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const results = await sendHallUsageReports(periodStart, periodEnd);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
