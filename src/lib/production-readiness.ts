export type ReadinessStatus = "ready" | "missing" | "manual";

export type ReadinessCheck = {
  id: string;
  label: string;
  status: ReadinessStatus;
  details: string;
  missingEnvVars?: string[];
};

type Env = Record<string, string | undefined>;

const requiredLaunchEnvGroups = [
  {
    id: "auth",
    label: "Production auth",
    envVars: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
    details:
      "Clerk must be configured before paid accounts can be trusted across devices.",
  },
  {
    id: "storage",
    label: "Durable scenario storage",
    envVars: [
      "CONVEX_DEPLOYMENT",
      "NEXT_PUBLIC_CONVEX_URL",
      "CLERK_JWT_ISSUER_DOMAIN",
    ],
    details:
      "Convex and Clerk JWT trust must be configured before saved scenarios become durable account data.",
  },
  {
    id: "stripe",
    label: "Stripe checkout",
    envVars: [
      "STRIPE_SECRET_KEY",
      "STRIPE_PRO_MONTHLY_PRICE_ID",
      "STRIPE_PRO_ANNUAL_PRICE_ID",
      "STRIPE_LIFETIME_PRICE_ID",
    ],
    details:
      "Stripe checkout needs live products/prices before paid CTAs accept money.",
  },
  {
    id: "webhooks",
    label: "Stripe webhook fulfillment",
    envVars: ["STRIPE_WEBHOOK_SECRET", "DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET"],
    details:
      "Stripe webhooks must be verified and connected before paid entitlements are granted.",
  },
  {
    id: "email",
    label: "Email delivery",
    envVars: ["RESEND_API_KEY"],
    details:
      "Resend is needed for production transactional and recurring report emails.",
  },
  {
    id: "app-url",
    label: "Canonical app URL",
    envVars: ["NEXT_PUBLIC_APP_URL"],
    details:
      "The app URL drives checkout return URLs, metadata, and support links.",
  },
];

const manualLaunchChecks = [
  {
    id: "terms",
    label: "Terms, privacy, and refund policy reviewed",
    details:
      "Legal pages exist in-app, but professional review is still a launch decision.",
  },
  {
    id: "tax",
    label: "Sales tax and accounting decision made",
    details:
      "Stripe Tax/accounting treatment should be confirmed before accepting payments.",
  },
  {
    id: "support",
    label: "Billing support path ready",
    details:
      "Paid users need a clear support email/process for refunds, cancellations, and account access.",
  },
];

const paidPreviewVerificationChecks = [
  {
    id: "preview-deployment",
    label: "Paid branch deployed to Vercel Preview",
    details:
      "The paid launch branch must be tested from a Preview deployment before it is merged or promoted.",
  },
  {
    id: "preview-auth",
    label: "Clerk auth verified on Preview",
    details:
      "Sign up, sign in, sign out, and protected account routes must work on the Preview URL.",
  },
  {
    id: "preview-convex-identity",
    label: "Signed-in identity linked to Convex",
    details:
      "Saved scenarios, watchlist, dashboard, and account surfaces must read and write through the authenticated Convex account.",
  },
  {
    id: "preview-stripe-webhook",
    label: "Stripe test webhook connected to Preview",
    details:
      "Stripe test-mode webhooks must reach the Preview /api/webhooks/stripe endpoint and persist billing snapshots.",
  },
  {
    id: "preview-pro-checkout",
    label: "Pro checkout tested in Stripe test mode",
    details:
      "Monthly or annual Pro checkout must grant Pro access from persisted Convex billing state.",
  },
  {
    id: "preview-lifetime-checkout",
    label: "Lifetime checkout tested in Stripe test mode",
    details:
      "Lifetime test checkout must grant Lifetime access and continue to override subscription changes.",
  },
  {
    id: "preview-billing-portal",
    label: "Authenticated billing portal tested",
    details:
      "A signed-in paid user must open the Stripe Billing Portal through the stored Stripe customer ID.",
  },
  {
    id: "preview-cancel-failed-payment",
    label: "Cancellation and failed-payment paths tested",
    details:
      "Cancel, subscription deletion, and failed-payment events must downgrade or warn without blocking the free calculator.",
  },
];

function getProviderEnvChecks(env: Env): ReadinessCheck[] {
  return requiredLaunchEnvGroups.map((group) => {
    const missingEnvVars = group.envVars.filter((key) => !env[key]);

    return {
      id: group.id,
      label: group.label,
      status: missingEnvVars.length === 0 ? "ready" : "missing",
      details: group.details,
      missingEnvVars,
    };
  });
}

export function getProductionReadinessChecks(env: Env = process.env) {
  const manualChecks: ReadinessCheck[] = manualLaunchChecks.map((check) => ({
    ...check,
    status: "manual",
  }));

  return [...getProviderEnvChecks(env), ...manualChecks];
}

export function isPaidLaunchReady(env: Env = process.env) {
  return getProductionReadinessChecks(env).every(
    (check) => check.status !== "missing",
  );
}

export function getMissingPaidLaunchEnvVars(env: Env = process.env) {
  return getProductionReadinessChecks(env).flatMap(
    (check) => check.missingEnvVars ?? [],
  );
}

export function getPaidPreviewVerificationChecks(env: Env = process.env) {
  const checkoutFlagEnabled =
    env.DENOMINATED_ENABLE_PAID_CHECKOUT?.toLowerCase() === "true";

  const checkoutFlagCheck: ReadinessCheck = {
    id: "paid-checkout-flag",
    label: "Paid checkout flag controlled",
    status: checkoutFlagEnabled ? "manual" : "ready",
    details: checkoutFlagEnabled
      ? "Paid checkout is enabled in this environment. Only keep it enabled while running verified Preview Stripe tests or after paid launch approval."
      : "Paid checkout is off. Keep it off in Production until the paid launch PR passes Preview verification.",
  };

  const manualPreviewChecks: ReadinessCheck[] =
    paidPreviewVerificationChecks.map((check) => ({
      ...check,
      status: "manual",
    }));

  return [
    ...getProviderEnvChecks(env),
    checkoutFlagCheck,
    ...manualPreviewChecks,
  ];
}

export function isPaidPreviewProviderSetupReady(env: Env = process.env) {
  return getProviderEnvChecks(env).every((check) => check.status === "ready");
}
