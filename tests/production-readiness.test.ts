import test from "node:test";
import assert from "node:assert/strict";
import {
  getMissingPaidLaunchEnvVars,
  getProductionReadinessChecks,
  isPaidLaunchReady,
} from "../src/lib/production-readiness";

test("paid launch readiness reports missing provider env vars", () => {
  const checks = getProductionReadinessChecks({});
  const authCheck = checks.find((check) => check.id === "auth");

  assert.equal(authCheck?.status, "missing");
  assert.deepEqual(authCheck?.missingEnvVars, [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ]);
  assert.equal(isPaidLaunchReady({}), false);
});

test("paid launch readiness passes environment checks when providers are configured", () => {
  const env = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
    CLERK_SECRET_KEY: "sk_test_123",
    CONVEX_DEPLOYMENT: "dev:denominated",
    NEXT_PUBLIC_CONVEX_URL: "https://convex.test",
    CLERK_JWT_ISSUER_DOMAIN: "https://clerk.test",
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
    STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
    STRIPE_LIFETIME_PRICE_ID: "price_lifetime",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    RESEND_API_KEY: "re_123",
    NEXT_PUBLIC_APP_URL: "https://denominated.app",
  };

  assert.equal(getMissingPaidLaunchEnvVars(env).length, 0);
  assert.equal(isPaidLaunchReady(env), true);
});
