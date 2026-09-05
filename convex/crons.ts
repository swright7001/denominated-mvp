import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
// Monday 13:00 UTC (09:00 EDT / 08:00 EST).
crons.cron(
  "weekly purchasing-power reports",
  "0 13 * * 1",
  internal.weeklyReports.enqueue,
  {},
);
export default crons;
