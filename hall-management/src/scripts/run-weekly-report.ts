import { sendHallUsageReports } from "../lib/reports";

const periodEnd = new Date();
const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

sendHallUsageReports(periodStart, periodEnd)
  .then((results) => {
    console.log("דוחות שימוש שבועיים נשלחו:", results);
    process.exit(0);
  })
  .catch((err) => {
    console.error("שליחת דוחות שימוש נכשלה:", err);
    process.exit(1);
  });
