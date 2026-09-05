import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  getWeeklyReportEligibility,
  getWeeklyDeliveryRetryDecision,
} from "./emailDeliveries";
import { getWeeklyReportPeriodKey } from "../src/lib/weekly-report-email";
import { normalizeEmail } from "../src/lib/account";
import { scenarioInputValidator } from "./schema";

export const enqueue = internalMutation({
  args: { cursor: v.optional(v.string()), periodKey: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (process.env.DENOMINATED_ENABLE_RECURRING_EMAIL !== "true") return null;
    const periodKey = args.periodKey ?? getWeeklyReportPeriodKey();
    if (periodKey !== getWeeklyReportPeriodKey()) return null;
    const page = await ctx.db
      .query("accounts")
      .withIndex("by_weeklyReportSubscribed", (q) =>
        q.eq("weeklyReportSubscribed", true),
      )
      .paginate({ numItems: 25, cursor: args.cursor ?? null });
    for (const [index, account] of page.page.entries()) {
      if (getWeeklyReportEligibility(account).allowed) {
        await ctx.scheduler.runAfter(
          index * 2000,
          internal.weeklyReportDelivery.send,
          {
            accountId: account._id,
            periodKey,
          },
        );
      }
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(50000, internal.weeklyReports.enqueue, {
        cursor: page.continueCursor,
        periodKey,
      });
    }
    return null;
  },
});

export const getRecipient = internalQuery({
  args: { accountId: v.id("accounts") },
  returns: v.union(
    v.null(),
    v.object({ owner: v.string(), email: v.string() }),
  ),
  handler: async (ctx, { accountId }) => {
    const account = await ctx.db.get(accountId);
    if (
      !account?.weeklyReportSubscribed ||
      !getWeeklyReportEligibility(account).allowed
    )
      return null;
    return { owner: account.ownerTokenIdentifier, email: account.email! };
  },
});

// A single transaction rechecks consent, address, entitlement and the shared
// manual/scheduled delivery record immediately before reserving the send.
export const reserve = internalMutation({
  args: {
    accountId: v.id("accounts"),
    periodKey: v.string(),
    verifiedEmail: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({ deliveryId: v.id("emailDeliveries"), attempt: v.number() }),
  ),
  handler: async (ctx, args) => {
    if (
      process.env.DENOMINATED_ENABLE_RECURRING_EMAIL !== "true" ||
      args.periodKey !== getWeeklyReportPeriodKey()
    )
      return null;
    const account = await ctx.db.get(args.accountId);
    if (
      !account?.weeklyReportSubscribed ||
      !getWeeklyReportEligibility(account).allowed ||
      normalizeEmail(account.email!) !== normalizeEmail(args.verifiedEmail)
    )
      return null;
    const existing = await ctx.db
      .query("emailDeliveries")
      .withIndex("by_ownerTokenIdentifier_and_kind_and_periodKey", (q) =>
        q
          .eq("ownerTokenIdentifier", account.ownerTokenIdentifier)
          .eq("kind", "weekly-report")
          .eq("periodKey", args.periodKey),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      // Resend retains idempotency keys for 24 hours. Never replay an ambiguous
      // send after that window, including when a user requested it manually.
      if (
        now - existing.createdAt >= 23 * 60 * 60 * 1000 ||
        !getWeeklyDeliveryRetryDecision(existing, now).allowed
      )
        return null;
      const attempt = existing.attempts + 1;
      await ctx.db.patch(existing._id, {
        status: "processing",
        attempts: attempt,
        updatedAt: now,
        failureCode: undefined,
      });
      return { deliveryId: existing._id, attempt };
    }
    const deliveryId = await ctx.db.insert("emailDeliveries", {
      ownerTokenIdentifier: account.ownerTokenIdentifier,
      kind: "weekly-report",
      periodKey: args.periodKey,
      status: "processing",
      attempts: 1,
      createdAt: now,
      updatedAt: now,
    });
    return { deliveryId, attempt: 1 };
  },
});

export const finish = internalMutation({
  args: {
    deliveryId: v.id("emailDeliveries"),
    attempt: v.number(),
    messageId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId);
    if (
      !delivery ||
      delivery.status !== "processing" ||
      delivery.attempts !== args.attempt
    )
      return null;
    await ctx.db.patch(delivery._id, {
      status: args.messageId ? "sent" : "failed",
      providerMessageId: args.messageId,
      failureCode: args.messageId ? undefined : "SCHEDULED_DELIVERY_FAILED",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const scenarios = internalQuery({
  args: { accountId: v.id("accounts") },
  returns: v.array(
    v.object({
      scenario: scenarioInputValidator,
      baselineItemCostBTC: v.number(),
    }),
  ),
  handler: async (ctx, { accountId }) => {
    const account = await ctx.db.get(accountId);
    if (
      !account?.weeklyReportSubscribed ||
      !getWeeklyReportEligibility(account).allowed
    )
      return [];
    const saved = await ctx.db
      .query("savedScenarios")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", account.ownerTokenIdentifier),
      )
      .order("desc")
      .take(20);
    return saved.map(({ scenario, baselineItemCostBTC }) => ({
      scenario,
      baselineItemCostBTC,
    }));
  },
});
