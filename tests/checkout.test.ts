import test from "node:test";
import assert from "node:assert/strict";
import {
  getCheckoutPlan,
  getCheckoutPriceId,
  getMissingCheckoutEnvVars,
  isPaidCheckoutEnabled,
  parseCheckoutPlanId,
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

test("paid checkout requires an explicit launch flag", () => {
  assert.equal(isPaidCheckoutEnabled({}), false);
  assert.equal(
    isPaidCheckoutEnabled({ DENOMINATED_ENABLE_PAID_CHECKOUT: "false" }),
    false,
  );
  assert.equal(
    isPaidCheckoutEnabled({ DENOMINATED_ENABLE_PAID_CHECKOUT: "true" }),
    true,
  );
});
