import test from "node:test";
import assert from "node:assert/strict";
import {
  getMissingBillingEnvVars,
  isBillingPortalLocalTestEnabled,
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
