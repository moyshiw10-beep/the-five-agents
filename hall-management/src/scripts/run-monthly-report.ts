import { sendMonthlyAccountingReport } from "../lib/reports";

const now = new Date();
const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const periodEnd = new Date(now.getFullYear(), now.getMonth(), 1);

sendMonthlyAccountingReport(periodStart, periodEnd)
  .then((results) => {
    console.log("דוח חודשי נשלח:", results);
    process.exit(0);
  })
  .catch((err) => {
    console.error("שליחת הדוח החודשי נכשלה:", err);
    process.exit(1);
  });
