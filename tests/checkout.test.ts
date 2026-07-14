import test from "node:test";
import assert from "node:assert/strict";
import {
  getCheckoutPlan,
  getCheckoutAccountConflict,
  getCheckoutPriceId,
  getMissingAuthenticatedCheckoutEnvVars,
  getMissingCheckoutEnvVars,
  getStripeAutomaticTaxConfig,
  isPaidCheckoutEnabled,
  parseCheckoutPlanId,
  paidCheckoutEnabledEnvVar,
  stripeAutomaticTaxEnabledEnvVar,
} from "../src/lib/checkout";

test("parseCheckoutPlanId accepts known checkout plans only", () => {
  assert.equal(parseCheckoutPlanId("proMonthly"), "proMonthly");
  assert.equal(parseCheckoutPlanId("proAnnual"), "proAnnual");
  assert.equal(parseCheckoutPlanId("lifetime"), "lifetime");
  assert.equal(parseCheckoutPlanId("enterprise"), null);
  assert.equal(parseCheckoutPlanId(null), null);
});

test("checkout plans map to Stripe modes and entitlement tiers", () => {
  assert.equal(getCheckoutPlan("proMonthly").mode, "subscription");
  assert.equal(getCheckoutPlan("proAnnual").mode, "subscription");
  assert.equal(getCheckoutPlan("lifetime").mode, "payment");
  assert.equal(getCheckoutPlan("lifetime").tier, "lifetime");
});

test("checkout env helpers resolve configured and missing values", () => {
  const plan = getCheckoutPlan("proMonthly");
  const env = {
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
  };

  assert.equal(getCheckoutPriceId(plan, env), "price_monthly");
  assert.deepEqual(getMissingCheckoutEnvVars(plan, env), []);
  assert.deepEqual(getMissingCheckoutEnvVars(plan, {}), [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
  ]);
});

test("authenticated checkout env helper requires auth, storage, and Stripe", () => {
  const plan = getCheckoutPlan("proAnnual");

  assert.deepEqual(getMissingAuthenticatedCheckoutEnvVars(plan, {}), [
    "CLERK_SECRET_KEY",
    "CLERK_JWT_ISSUER_DOMAIN",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_CONVEX_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRO_ANNUAL_PRICE_ID",
  ]);
  assert.deepEqual(
    getMissingAuthenticatedCheckoutEnvVars(plan, {
      CLERK_SECRET_KEY: "sk_test_clerk",
      CLERK_JWT_ISSUER_DOMAIN: "https://clerk.test",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_clerk",
      NEXT_PUBLIC_CONVEX_URL: "https://convex.test",
      STRIPE_SECRET_KEY: "sk_test_stripe",
      STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
    }),
    [],
  );
});

test("paid checkout requires an explicit launch flag", () => {
  assert.equal(isPaidCheckoutEnabled({}), false);
  assert.equal(
    isPaidCheckoutEnabled({
      [paidCheckoutEnabledEnvVar]: "true",
    }),
    true,
  );
  assert.equal(
    isPaidCheckoutEnabled({
      [paidCheckoutEnabledEnvVar]: "false",
    }),
    false,
  );
});

test("Stripe automatic tax accepts only an explicit boolean decision", () => {
  assert.deepEqual(
    getStripeAutomaticTaxConfig({
      [stripeAutomaticTaxEnabledEnvVar]: "true",
    }),
    { enabled: true },
  );
  assert.deepEqual(
    getStripeAutomaticTaxConfig({
      [stripeAutomaticTaxEnabledEnvVar]: " FALSE ",
    }),
    { enabled: false },
  );
  assert.equal(getStripeAutomaticTaxConfig({}), null);
  assert.equal(
    getStripeAutomaticTaxConfig({
      [stripeAutomaticTaxEnabledEnvVar]: "yes",
    }),
    null,
  );
});

test("active Pro accounts cannot start duplicate subscriptions", () => {
  assert.deepEqual(
    getCheckoutAccountConflict(getCheckoutPlan("proMonthly"), {
      planTier: "pro",
      subscriptionStatus: "active",
    }),
    {
      code: "ACTIVE_SUBSCRIPTION_EXISTS",
      error:
        "This account already has an active Pro subscription. Manage it from billing instead of starting another subscription.",
    },
  );
  assert.equal(
    getCheckoutAccountConflict(getCheckoutPlan("lifetime"), {
      planTier: "pro",
      subscriptionStatus: "active",
    }),
    null,
  );
});

test("past-due accounts can recover through a new Pro checkout", () => {
  assert.equal(
    getCheckoutAccountConflict(getCheckoutPlan("proAnnual"), {
      planTier: "freeAccount",
      subscriptionStatus: "past_due",
    }),
    null,
  );
});

test("Lifetime accounts cannot purchase another paid plan", () => {
  assert.equal(
    getCheckoutAccountConflict(getCheckoutPlan("proAnnual"), {
      planTier: "lifetime",
    })?.code,
    "LIFETIME_ACCESS_EXISTS",
  );
  assert.equal(
    getCheckoutAccountConflict(getCheckoutPlan("lifetime"), {
      planTier: "lifetime",
    })?.code,
    "LIFETIME_ACCESS_EXISTS",
  );
});
