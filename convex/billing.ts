import { v, type Infer } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import { planTierValidator, subscriptionStatusValidator } from "./schema";

const billingSnapshotFields = {
  stripeCustomerId: v.optional(v.string()),
  email: v.optional(v.string()),
  planTier: planTierValidator,
  stripeSubscriptionId: v.optional(v.string()),
  stripePriceId: v.optional(v.string()),
  subscriptionStatus: v.optional(subscriptionStatusValidator),
  currentPeriodEnd: v.optional(v.string()),
  cancelAtPeriodEnd: v.optional(v.boolean()),
  lifetimePurchasedAt: v.optional(v.string()),
  billingUpdatedAt: v.string(),
  stripeEventId: v.string(),
  stripeEventType: v.string(),
  lastWebhookAction: v.string(),
};

const billingSnapshotValidator = v.object(billingSnapshotFields);
type BillingWebhookSnapshot = Infer<typeof billingSnapshotValidator>;

export const syncFromStripeWebhook = mutation({
  args: {
    syncSecret: v.string(),
    snapshot: billingSnapshotValidator,
  },
  handler: async (ctx, args) => {
    assertWebhookSyncSecret(args.syncSecret);

    if (!args.snapshot.stripeCustomerId && !args.snapshot.email) {
      throw new Error("Stripe billing snapshot requires a customer ID or email.");
    }

    const now = Date.now();
    const existingByEvent = await ctx.db
      .query("billingSnapshots")
      .withIndex("by_stripeEventId", (q) =>
        q.eq("stripeEventId", args.snapshot.stripeEventId),
      )
      .unique();

    if (existingByEvent) {
      return {
        billingSnapshotId: existingByEvent._id,
        accountId: await patchMatchingAccount(ctx, args.snapshot, now),
        duplicate: true,
      };
    }

    const existingSnapshot = await findExistingBillingSnapshot(
      ctx,
      args.snapshot.stripeCustomerId,
      args.snapshot.email,
    );

    const billingSnapshotId = existingSnapshot
      ? existingSnapshot._id
      : await ctx.db.insert("billingSnapshots", {
          ...args.snapshot,
          createdAt: now,
          updatedAt: now,
        });

    if (existingSnapshot) {
      await ctx.db.patch(existingSnapshot._id, {
        ...args.snapshot,
        updatedAt: now,
      });
    }

    return {
      billingSnapshotId,
      accountId: await patchMatchingAccount(ctx, args.snapshot, now),
      duplicate: false,
    };
  },
});

function assertWebhookSyncSecret(syncSecret: string) {
  const expectedSecret =
    process.env.DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET ??
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!expectedSecret) {
    throw new Error("Convex Stripe webhook sync secret is not configured.");
  }

  if (syncSecret !== expectedSecret) {
    throw new Error("Invalid Stripe webhook sync secret.");
  }
}

async function findExistingBillingSnapshot(
  ctx: MutationCtx,
  stripeCustomerId: string | undefined,
  email: string | undefined,
) {
  if (stripeCustomerId) {
    const byCustomer = await ctx.db
      .query("billingSnapshots")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", stripeCustomerId),
      )
      .unique();

    if (byCustomer) return byCustomer;
  }

  if (!email) return null;

  return await ctx.db
    .query("billingSnapshots")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
}

async function patchMatchingAccount(
  ctx: MutationCtx,
  snapshot: BillingWebhookSnapshot,
  now: number,
) {
  const account = await findMatchingAccount(
    ctx,
    snapshot.stripeCustomerId,
    snapshot.email,
  );

  if (!account) {
    return null;
  }

  await ctx.db.patch(account._id, {
    planTier: snapshot.planTier,
    stripeCustomerId: snapshot.stripeCustomerId ?? account.stripeCustomerId,
    stripeSubscriptionId: snapshot.stripeSubscriptionId,
    stripePriceId: snapshot.stripePriceId,
    subscriptionStatus: snapshot.subscriptionStatus,
    currentPeriodEnd: snapshot.currentPeriodEnd,
    cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
    lifetimePurchasedAt:
      snapshot.lifetimePurchasedAt ?? account.lifetimePurchasedAt,
    billingUpdatedAt: snapshot.billingUpdatedAt,
    updatedAt: now,
  });

  return account._id;
}

async function findMatchingAccount(
  ctx: MutationCtx,
  stripeCustomerId: string | undefined,
  email: string | undefined,
) {
  if (stripeCustomerId) {
    const byCustomer = await ctx.db
      .query("accounts")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", stripeCustomerId),
      )
      .take(2);

    if (byCustomer.length === 1) return byCustomer[0];
  }

  if (!email) return null;

  const byEmail = await ctx.db
    .query("accounts")
    .withIndex("by_email", (q) => q.eq("email", email))
    .take(2);

  return byEmail.length === 1 ? byEmail[0] : null;
}
