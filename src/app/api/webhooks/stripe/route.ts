import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getMissingBillingEnvVars,
  mapStripeEventToBillingResult,
} from "@/lib/billing";

export async function POST(request: Request) {
  const missingEnvVars = getMissingBillingEnvVars();

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

  console.info("stripe_webhook_received", {
    eventId: event.id,
    eventType: event.type,
    action: result.action,
    planTier: result.planTier,
    stripeCustomerId: result.stripeCustomerId,
    stripeSubscriptionId: result.stripeSubscriptionId,
  });

  return NextResponse.json({ received: true, result });
}
