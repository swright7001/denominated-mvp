import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import { isClerkConfigured } from "@/lib/auth";
import {
  getCheckoutPlan,
  getCheckoutAccountConflict,
  getCheckoutPriceId,
  getMissingAuthenticatedCheckoutEnvVars,
  isPaidCheckoutEnabled,
  paidCheckoutEnabledEnvVar,
  parseCheckoutPlanId,
} from "@/lib/checkout";
import { resolveRequestAppOrigin } from "@/lib/site";
import { createStripeClient } from "@/lib/stripe";
import {
  getMissingPaidLaunchEnvVars,
  shouldBlockProductionPaidCheckout,
} from "@/lib/production-readiness";

export async function POST(request: Request) {
  if (!isPaidCheckoutEnabled()) {
    return NextResponse.json(
      {
        code: "PAID_CHECKOUT_DISABLED",
        error:
          "Paid checkout is not enabled for the free public launch. The calculator remains available.",
        requiredEnvVar: paidCheckoutEnabledEnvVar,
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  if (shouldBlockProductionPaidCheckout()) {
    return NextResponse.json(
      {
        code: "PAID_PRODUCTION_NOT_READY",
        error:
          "Paid checkout is not ready for Production. The free calculator remains available.",
        missingEnvVars: getMissingPaidLaunchEnvVars(),
        setupRequired: true,
      },
      { status: 503 },
    );
  }
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

  const plan = getCheckoutPlan(planId);
  const missingEnvVars = getMissingAuthenticatedCheckoutEnvVars(plan);

  if (!isClerkConfigured() || missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        code: "CHECKOUT_AUTH_NOT_CONFIGURED",
        error:
          "Paid checkout requires Clerk auth, Convex account storage, and Stripe prices before it can accept payments.",
        missingEnvVars,
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        code: "ACCOUNT_REQUIRED",
        error: "Create a free account before starting checkout.",
      },
      { status: 401 },
    );
  }

  const token = await getToken({ template: "convex" });

  if (!token) {
    return NextResponse.json(
      {
        code: "CONVEX_AUTH_TOKEN_REQUIRED",
        error:
          "Convex account lookup needs the Clerk Convex JWT template before checkout can start.",
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  const clerkUser = await currentUser();
  const userEmail = normalizeEmail(
    clerkUser?.primaryEmailAddress?.emailAddress ?? "",
  );

  try {
    await fetchMutation(
      api.accounts.ensureViewerAccount,
      {
        email: isValidEmail(userEmail) ? userEmail : undefined,
      },
      { token },
    );
  } catch {
    return NextResponse.json(
      {
        code: "ACCOUNT_LOOKUP_FAILED",
        error:
          "Checkout account setup is not ready yet. Confirm Clerk and Convex auth are connected.",
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  let account: Awaited<ReturnType<typeof fetchViewerAccount>>;

  try {
    account = await fetchViewerAccount(token);
  } catch {
    return NextResponse.json(
      {
        code: "ACCOUNT_LOOKUP_FAILED",
        error:
          "Checkout account lookup is not ready yet. Confirm Clerk and Convex auth are connected.",
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  const accountEmail = normalizeEmail(account?.email ?? userEmail);
  const checkoutConflict = getCheckoutAccountConflict(plan, account);

  if (checkoutConflict) {
    return NextResponse.json(checkoutConflict, { status: 409 });
  }

  if (!isValidEmail(accountEmail)) {
    return NextResponse.json(
      {
        code: "ACCOUNT_EMAIL_REQUIRED",
        error: "Add an email address to your account before starting checkout.",
      },
      { status: 401 },
    );
  }

  const stripe = createStripeClient(process.env.STRIPE_SECRET_KEY!);
  const origin = resolveRequestAppOrigin({ requestUrl: request.url });
  const priceId = getCheckoutPriceId(plan);
  const customerId = account?.stripeCustomerId;
  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    ...(customerId
      ? { customer: customerId }
      : { customer_email: accountEmail }),
    client_reference_id: account?._id ?? userId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      ...plan.metadata,
      account_email: accountEmail,
      convex_account_id: account?._id ?? "",
      clerk_user_id: userId,
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

async function fetchViewerAccount(token: string) {
  return await fetchQuery(api.accounts.getViewerAccount, {}, { token });
}
