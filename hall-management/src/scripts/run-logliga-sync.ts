import { syncLogligaSchedule } from "../lib/logliga/sync";

syncLogligaSchedule()
  .then((result) => {
    console.log("סנכרון לוגליג הושלם:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("סנכרון לוגליג נכשל:", err);
    process.exit(1);
  });
