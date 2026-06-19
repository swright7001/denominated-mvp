import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import {
  billingPortalTestModeEnvVar,
  isBillingPortalLocalTestEnabled,
} from "@/lib/billing";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    accountEmail?: unknown;
  } | null;
  const accountEmail =
    typeof payload?.accountEmail === "string"
      ? normalizeEmail(payload.accountEmail)
      : "";

  if (!isValidEmail(accountEmail)) {
    return NextResponse.json(
      {
        code: "ACCOUNT_REQUIRED",
        error: "Sign in before managing billing.",
      },
      { status: 401 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        code: "STRIPE_NOT_CONFIGURED",
        error:
          "Stripe billing management is not configured yet. Add STRIPE_SECRET_KEY before opening the portal.",
      },
      { status: 503 },
    );
  }

  if (!isBillingPortalLocalTestEnabled()) {
    return NextResponse.json(
      {
        code: "AUTH_PROVIDER_REQUIRED",
        error: `Billing portal access requires production auth and stored Stripe customer IDs. Set ${billingPortalTestModeEnvVar}=true only for local Stripe portal testing.`,
      },
      { status: 503 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const customers = await stripe.customers.list({
    email: accountEmail,
    limit: 1,
  });
  const customer = customers.data[0];

  if (!customer) {
    return NextResponse.json(
      {
        code: "STRIPE_CUSTOMER_NOT_FOUND",
        error: "No Stripe customer exists for this account yet.",
      },
      { status: 404 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
