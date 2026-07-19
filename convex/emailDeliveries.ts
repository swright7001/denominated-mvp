import { ConvexError, v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;

async function getViewerAccount(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({ code: "ACCOUNT_REQUIRED" });
  }

  const account = await ctx.db
    .query("accounts")
    .withIndex("by_ownerTokenIdentifier", (q) =>
      q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (!account) {
    throw new ConvexError({ code: "ACCOUNT_REQUIRED" });
  }

  return { account, ownerTokenIdentifier: identity.tokenIdentifier };
}

export const reserveWeeklyReport = mutation({
  args: { periodKey: v.string() },
  handler: async (ctx, args) => {
    if (!/^\d{4}-W\d{2}$/.test(args.periodKey)) {
      throw new ConvexError({ code: "INVALID_PERIOD" });
    }

    const { account, ownerTokenIdentifier } = await getViewerAccount(ctx);
    const eligibility = getWeeklyReportEligibility(account);

    if (!eligibility.allowed) {
      throw new ConvexError({ code: eligibility.code });
    }

    const existing = await ctx.db
      .query("emailDeliveries")
      .withIndex("by_ownerTokenIdentifier_and_kind_and_periodKey", (q) =>
        q
          .eq("ownerTokenIdentifier", ownerTokenIdentifier)
          .eq("kind", "weekly-report")
          .eq("periodKey", args.periodKey),
      )
      .unique();
    const now = Date.now();

    if (existing) {
      const decision = getWeeklyDeliveryRetryDecision(existing, now);

      if (!decision.allowed) {
        throw new ConvexError({ code: decision.code });
      }

      await ctx.db.patch(existing._id, {
        status: "processing",
        attempts: existing.attempts + 1,
        failureCode: undefined,
        updatedAt: now,
      });

      return { deliveryId: existing._id, email: account.email! };
    }

    const deliveryId = await ctx.db.insert("emailDeliveries", {
      ownerTokenIdentifier,
      kind: "weekly-report",
      periodKey: args.periodKey,
      status: "processing",
      attempts: 1,
      createdAt: now,
      updatedAt: now,
    });

    return { deliveryId, email: account.email! };
  },
});

export const completeWeeklyReport = mutation({
  args: {
    deliveryId: v.id("emailDeliveries"),
    providerMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerTokenIdentifier } = await getViewerAccount(ctx);
    const delivery = await ctx.db.get(args.deliveryId);

    if (!delivery || delivery.ownerTokenIdentifier !== ownerTokenIdentifier) {
      throw new ConvexError({ code: "DELIVERY_NOT_FOUND" });
    }

    await ctx.db.patch(delivery._id, {
      status: "sent",
      providerMessageId: args.providerMessageId,
      failureCode: undefined,
      updatedAt: Date.now(),
    });

    return delivery._id;
  },
});

export const failWeeklyReport = mutation({
  args: {
    deliveryId: v.id("emailDeliveries"),
    failureCode: v.string(),
  },
  handler: async (ctx, args) => {
    const { ownerTokenIdentifier } = await getViewerAccount(ctx);
    const delivery = await ctx.db.get(args.deliveryId);

    if (!delivery || delivery.ownerTokenIdentifier !== ownerTokenIdentifier) {
      throw new ConvexError({ code: "DELIVERY_NOT_FOUND" });
    }

    await ctx.db.patch(delivery._id, {
      status: "failed",
      failureCode: args.failureCode.slice(0, 80),
      updatedAt: Date.now(),
    });

    return delivery._id;
  },
});

type WeeklyReportAccount = {
  email?: string;
  planTier: "freeAccount" | "pro" | "lifetime";
  emailPreferences: { weeklyReport: boolean };
};

export function getWeeklyReportEligibility(account: WeeklyReportAccount) {
  if (account.planTier !== "pro" && account.planTier !== "lifetime") {
    return { allowed: false as const, code: "PRO_REQUIRED" };
  }

  if (!account.email?.trim()) {
    return { allowed: false as const, code: "EMAIL_REQUIRED" };
  }

  if (!account.emailPreferences.weeklyReport) {
    return { allowed: false as const, code: "WEEKLY_REPORT_DISABLED" };
  }

  return { allowed: true as const };
}

type ExistingDelivery = {
  status: "processing" | "sent" | "failed";
  attempts: number;
  updatedAt: number;
};

export function getWeeklyDeliveryRetryDecision(
  delivery: ExistingDelivery,
  now = Date.now(),
) {
  if (delivery.status === "sent") {
    return { allowed: false as const, code: "ALREADY_SENT" };
  }

  if (
    delivery.status === "processing" &&
    now - delivery.updatedAt < PROCESSING_TIMEOUT_MS
  ) {
    return { allowed: false as const, code: "ALREADY_PROCESSING" };
  }

  if (delivery.attempts >= 3) {
    return { allowed: false as const, code: "RETRY_LIMIT_REACHED" };
  }

  return { allowed: true as const };
}
