import test from "node:test";
import assert from "node:assert/strict";
import {
  getMissingBillingPersistenceEnvVars,
  getMissingBillingEnvVars,
  isBillingPortalLocalTestEnabled,
  mapStripeEventToBillingSnapshot,
  mapStripeEventToBillingResult,
  resolveBillingPlanTier,
} from "../src/lib/billing";

test("resolveBillingPlanTier gives lifetime precedence", () => {
  assert.equal(
    resolveBillingPlanTier({
      planTier: "pro",
      subscriptionStatus: "canceled",
      lifetimePurchasedAt: "2026-06-18T00:00:00.000Z",
    }),
    "lifetime",
  );
});

test("resolveBillingPlanTier maps active subscriptions to pro", () => {
  assert.equal(resolveBillingPlanTier({ subscriptionStatus: "active" }), "pro");
  assert.equal(resolveBillingPlanTier({ subscriptionStatus: "trialing" }), "pro");
  assert.equal(resolveBillingPlanTier({ subscriptionStatus: "canceled" }), "freeAccount");
});

test("billing env helper requires Stripe secret and webhook secret", () => {
  assert.deepEqual(getMissingBillingEnvVars({}), [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ]);
  assert.deepEqual(
    getMissingBillingEnvVars({
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
    }),
    [],
  );
});

test("billing persistence env helper requires Convex and webhook sync secret", () => {
  assert.deepEqual(
    getMissingBillingPersistenceEnvVars({
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
    }),
    ["NEXT_PUBLIC_CONVEX_URL", "DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET"],
  );
  assert.deepEqual(
    getMissingBillingPersistenceEnvVars({
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      NEXT_PUBLIC_CONVEX_URL: "https://convex.test",
      DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    }),
    [],
  );
});

test("billing portal local test mode is explicit", () => {
  assert.equal(isBillingPortalLocalTestEnabled({}), false);
  assert.equal(
    isBillingPortalLocalTestEnabled({
      DENOMINATED_ENABLE_LOCAL_BILLING_TESTS: "true",
    }),
    true,
  );
});

test("Stripe checkout session events map to entitlement actions", () => {
  const result = mapStripeEventToBillingResult({
    type: "checkout.session.completed",
    data: {
      object: {
        customer: "cus_123",
        subscription: "sub_123",
        metadata: {
          entitlement_tier: "lifetime",
        },
      },
    },
  } as never);

  assert.equal(result.action, "grant-lifetime");
  assert.equal(result.planTier, "lifetime");
  assert.equal(result.stripeCustomerId, "cus_123");
});

test("Stripe checkout session maps to a durable lifetime billing snapshot", () => {
  const snapshot = mapStripeEventToBillingSnapshot(
    {
      id: "evt_123",
      type: "checkout.session.completed",
      created: 1790000000,
      data: {
        object: {
          customer: "cus_123",
          customer_email: "USER@Example.COM",
          metadata: {
            entitlement_tier: "lifetime",
            stripe_price_id: "price_lifetime",
          },
        },
      },
    } as never,
    new Date("2026-06-27T12:00:00.000Z"),
  );

  assert.deepEqual(snapshot, {
    stripeEventId: "evt_123",
    stripeEventType: "checkout.session.completed",
    lastWebhookAction: "grant-lifetime",
    billingUpdatedAt: "2026-06-27T12:00:00.000Z",
    planTier: "lifetime",
    email: "user@example.com",
    stripeCustomerId: "cus_123",
    stripePriceId: "price_lifetime",
    lifetimePurchasedAt: "2026-09-21T14:13:20.000Z",
  });
});

test("Stripe subscription updates map status and period fields", () => {
  const snapshot = mapStripeEventToBillingSnapshot(
    {
      id: "evt_sub",
      type: "customer.subscription.updated",
      created: 1790000000,
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          current_period_end: 1791000000,
          cancel_at_period_end: true,
          items: {
            data: [
              {
                price: {
                  id: "price_monthly",
                },
              },
            ],
          },
        },
      },
    } as never,
    new Date("2026-06-27T12:00:00.000Z"),
  );

  assert.equal(snapshot?.planTier, "pro");
  assert.equal(snapshot?.stripeCustomerId, "cus_123");
  assert.equal(snapshot?.stripeSubscriptionId, "sub_123");
  assert.equal(snapshot?.stripePriceId, "price_monthly");
  assert.equal(snapshot?.subscriptionStatus, "active");
  assert.equal(snapshot?.currentPeriodEnd, "2026-10-03T04:00:00.000Z");
  assert.equal(snapshot?.cancelAtPeriodEnd, true);
});
