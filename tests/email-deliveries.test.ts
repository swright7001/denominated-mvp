import test from "node:test";
import assert from "node:assert/strict";
import {
  getWeeklyDeliveryRetryDecision,
  getWeeklyReportEligibility,
} from "../convex/emailDeliveries";

test("weekly reports require Pro or Lifetime, email, and opt-in", () => {
  assert.deepEqual(
    getWeeklyReportEligibility({
      planTier: "freeAccount",
      email: "user@example.com",
      emailPreferences: { weeklyReport: true },
    }),
    { allowed: false, code: "PRO_REQUIRED" },
  );
  assert.deepEqual(
    getWeeklyReportEligibility({
      planTier: "pro",
      email: "user@example.com",
      emailPreferences: { weeklyReport: false },
    }),
    { allowed: false, code: "WEEKLY_REPORT_DISABLED" },
  );
  assert.deepEqual(
    getWeeklyReportEligibility({
      planTier: "lifetime",
      email: "user@example.com",
      emailPreferences: { weeklyReport: true },
    }),
    { allowed: true },
  );
});

test("weekly delivery dedupe allows bounded retries only", () => {
  const now = Date.parse("2026-07-11T12:00:00Z");
  assert.deepEqual(
    getWeeklyDeliveryRetryDecision(
      { status: "sent", attempts: 1, updatedAt: now },
      now,
    ),
    { allowed: false, code: "ALREADY_SENT" },
  );
  assert.deepEqual(
    getWeeklyDeliveryRetryDecision(
      { status: "processing", attempts: 1, updatedAt: now - 1000 },
      now,
    ),
    { allowed: false, code: "ALREADY_PROCESSING" },
  );
  assert.deepEqual(
    getWeeklyDeliveryRetryDecision(
      { status: "failed", attempts: 2, updatedAt: now - 1000 },
      now,
    ),
    { allowed: true },
  );
  assert.deepEqual(
    getWeeklyDeliveryRetryDecision(
      { status: "failed", attempts: 3, updatedAt: now - 1000 },
      now,
    ),
    { allowed: false, code: "RETRY_LIMIT_REACHED" },
  );
});
