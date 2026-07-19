import { getSupportContact } from "./support";
import { isEmailReportsEnabled } from "./feature-flags";
import { isValidEmailFrom } from "./weekly-report-email";

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
    envVars: ["RESEND_API_KEY", "DENOMINATED_EMAIL_FROM"],
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
      "DENOMINATED_GOVERNING_JURISDICTION",
      "DENOMINATED_REFUND_WINDOW_DAYS",
    ],
    details:
      "The operator identity, effective date, and owner or professional legal approval must be recorded before live checkout.",
  },
  {
    id: "tax-signoff",
    label: "Tax and accounting decision approved",
    envVars: [
      "DENOMINATED_TAX_SIGNOFF",
      "DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED",
    ],
    details:
      "The owner or tax professional must record the Stripe Tax and accounting decision, including whether Checkout automatic tax is enabled, before live checkout.",
  },
  {
    id: "support",
    label: "Paid customer support configured",
    envVars: [
      "DENOMINATED_SUPPORT_EMAIL",
      "DENOMINATED_SUPPORT_EMAIL_VERIFIED",
      "NEXT_PUBLIC_SUPPORT_URL",
    ],
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

function getProviderEnvChecks(
  env: Env,
  mode: "preview" | "production" = "preview",
): ReadinessCheck[] {
  return requiredLaunchEnvGroups
    .filter((group) => group.id !== "email" || isEmailReportsEnabled(env))
    .map((group) => {
      const missingEnvVars = group.envVars.filter((key) => {
        const value = env[key]?.trim();

        if (!value) {
          return true;
        }

        if (mode === "preview") {
          return false;
        }

        return !isValidProductionProviderValue(key, value);
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

function isAffirmative(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function isValidProductionProviderValue(key: string, value: string) {
  switch (key) {
    case "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY":
      return value.startsWith("pk_live_");
    case "CLERK_SECRET_KEY":
      return value.startsWith("sk_live_");
    case "CONVEX_DEPLOYMENT":
      return value.startsWith("prod:");
    case "NEXT_PUBLIC_CONVEX_URL":
    case "CLERK_JWT_ISSUER_DOMAIN":
    case "NEXT_PUBLIC_APP_URL":
      return isPublicHttpsUrl(value);
    case "STRIPE_SECRET_KEY":
      return value.startsWith("sk_live_");
    case "STRIPE_PRO_MONTHLY_PRICE_ID":
    case "STRIPE_PRO_ANNUAL_PRICE_ID":
    case "STRIPE_LIFETIME_PRICE_ID":
      return value.startsWith("price_");
    case "STRIPE_WEBHOOK_SECRET":
      return value.startsWith("whsec_");
    case "RESEND_API_KEY":
      return value.startsWith("re_");
    case "DENOMINATED_EMAIL_FROM":
      return (
        isValidEmailFrom(value) &&
        !/@resend\.dev>?$/i.test(value)
      );
    default:
      return true;
  }
}

function isPublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    );
  } catch {
    return false;
  }
}

function isIsoDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isRefundWindowDays(value: string | undefined) {
  const normalized = value?.trim() ?? "";

  if (!/^\d{1,3}$/.test(normalized)) {
    return false;
  }

  const days = Number(normalized);
  return Number.isInteger(days) && days >= 0 && days <= 365;
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

      if (key === "DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED") {
        const value = env[key]?.trim().toLowerCase();
        return value !== "true" && value !== "false";
      }

      if (key === "DENOMINATED_LEGAL_EFFECTIVE_DATE") {
        return !isIsoDate(env[key]?.trim());
      }

      if (
        key === "DENOMINATED_OPERATOR_NAME" ||
        key === "DENOMINATED_GOVERNING_JURISDICTION"
      ) {
        return !env[key]?.trim();
      }

      if (key === "DENOMINATED_REFUND_WINDOW_DAYS") {
        return !isRefundWindowDays(env[key]);
      }

      if (
        key === "DENOMINATED_SUPPORT_EMAIL" ||
        key === "DENOMINATED_SUPPORT_EMAIL_VERIFIED" ||
        key === "NEXT_PUBLIC_SUPPORT_URL"
      ) {
        return !getSupportContact(env);
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
    ...getProviderEnvChecks(env, "production"),
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
    ...getProviderEnvChecks(env, "preview"),
    checkoutFlagCheck,
    ...manualPreviewChecks,
  ];
}

export function isPaidPreviewProviderSetupReady(env: Env = process.env) {
  return getProviderEnvChecks(env, "preview").every(
    (check) => check.status === "ready",
  );
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
