import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function durationHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("he-IL");
}

interface HallUsageSummary {
  hallName: string;
  periodStart: Date;
  periodEnd: Date;
  leagueHours: number;
  leagueGames: number;
  trainingHours: number;
  trainingBookings: number;
  byUnit: {
    unitName: string;
    leagueHours: number;
    trainingHours: number;
  }[];
}

async function buildHallUsageSummary(hallId: string, periodStart: Date, periodEnd: Date): Promise<HallUsageSummary> {
  const hall = await prisma.hall.findUniqueOrThrow({
    where: { id: hallId },
    include: {
      units: {
        include: {
          leagueBookings: { where: { date: { gte: periodStart, lt: periodEnd } } },
          trainingBookings: {
            where: { date: { gte: periodStart, lt: periodEnd }, status: "CONFIRMED" },
          },
        },
      },
    },
  });

  const byUnit = hall.units.map((u) => ({
    unitName: u.name,
    leagueHours: u.leagueBookings.reduce((sum, b) => sum + durationHours(b.startTime, b.endTime), 0),
    trainingHours: u.trainingBookings.reduce((sum, b) => sum + durationHours(b.startTime, b.endTime), 0),
  }));

  return {
    hallName: hall.name,
    periodStart,
    periodEnd,
    leagueHours: byUnit.reduce((s, u) => s + u.leagueHours, 0),
    leagueGames: hall.units.reduce((s, u) => s + u.leagueBookings.length, 0),
    trainingHours: byUnit.reduce((s, u) => s + u.trainingHours, 0),
    trainingBookings: hall.units.reduce((s, u) => s + u.trainingBookings.length, 0),
    byUnit,
  };
}

function renderHallUsageHtml(summary: HallUsageSummary): string {
  const rows = summary.byUnit
    .map(
      (u) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${u.unitName}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${u.leagueHours.toFixed(1)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${u.trainingHours.toFixed(1)}</td>
      </tr>`
    )
    .join("");

  return `<div dir="rtl" style="font-family:sans-serif">
    <h2>דוח שימוש באולם: ${summary.hallName}</h2>
    <p>התקופה: ${fmtDate(summary.periodStart)} – ${fmtDate(summary.periodEnd)}</p>
    <p>סה"כ ${summary.leagueGames} משחקי ליגה (${summary.leagueHours.toFixed(1)} שעות),
       ${summary.trainingBookings} שריוני אימון (${summary.trainingHours.toFixed(1)} שעות).</p>
    <table style="border-collapse:collapse;width:100%;margin-top:12px">
      <thead>
        <tr style="background:#f1f5f9">
          <th style="padding:6px 10px;text-align:right">יחידה</th>
          <th style="padding:6px 10px;text-align:right">שעות ליגה</th>
          <th style="padding:6px 10px;text-align:right">שעות אימונים</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

/** שולח דוח שימוש שבועי/תקופתי לכל מנהלי האולמות */
export async function sendHallUsageReports(periodStart: Date, periodEnd: Date) {
  const halls = await prisma.hall.findMany({ include: { managers: true } });
  const results: { hall: string; recipient: string; success: boolean; error?: string }[] = [];

  for (const hall of halls) {
    const recipients = new Set<string>();
    if (hall.reportEmail) recipients.add(hall.reportEmail);
    hall.managers.forEach((m) => recipients.add(m.email));

    if (recipients.size === 0) continue;

    const summary = await buildHallUsageSummary(hall.id, periodStart, periodEnd);
    const html = renderHallUsageHtml(summary);

    for (const recipient of recipients) {
      try {
        await sendEmail({ to: recipient, subject: `דוח שימוש באולם ${hall.name}`, html });
        await prisma.reportLog.create({
          data: { type: "HALL_USAGE", periodStart, periodEnd, hallId: hall.id, recipient, success: true },
        });
        results.push({ hall: hall.name, recipient, success: true });
      } catch (err) {
        const errorMessage = (err as Error).message;
        await prisma.reportLog.create({
          data: {
            type: "HALL_USAGE",
            periodStart,
            periodEnd,
            hallId: hall.id,
            recipient,
            success: false,
            errorMessage,
          },
        });
        results.push({ hall: hall.name, recipient, success: false, error: errorMessage });
      }
    }
  }

  return results;
}

/** שולח דוח חודשי מרוכז לכל משתמשי "מנהלת חשבונות" */
export async function sendMonthlyAccountingReport(periodStart: Date, periodEnd: Date) {
  const [halls, accountants] = await Promise.all([
    prisma.hall.findMany(),
    prisma.user.findMany({ where: { role: "ACCOUNTANT" } }),
  ]);

  const summaries = await Promise.all(
    halls.map((h) => buildHallUsageSummary(h.id, periodStart, periodEnd))
  );

  const totalLeagueHours = summaries.reduce((s, x) => s + x.leagueHours, 0);
  const totalTrainingHours = summaries.reduce((s, x) => s + x.trainingHours, 0);

  const rows = summaries
    .map(
      (s) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${s.hallName}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${s.leagueGames}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${s.leagueHours.toFixed(1)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${s.trainingBookings}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${s.trainingHours.toFixed(1)}</td>
      </tr>`
    )
    .join("");

  const html = `<div dir="rtl" style="font-family:sans-serif">
    <h2>דוח חודשי מרוכז - כלל האולמות</h2>
    <p>התקופה: ${fmtDate(periodStart)} – ${fmtDate(periodEnd)}</p>
    <p>סה"כ ${totalLeagueHours.toFixed(1)} שעות ליגה, ${totalTrainingHours.toFixed(1)} שעות אימונים.</p>
    <table style="border-collapse:collapse;width:100%;margin-top:12px">
      <thead>
        <tr style="background:#f1f5f9">
          <th style="padding:6px 10px;text-align:right">אולם</th>
          <th style="padding:6px 10px;text-align:right">משחקי ליגה</th>
          <th style="padding:6px 10px;text-align:right">שעות ליגה</th>
          <th style="padding:6px 10px;text-align:right">שריוני אימון</th>
          <th style="padding:6px 10px;text-align:right">שעות אימונים</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;

  const results: { recipient: string; success: boolean; error?: string }[] = [];
  for (const accountant of accountants) {
    try {
      await sendEmail({ to: accountant.email, subject: "דוח חודשי - ניהול אולמות", html });
      await prisma.reportLog.create({
        data: { type: "MONTHLY_ACCOUNTING", periodStart, periodEnd, recipient: accountant.email, success: true },
      });
      results.push({ recipient: accountant.email, success: true });
    } catch (err) {
      const errorMessage = (err as Error).message;
      await prisma.reportLog.create({
        data: {
          type: "MONTHLY_ACCOUNTING",
          periodStart,
          periodEnd,
          recipient: accountant.email,
          success: false,
          errorMessage,
        },
      });
      results.push({ recipient: accountant.email, success: false, error: errorMessage });
    }
  }

  return results;
}

export { buildHallUsageSummary, renderHallUsageHtml };
