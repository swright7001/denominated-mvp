import test from "node:test";
import assert from "node:assert/strict";
import {
  getMissingPaidLaunchEnvVars,
  getPaidPreviewReadinessSummary,
  getPaidPreviewVerificationChecks,
  getProductionReadinessChecks,
  isPaidPreviewProviderSetupReady,
  isPaidLaunchReady,
  shouldBlockProductionPaidCheckout,
} from "../src/lib/production-readiness";

const paidLaunchDecisionEnv = {
  DENOMINATED_STRIPE_BRANDING_CONFIRMED: "true",
  DENOMINATED_LEGAL_SIGNOFF: "true",
  DENOMINATED_OPERATOR_NAME: "Denominated test operator",
  DENOMINATED_LEGAL_EFFECTIVE_DATE: "2026-07-10",
  DENOMINATED_GOVERNING_JURISDICTION: "Test jurisdiction",
  DENOMINATED_REFUND_WINDOW_DAYS: "14",
  DENOMINATED_TAX_SIGNOFF: "true",
  DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED: "false",
  DENOMINATED_SUPPORT_EMAIL: "support@getdenominated.com",
  DENOMINATED_SUPPORT_EMAIL_VERIFIED: "true",
  NEXT_PUBLIC_SUPPORT_URL: "https://example.test/support",
};

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
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_123",
    CLERK_SECRET_KEY: "sk_live_123",
    CONVEX_DEPLOYMENT: "prod:denominated",
    NEXT_PUBLIC_CONVEX_URL: "https://convex.example.test",
    CLERK_JWT_ISSUER_DOMAIN: "https://clerk.example.test",
    STRIPE_SECRET_KEY: "sk_live_123",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
    STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
    STRIPE_LIFETIME_PRICE_ID: "price_lifetime",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    RESEND_API_KEY: "re_123",
    DENOMINATED_EMAIL_FROM: "Denominated <reports@example.test>",
    NEXT_PUBLIC_APP_URL: "https://denominated.app",
    ...paidLaunchDecisionEnv,
  };

  assert.equal(getMissingPaidLaunchEnvVars(env).length, 0);
  assert.equal(isPaidLaunchReady(env), true);
});

test("paid production readiness rejects development and test provider values", () => {
  const env = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
    CLERK_SECRET_KEY: "sk_test_123",
    CONVEX_DEPLOYMENT: "dev:denominated",
    NEXT_PUBLIC_CONVEX_URL: "http://localhost:3210",
    CLERK_JWT_ISSUER_DOMAIN: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
    STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
    STRIPE_LIFETIME_PRICE_ID: "price_lifetime",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    RESEND_API_KEY: "re_123",
    DENOMINATED_EMAIL_FROM: "Denominated <reports@example.test>",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    ...paidLaunchDecisionEnv,
  };

  assert.equal(isPaidLaunchReady(env), false);
  assert.deepEqual(getMissingPaidLaunchEnvVars(env), [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "CONVEX_DEPLOYMENT",
    "NEXT_PUBLIC_CONVEX_URL",
    "CLERK_JWT_ISSUER_DOMAIN",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_APP_URL",
  ]);
});

test("paid production readiness rejects malformed legal and support values", () => {
  const env = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_123",
    CLERK_SECRET_KEY: "sk_live_123",
    CONVEX_DEPLOYMENT: "prod:denominated",
    NEXT_PUBLIC_CONVEX_URL: "https://convex.example.test",
    CLERK_JWT_ISSUER_DOMAIN: "https://clerk.example.test",
    STRIPE_SECRET_KEY: "sk_live_123",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
    STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
    STRIPE_LIFETIME_PRICE_ID: "price_lifetime",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    RESEND_API_KEY: "re_123",
    DENOMINATED_EMAIL_FROM: "Denominated <reports@example.test>",
    NEXT_PUBLIC_APP_URL: "https://denominated.example.test",
    ...paidLaunchDecisionEnv,
    DENOMINATED_LEGAL_EFFECTIVE_DATE: "2026-02-31",
    DENOMINATED_SUPPORT_EMAIL: "not-an-email",
    NEXT_PUBLIC_SUPPORT_URL: "http://localhost:3000/support",
  };

  assert.equal(isPaidLaunchReady(env), false);
  assert.deepEqual(getMissingPaidLaunchEnvVars(env), [
    "DENOMINATED_LEGAL_EFFECTIVE_DATE",
    "DENOMINATED_SUPPORT_EMAIL",
    "DENOMINATED_SUPPORT_EMAIL_VERIFIED",
    "NEXT_PUBLIC_SUPPORT_URL",
  ]);
});

test("paid launch readiness stays false until business decisions are explicit", () => {
  const env = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_123",
    CLERK_SECRET_KEY: "sk_live_123",
    CONVEX_DEPLOYMENT: "prod:denominated",
    NEXT_PUBLIC_CONVEX_URL: "https://convex.example.test",
    CLERK_JWT_ISSUER_DOMAIN: "https://clerk.example.test",
    STRIPE_SECRET_KEY: "sk_live_123",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
    STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
    STRIPE_LIFETIME_PRICE_ID: "price_lifetime",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    RESEND_API_KEY: "re_123",
    DENOMINATED_EMAIL_FROM: "Denominated <reports@example.test>",
    NEXT_PUBLIC_APP_URL: "https://denominated.example.test",
  };

  assert.equal(isPaidLaunchReady(env), false);
  assert.deepEqual(getMissingPaidLaunchEnvVars(env), [
    "DENOMINATED_STRIPE_BRANDING_CONFIRMED",
    "DENOMINATED_LEGAL_SIGNOFF",
    "DENOMINATED_OPERATOR_NAME",
    "DENOMINATED_LEGAL_EFFECTIVE_DATE",
    "DENOMINATED_GOVERNING_JURISDICTION",
    "DENOMINATED_REFUND_WINDOW_DAYS",
    "DENOMINATED_TAX_SIGNOFF",
    "DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED",
    "DENOMINATED_SUPPORT_EMAIL",
    "DENOMINATED_SUPPORT_EMAIL_VERIFIED",
    "NEXT_PUBLIC_SUPPORT_URL",
  ]);
});

test("paid launch readiness requires an explicit Stripe automatic-tax decision", () => {
  const baseEnv = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_123",
    CLERK_SECRET_KEY: "sk_live_123",
    CONVEX_DEPLOYMENT: "prod:denominated",
    NEXT_PUBLIC_CONVEX_URL: "https://convex.example.test",
    CLERK_JWT_ISSUER_DOMAIN: "https://clerk.example.test",
    STRIPE_SECRET_KEY: "sk_live_123",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
    STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
    STRIPE_LIFETIME_PRICE_ID: "price_lifetime",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    RESEND_API_KEY: "re_123",
    DENOMINATED_EMAIL_FROM: "Denominated <reports@example.test>",
    NEXT_PUBLIC_APP_URL: "https://denominated.example.test",
    ...paidLaunchDecisionEnv,
  };

  assert.equal(isPaidLaunchReady(baseEnv), true);
  assert.equal(
    isPaidLaunchReady({
      ...baseEnv,
      DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED: "yes",
    }),
    false,
  );
  assert.deepEqual(
    getMissingPaidLaunchEnvVars({
      ...baseEnv,
      DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED: "",
    }),
    ["DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED"],
  );
});

test("Production checkout fails closed while Preview checkout stays testable", () => {
  assert.equal(
    shouldBlockProductionPaidCheckout({ VERCEL_ENV: "production" }),
    true,
  );
  assert.equal(shouldBlockProductionPaidCheckout({ VERCEL_ENV: "preview" }), false);
  assert.equal(
    shouldBlockProductionPaidCheckout({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_123",
      CLERK_SECRET_KEY: "sk_live_123",
      CONVEX_DEPLOYMENT: "prod:denominated",
      NEXT_PUBLIC_CONVEX_URL: "https://convex.example.test",
      CLERK_JWT_ISSUER_DOMAIN: "https://clerk.example.test",
      STRIPE_SECRET_KEY: "sk_live_123",
      STRIPE_PRO_MONTHLY_PRICE_ID: "price_monthly",
      STRIPE_PRO_ANNUAL_PRICE_ID: "price_annual",
      STRIPE_LIFETIME_PRICE_ID: "price_lifetime",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
      RESEND_API_KEY: "re_123",
      DENOMINATED_EMAIL_FROM: "Denominated <reports@example.test>",
      NEXT_PUBLIC_APP_URL: "https://denominated.example.test",
      ...paidLaunchDecisionEnv,
    }),
    false,
  );
});

test("paid preview readiness keeps checkout disabled until verification starts", () => {
  const checks = getPaidPreviewVerificationChecks({});
  const checkoutFlagCheck = checks.find(
    (check) => check.id === "paid-checkout-flag",
  );
  const previewCheckoutCheck = checks.find(
    (check) => check.id === "preview-pro-checkout",
  );

  assert.equal(checkoutFlagCheck?.status, "ready");
  assert.match(
    checkoutFlagCheck?.details ?? "",
    /Keep it off in Production until the paid launch PR passes Preview verification/,
  );
  assert.equal(previewCheckoutCheck?.status, "manual");
});

test("paid preview readiness warns when checkout flag is already enabled", () => {
  const checks = getPaidPreviewVerificationChecks({
    DENOMINATED_ENABLE_PAID_CHECKOUT: "true",
  });
  const checkoutFlagCheck = checks.find(
    (check) => check.id === "paid-checkout-flag",
  );

  assert.equal(checkoutFlagCheck?.status, "manual");
  assert.match(
    checkoutFlagCheck?.details ?? "",
    /Only keep it enabled while running verified Preview Stripe tests/,
  );
});

test("paid preview provider setup is separate from manual preview verification", () => {
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
    DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    RESEND_API_KEY: "re_123",
    DENOMINATED_EMAIL_FROM: "Denominated <onboarding@resend.dev>",
    NEXT_PUBLIC_APP_URL: "https://preview.denominated.test",
  };

  const checks = getPaidPreviewVerificationChecks(env);

  assert.equal(isPaidPreviewProviderSetupReady(env), true);
  assert.equal(
    checks.some((check) => check.status === "manual"),
    true,
  );
});

test("paid preview readiness summary separates missing providers from manual E2E", () => {
  const summary = getPaidPreviewReadinessSummary({
    VERCEL_ENV: "preview",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
    CLERK_SECRET_KEY: "sk_test_123",
  });

  assert.equal(summary.environment, "preview");
  assert.equal(summary.providerSetupReady, false);
  assert.equal(summary.checkoutFlagEnabled, false);
  assert.deepEqual(summary.readyProviderGroups, ["auth"]);
  assert.deepEqual(
    summary.missingProviderGroups.map((group) => group.id),
    ["storage", "stripe", "webhooks", "email", "app-url"],
  );
  assert.ok(
    summary.manualVerificationGroups.some(
      (group) => group.id === "preview-pro-checkout",
    ),
  );
});

test("paid preview readiness summary reports provider-ready flag state", () => {
  const summary = getPaidPreviewReadinessSummary({
    VERCEL_ENV: "preview",
    DENOMINATED_ENABLE_PAID_CHECKOUT: "true",
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
    DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET: "sync_123",
    RESEND_API_KEY: "re_123",
    DENOMINATED_EMAIL_FROM: "Denominated <onboarding@resend.dev>",
    NEXT_PUBLIC_APP_URL: "https://preview.denominated.test",
  });

  assert.equal(summary.providerSetupReady, true);
  assert.equal(summary.checkoutFlagEnabled, true);
  assert.deepEqual(summary.missingProviderGroups, []);
  assert.deepEqual(summary.readyProviderGroups, [
    "auth",
    "storage",
    "stripe",
    "webhooks",
    "email",
    "app-url",
  ]);
});
