import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import {
  getCheckoutPlan,
  getCheckoutPriceId,
  getMissingCheckoutEnvVars,
  parseCheckoutPlanId,
} from "@/lib/checkout";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    planId?: unknown;
    accountEmail?: unknown;
  } | null;
  const planId = parseCheckoutPlanId(payload?.planId);

  if (!planId) {
    return NextResponse.json(
      { error: "Choose a valid Denominated plan." },
      { status: 400 },
    );
  }

  const accountEmail =
    typeof payload?.accountEmail === "string"
      ? normalizeEmail(payload.accountEmail)
      : "";

  if (!isValidEmail(accountEmail)) {
    return NextResponse.json(
      {
        code: "ACCOUNT_REQUIRED",
        error: "Create a free account before starting checkout.",
      },
      { status: 401 },
    );
  }

  const plan = getCheckoutPlan(planId);
  const missingEnvVars = getMissingCheckoutEnvVars(plan);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        code: "STRIPE_NOT_CONFIGURED",
        error:
          "Stripe checkout is not configured yet. Add the required environment variables in Vercel before accepting payments.",
        missingEnvVars,
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const priceId = getCheckoutPriceId(plan);
  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    customer_email: accountEmail,
    client_reference_id: accountEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      ...plan.metadata,
      account_email: accountEmail,
      checkout_plan_id: plan.id,
      stripe_price_id: priceId,
    },
    success_url: `${origin}/dashboard?checkout=success&plan=${plan.id}`,
    cancel_url: `${origin}/plans?checkout=cancelled&plan=${plan.id}`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: session.url });
}
