import type Stripe from "stripe";
import { isValidEmail, normalizeEmail } from "./account";
import type { PlanTier } from "./entitlements";

type BillingPlanTier = Exclude<PlanTier, "noAccount">;

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
  planTier?: BillingPlanTier;
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

export type StripeBillingSnapshot = Omit<
  BillingSnapshot,
  "billingUpdatedAt" | "planTier"
> & {
  planTier: BillingPlanTier;
  billingUpdatedAt: string;
  email?: string;
  stripeEventId: string;
  stripeEventType: string;
  lastWebhookAction: BillingWebhookAction;
};

export const billingPortalTestModeEnvVar =
  "DENOMINATED_ENABLE_LOCAL_BILLING_TESTS";
export const stripeWebhookSyncSecretEnvVar =
  "DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET";

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

export function getMissingBillingPersistenceEnvVars(
  env: Record<string, string | undefined> = process.env,
) {
  return [
    ...getMissingBillingEnvVars(env),
    "NEXT_PUBLIC_CONVEX_URL",
    stripeWebhookSyncSecretEnvVar,
  ].filter((key) => !env[key]);
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

export function mapStripeEventToBillingSnapshot(
  event: Pick<Stripe.Event, "id" | "type" | "data" | "created">,
  receivedAt = new Date(),
): StripeBillingSnapshot | null {
  const result = mapStripeEventToBillingResult(event);

  if (result.action === "ignore") {
    return null;
  }

  const billingUpdatedAt = receivedAt.toISOString();
  const base = {
    stripeEventId: event.id,
    stripeEventType: event.type,
    lastWebhookAction: result.action,
    billingUpdatedAt,
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = normalizeOptionalEmail(
        session.metadata?.account_email ??
          session.customer_details?.email ??
          session.customer_email,
      );

      if (result.action === "grant-lifetime") {
        return {
          ...base,
          planTier: "lifetime",
          email,
          stripeCustomerId: result.stripeCustomerId,
          stripePriceId: session.metadata?.stripe_price_id,
          lifetimePurchasedAt: toIsoFromUnix(event.created) ?? billingUpdatedAt,
        };
      }

      return {
        ...base,
        planTier: "pro",
        email,
        stripeCustomerId: result.stripeCustomerId,
        stripeSubscriptionId: result.stripeSubscriptionId,
        stripePriceId: session.metadata?.stripe_price_id,
        subscriptionStatus: "unknown",
      };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = normalizeSubscriptionStatus(subscription.status);

      return {
        ...base,
        planTier:
          status === "active" || status === "trialing" ? "pro" : "freeAccount",
        stripeCustomerId: result.stripeCustomerId,
        stripeSubscriptionId: result.stripeSubscriptionId,
        stripePriceId: subscription.items.data[0]?.price.id,
        subscriptionStatus: status,
        currentPeriodEnd: toIsoFromUnix(
          (subscription as Stripe.Subscription & { current_period_end?: number })
            .current_period_end,
        ),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;

      return {
        ...base,
        planTier: "pro",
        email: normalizeOptionalEmail(invoice.customer_email),
        stripeCustomerId: result.stripeCustomerId,
        stripeSubscriptionId: result.stripeSubscriptionId,
        subscriptionStatus: "active",
      };
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;

      return {
        ...base,
        planTier: "freeAccount",
        email: normalizeOptionalEmail(invoice.customer_email),
        stripeCustomerId: result.stripeCustomerId,
        stripeSubscriptionId: result.stripeSubscriptionId,
        subscriptionStatus: "past_due",
      };
    }
    default:
      return null;
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

function normalizeSubscriptionStatus(
  value: Stripe.Subscription.Status | undefined,
): SubscriptionStatus {
  if (
    value === "active" ||
    value === "trialing" ||
    value === "past_due" ||
    value === "canceled" ||
    value === "incomplete" ||
    value === "incomplete_expired" ||
    value === "unpaid" ||
    value === "paused"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeOptionalEmail(value: string | null | undefined) {
  if (!value) return undefined;

  const email = normalizeEmail(value);

  return isValidEmail(email) ? email : undefined;
}

function toIsoFromUnix(value: number | null | undefined) {
  if (typeof value !== "number") return undefined;
  return new Date(value * 1000).toISOString();
}
