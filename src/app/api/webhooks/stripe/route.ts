import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";
import {
  getMissingBillingPersistenceEnvVars,
  mapStripeEventToBillingSnapshot,
  mapStripeEventToBillingResult,
} from "@/lib/billing";

export async function POST(request: Request) {
  const missingEnvVars = getMissingBillingPersistenceEnvVars();

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        code: "STRIPE_WEBHOOK_NOT_CONFIGURED",
        error:
          "Stripe webhook handling is not configured yet. Add required billing environment variables before accepting payments.",
        missingEnvVars,
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  const result = mapStripeEventToBillingResult(event);
  const snapshot = mapStripeEventToBillingSnapshot(event);
  const persistenceResult = snapshot
    ? await fetchMutation(api.billing.syncFromStripeWebhook, {
        syncSecret: process.env.DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET!,
        snapshot,
      })
    : null;

  console.info("stripe_webhook_received", {
    eventId: event.id,
    eventType: event.type,
    action: result.action,
    planTier: result.planTier,
    stripeCustomerId: result.stripeCustomerId,
    stripeSubscriptionId: result.stripeSubscriptionId,
    persisted: Boolean(persistenceResult),
  });

  return NextResponse.json({
    received: true,
    result,
    persisted: Boolean(persistenceResult),
  });
}
