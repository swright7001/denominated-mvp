import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";
import { isValidEmail, normalizeEmail } from "@/lib/account";
import { isClerkConfigured } from "@/lib/auth";
import {
  billingPortalTestModeEnvVar,
  getMissingBillingPortalAuthEnvVars,
  isBillingPortalLocalTestEnabled,
} from "@/lib/billing";
import { resolveRequestAppOrigin } from "@/lib/site";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    accountEmail?: unknown;
  } | null;
  const accountEmail =
    typeof payload?.accountEmail === "string"
      ? normalizeEmail(payload.accountEmail)
      : "";

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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = resolveRequestAppOrigin({ requestUrl: request.url });

  if (isBillingPortalLocalTestEnabled()) {
    if (!isValidEmail(accountEmail)) {
      return NextResponse.json(
        {
          code: "ACCOUNT_REQUIRED",
          error: "Enter a valid test account email before opening the portal.",
        },
        { status: 401 },
      );
    }

    return createBillingPortalSessionFromEmail({
      stripe,
      accountEmail,
      origin,
    });
  }

  const missingPortalEnvVars = getMissingBillingPortalAuthEnvVars();

  if (!isClerkConfigured() || missingPortalEnvVars.length > 0) {
    return NextResponse.json(
      {
        code: "AUTH_PROVIDER_REQUIRED",
        error: `Billing portal access requires Clerk auth, Convex account storage, and stored Stripe customer IDs. Set ${billingPortalTestModeEnvVar}=true only for local Stripe portal testing.`,
        missingEnvVars: missingPortalEnvVars,
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
        error: "Sign in before managing billing.",
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
          "Convex account lookup needs the Clerk Convex JWT template before billing can be managed.",
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
          "Billing account lookup is not ready yet. Confirm Clerk and Convex auth are connected.",
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  if (!account) {
    return NextResponse.json(
      {
        code: "ACCOUNT_NOT_FOUND",
        error: "Create a Denominated account before managing billing.",
      },
      { status: 404 },
    );
  }

  if (!account.stripeCustomerId) {
    return NextResponse.json(
      {
        code: "STRIPE_CUSTOMER_NOT_LINKED",
        error: "No Stripe customer exists for this account yet.",
      },
      { status: 404 },
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: account.stripeCustomerId,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}

async function createBillingPortalSessionFromEmail({
  stripe,
  accountEmail,
  origin,
}: {
  stripe: Stripe;
  accountEmail: string;
  origin: string;
}) {
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

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}

async function fetchViewerAccount(token: string) {
  return await fetchQuery(api.accounts.getViewerAccount, {}, { token });
}
