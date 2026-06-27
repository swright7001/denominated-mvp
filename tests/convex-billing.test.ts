import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountBillingPatch } from "../convex/billing";

test("Convex billing patch preserves lifetime when subscription events downgrade", () => {
  const patch = buildAccountBillingPatch(
    {
      planTier: "lifetime",
      stripeCustomerId: "cus_lifetime",
      lifetimePurchasedAt: "2026-06-27T12:00:00.000Z",
    },
    {
      planTier: "freeAccount",
      stripeCustomerId: "cus_lifetime",
      stripeSubscriptionId: "sub_cancelled",
      subscriptionStatus: "canceled",
      billingUpdatedAt: "2026-06-28T12:00:00.000Z",
      stripeEventId: "evt_cancelled",
      stripeEventType: "customer.subscription.deleted",
      lastWebhookAction: "sync-subscription",
    },
    1790000000000,
  );

  assert.equal(patch.planTier, "lifetime");
  assert.equal(patch.lifetimePurchasedAt, "2026-06-27T12:00:00.000Z");
  assert.equal(patch.subscriptionStatus, "canceled");
});

test("Convex billing patch grants lifetime from a lifetime checkout snapshot", () => {
  const patch = buildAccountBillingPatch(
    {
      planTier: "freeAccount",
      stripeCustomerId: "cus_123",
    },
    {
      planTier: "lifetime",
      stripeCustomerId: "cus_123",
      stripePriceId: "price_lifetime",
      lifetimePurchasedAt: "2026-06-27T12:00:00.000Z",
      billingUpdatedAt: "2026-06-27T12:01:00.000Z",
      stripeEventId: "evt_lifetime",
      stripeEventType: "checkout.session.completed",
      lastWebhookAction: "grant-lifetime",
    },
    1790000000000,
  );

  assert.equal(patch.planTier, "lifetime");
  assert.equal(patch.lifetimePurchasedAt, "2026-06-27T12:00:00.000Z");
  assert.equal(patch.stripePriceId, "price_lifetime");
});
