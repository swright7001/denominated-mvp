import type { PlanTier } from "./entitlements";
import type { SubscriptionStatus } from "./billing";

export type CheckoutPlanId = "proMonthly" | "proAnnual" | "lifetime";

export type CheckoutPlan = {
  id: CheckoutPlanId;
  label: string;
  shortLabel: string;
  mode: "subscription" | "payment";
  tier: Extract<PlanTier, "pro" | "lifetime">;
  priceEnvVar: string;
  metadata: Record<string, string>;
};

export type CheckoutAccountState = {
  planTier?: Exclude<PlanTier, "noAccount">;
  subscriptionStatus?: SubscriptionStatus;
};
export const paidCheckoutEnabledEnvVar = "DENOMINATED_ENABLE_PAID_CHECKOUT";
export const stripeAutomaticTaxEnabledEnvVar =
  "DENOMINATED_STRIPE_AUTOMATIC_TAX_ENABLED";

export const checkoutPlans: Record<CheckoutPlanId, CheckoutPlan> = {
  proMonthly: {
    id: "proMonthly",
    label: "Start Pro monthly",
    shortLabel: "Pro monthly",
    mode: "subscription",
    tier: "pro",
    priceEnvVar: "STRIPE_PRO_MONTHLY_PRICE_ID",
    metadata: {
      denominated_plan: "pro",
      billing_interval: "month",
      entitlement_tier: "pro",
    },
  },
  proAnnual: {
    id: "proAnnual",
    label: "Start Pro annual",
    shortLabel: "Pro annual",
    mode: "subscription",
    tier: "pro",
    priceEnvVar: "STRIPE_PRO_ANNUAL_PRICE_ID",
    metadata: {
      denominated_plan: "pro",
      billing_interval: "year",
      entitlement_tier: "pro",
    },
  },
  lifetime: {
    id: "lifetime",
    label: "Get Lifetime",
    shortLabel: "Lifetime",
    mode: "payment",
    tier: "lifetime",
    priceEnvVar: "STRIPE_LIFETIME_PRICE_ID",
    metadata: {
      denominated_plan: "lifetime",
      billing_interval: "one_time",
      entitlement_tier: "lifetime",
    },
  },
};

export function parseCheckoutPlanId(value: unknown): CheckoutPlanId | null {
  if (
    value === "proMonthly" ||
    value === "proAnnual" ||
    value === "lifetime"
  ) {
    return value;
  }

  return null;
}

export function getCheckoutPlan(id: CheckoutPlanId) {
  return checkoutPlans[id];
}

export function getCheckoutPriceId(
  plan: CheckoutPlan,
  env: Record<string, string | undefined> = process.env,
) {
  return env[plan.priceEnvVar] ?? "";
}

export function getMissingCheckoutEnvVars(
  plan: CheckoutPlan,
  env: Record<string, string | undefined> = process.env,
) {
  return ["STRIPE_SECRET_KEY", plan.priceEnvVar].filter((key) => !env[key]);
}

export function getMissingAuthenticatedCheckoutEnvVars(
  plan: CheckoutPlan,
  env: Record<string, string | undefined> = process.env,
) {
  return [
    "CLERK_SECRET_KEY",
    "CLERK_JWT_ISSUER_DOMAIN",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_CONVEX_URL",
    ...getMissingCheckoutEnvVars(plan, env),
  ].filter((key, index, keys) => !env[key] && keys.indexOf(key) === index);
}
export function isPaidCheckoutEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  return env[paidCheckoutEnabledEnvVar] === "true";
}

export function getStripeAutomaticTaxConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const value = env[stripeAutomaticTaxEnabledEnvVar]?.trim().toLowerCase();

  if (value === "true") {
    return { enabled: true } as const;
  }

  if (value === "false") {
    return { enabled: false } as const;
  }

  return null;
}

export function getCheckoutAccountConflict(
  plan: CheckoutPlan,
  account: CheckoutAccountState | null | undefined,
) {
  if (!account) return null;

  if (account.planTier === "lifetime") {
    return {
      code: "LIFETIME_ACCESS_EXISTS",
      error:
        "This account already has Lifetime access. No additional checkout is needed.",
    };
  }

  const hasActiveProSubscription =
    account.planTier === "pro" ||
    account.subscriptionStatus === "active" ||
    account.subscriptionStatus === "trialing";

  if (plan.mode === "subscription" && hasActiveProSubscription) {
    return {
      code: "ACTIVE_SUBSCRIPTION_EXISTS",
      error:
        "This account already has an active Pro subscription. Manage it from billing instead of starting another subscription.",
    };
  }

  return null;
}
