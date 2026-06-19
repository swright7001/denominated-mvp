import type Stripe from "stripe";
import type { PlanTier } from "./entitlements";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused"
  | "unknown";

export type BillingSnapshot = {
  planTier?: PlanTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  subscriptionStatus?: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  lifetimePurchasedAt?: string;
  billingUpdatedAt?: string;
};

export type BillingWebhookAction =
  | "grant-lifetime"
  | "sync-subscription"
  | "sync-invoice"
  | "mark-payment-issue"
  | "ignore";

export type BillingWebhookResult = {
  action: BillingWebhookAction;
  planTier?: PlanTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  note: string;
};

export const billingPortalTestModeEnvVar =
  "DENOMINATED_ENABLE_LOCAL_BILLING_TESTS";

export function resolveBillingPlanTier(
  snapshot: BillingSnapshot | null | undefined,
): PlanTier {
  if (!snapshot) return "freeAccount";

  if (snapshot.lifetimePurchasedAt || snapshot.planTier === "lifetime") {
    return "lifetime";
  }

  if (
    snapshot.subscriptionStatus === "active" ||
    snapshot.subscriptionStatus === "trialing" ||
    snapshot.planTier === "pro"
  ) {
    return "pro";
  }

  return "freeAccount";
}

export function getMissingBillingEnvVars(
  env: Record<string, string | undefined> = process.env,
) {
  return ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"].filter(
    (key) => !env[key],
  );
}

export function isBillingPortalLocalTestEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  return env[billingPortalTestModeEnvVar] === "true";
}

export function mapStripeEventToBillingResult(
  event: Pick<Stripe.Event, "type" | "data">,
): BillingWebhookResult {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tier = parseWebhookTier(session.metadata?.entitlement_tier);

      if (tier === "lifetime") {
        return {
          action: "grant-lifetime",
          planTier: "lifetime",
          stripeCustomerId: getStripeId(session.customer),
          note: "Lifetime checkout completed; persist lifetime ownership for this user.",
        };
      }

      return {
        action: "sync-subscription",
        planTier: "pro",
        stripeCustomerId: getStripeId(session.customer),
        stripeSubscriptionId: getStripeId(session.subscription),
        note: "Pro checkout completed; persist subscription/customer linkage.",
      };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      return {
        action: "sync-subscription",
        planTier:
          subscription.status === "active" || subscription.status === "trialing"
            ? "pro"
            : "freeAccount",
        stripeCustomerId: getStripeId(subscription.customer),
        stripeSubscriptionId: subscription.id,
        note: "Subscription changed; refresh billing snapshot and entitlement tier.",
      };
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;

      return {
        action: "sync-invoice",
        planTier: "pro",
        stripeCustomerId: getStripeId(invoice.customer),
        stripeSubscriptionId: getStripeId(invoice.parent?.subscription_details?.subscription),
        note: "Invoice paid; keep Pro active and update billing timestamp.",
      };
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;

      return {
        action: "mark-payment-issue",
        stripeCustomerId: getStripeId(invoice.customer),
        stripeSubscriptionId: getStripeId(invoice.parent?.subscription_details?.subscription),
        note: "Invoice failed; mark billing issue without blocking the free calculator.",
      };
    }
    default:
      return {
        action: "ignore",
        note: "Event acknowledged; no billing mutation is needed.",
      };
  }
}

function parseWebhookTier(value: string | null | undefined): PlanTier | null {
  if (value === "pro" || value === "lifetime") return value;
  return null;
}

function getStripeId(value: string | { id: string } | null | undefined) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}
