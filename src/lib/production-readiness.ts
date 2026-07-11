export type ReadinessStatus = "ready" | "missing" | "manual";

export type ReadinessCheck = {
  id: string;
  label: string;
  status: ReadinessStatus;
  details: string;
  missingEnvVars?: string[];
};

type Env = Record<string, string | undefined>;

export type PaidPreviewReadinessSummary = {
  environment: string;
  providerSetupReady: boolean;
  checkoutFlagEnabled: boolean;
  readyProviderGroups: string[];
  missingProviderGroups: Array<{
    id: string;
    label: string;
    missingEnvVars: string[];
  }>;
  manualVerificationGroups: Array<{
    id: string;
    label: string;
    details: string;
  }>;
};

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

const requiredPaidLaunchDecisionGroups = [
  {
    id: "stripe-branding",
    label: "Stripe customer-facing branding confirmed",
    envVars: ["DENOMINATED_STRIPE_BRANDING_CONFIRMED"],
    details:
      "Checkout and Billing Portal must show Denominated branding and an accurate customer support path.",
  },
  {
    id: "legal-signoff",
    label: "Paid legal policies approved",
    envVars: [
      "DENOMINATED_LEGAL_SIGNOFF",
      "DENOMINATED_OPERATOR_NAME",
      "DENOMINATED_LEGAL_EFFECTIVE_DATE",
    ],
    details:
      "The operator identity, effective date, and owner or professional legal approval must be recorded before live checkout.",
  },
  {
    id: "tax-signoff",
    label: "Tax and accounting decision approved",
    envVars: ["DENOMINATED_TAX_SIGNOFF"],
    details:
      "The owner or tax professional must record the Stripe Tax and accounting decision before live checkout.",
  },
  {
    id: "support",
    label: "Paid customer support configured",
    envVars: ["DENOMINATED_SUPPORT_EMAIL", "NEXT_PUBLIC_SUPPORT_URL"],
    details:
      "Paid users need a published support email and URL for refunds, cancellations, and account access.",
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

function isAffirmative(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function getPaidLaunchDecisionChecks(env: Env): ReadinessCheck[] {
  return requiredPaidLaunchDecisionGroups.map((group) => {
    const missingEnvVars = group.envVars.filter((key) => {
      if (
        key === "DENOMINATED_STRIPE_BRANDING_CONFIRMED" ||
        key === "DENOMINATED_LEGAL_SIGNOFF" ||
        key === "DENOMINATED_TAX_SIGNOFF"
      ) {
        return !isAffirmative(env[key]);
      }

      return !env[key]?.trim();
    });

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

  return [
    ...getProviderEnvChecks(env),
    ...getPaidLaunchDecisionChecks(env),
    ...manualChecks,
  ];
}

export function isPaidLaunchReady(env: Env = process.env) {
  return getProductionReadinessChecks(env).every(
    (check) => check.status !== "missing",
  );
}

export function shouldBlockProductionPaidCheckout(env: Env = process.env) {
  return env.VERCEL_ENV === "production" && !isPaidLaunchReady(env);
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

export function getPaidPreviewReadinessSummary(
  env: Env = process.env,
): PaidPreviewReadinessSummary {
  const checks = getPaidPreviewVerificationChecks(env);
  const checkoutFlagEnabled =
    env.DENOMINATED_ENABLE_PAID_CHECKOUT?.toLowerCase() === "true";

  return {
    environment: env.VERCEL_ENV ?? "local",
    providerSetupReady: isPaidPreviewProviderSetupReady(env),
    checkoutFlagEnabled,
    readyProviderGroups: checks
      .filter(
        (check) =>
          check.status === "ready" && check.id !== "paid-checkout-flag",
      )
      .map((check) => check.id),
    missingProviderGroups: checks
      .filter((check) => check.status === "missing")
      .map((check) => ({
        id: check.id,
        label: check.label,
        missingEnvVars: check.missingEnvVars ?? [],
      })),
    manualVerificationGroups: checks
      .filter((check) => check.status === "manual")
      .map((check) => ({
        id: check.id,
        label: check.label,
        details: check.details,
      })),
  };
}
