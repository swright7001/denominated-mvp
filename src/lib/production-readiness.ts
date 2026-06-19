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
    envVars: ["CONVEX_DEPLOYMENT", "NEXT_PUBLIC_CONVEX_URL"],
    details:
      "Convex must be configured before saved scenarios become durable product data.",
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
    envVars: ["STRIPE_WEBHOOK_SECRET"],
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

export function getProductionReadinessChecks(env: Env = process.env) {
  const envChecks: ReadinessCheck[] = requiredLaunchEnvGroups.map((group) => {
    const missingEnvVars = group.envVars.filter((key) => !env[key]);

    return {
      id: group.id,
      label: group.label,
      status: missingEnvVars.length === 0 ? "ready" : "missing",
      details: group.details,
      missingEnvVars,
    };
  });

  const manualChecks: ReadinessCheck[] = manualLaunchChecks.map((check) => ({
    ...check,
    status: "manual",
  }));

  return [...envChecks, ...manualChecks];
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
