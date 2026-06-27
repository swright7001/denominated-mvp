import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  emailPreferencesValidator,
  planTierValidator,
  subscriptionStatusValidator,
} from "./schema";

const defaultEmailPreferences = {
  weeklyReport: true,
  scenarioUpdates: true,
  educationLessons: true,
  popularExamples: true,
};

async function requireOwnerTokenIdentifier(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Sign in to use Denominated account storage.");
  }

  return identity.tokenIdentifier;
}

export const getViewerAccount = query({
  args: {},
  handler: async (ctx) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);

    return await ctx.db
      .query("accounts")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", ownerTokenIdentifier),
      )
      .unique();
  },
});

export const ensureViewerAccount = mutation({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", ownerTokenIdentifier),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email ?? existing.email,
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("accounts", {
      ownerTokenIdentifier,
      email: args.email,
      planTier: "freeAccount",
      emailPreferences: defaultEmailPreferences,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateEmailPreferences = mutation({
  args: {
    preferences: emailPreferencesValidator,
  },
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", ownerTokenIdentifier),
      )
      .unique();

    if (!account) {
      throw new Error("Create an account before updating email preferences.");
    }

    await ctx.db.patch(account._id, {
      emailPreferences: args.preferences,
      updatedAt: Date.now(),
    });

    return account._id;
  },
});

export const updateBillingSnapshot = mutation({
  args: {
    planTier: planTierValidator,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    subscriptionStatus: v.optional(subscriptionStatusValidator),
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    lifetimePurchasedAt: v.optional(v.string()),
    billingUpdatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", ownerTokenIdentifier),
      )
      .unique();

    if (!account) {
      throw new Error("Create an account before updating billing state.");
    }

    const lifetimePurchasedAt =
      args.lifetimePurchasedAt ?? account.lifetimePurchasedAt;
    const ownsLifetime =
      Boolean(lifetimePurchasedAt) || account.planTier === "lifetime";

    await ctx.db.patch(account._id, {
      ...args,
      planTier: ownsLifetime ? "lifetime" : args.planTier,
      lifetimePurchasedAt,
      updatedAt: Date.now(),
    });

    return account._id;
  },
});
