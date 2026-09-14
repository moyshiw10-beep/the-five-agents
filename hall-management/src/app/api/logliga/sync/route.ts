import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncLogligaSchedule } from "@/lib/logliga/sync";

/**
 * הפעלת סנכרון לוגליג. ניתן להפעיל משני מקורות:
 * 1. אדמין מחובר דרך הממשק (בדיקת session).
 * 2. שירות cron חיצוני, עם הכותרת Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}` && !!process.env.CRON_SECRET;

  if (!isCron) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  try {
    const result = await syncLogligaSchedule();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
