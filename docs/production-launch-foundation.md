# Denominated Production Launch Foundation

This document captures the minimum production systems needed before
Denominated should accept paid users.

## Launch Recommendation

Denominated can launch publicly as a free calculator before every roadmap
feature is finished. Denominated should not accept paid Pro or Lifetime users
until these systems are configured and verified:

- Clerk production authentication
- Convex durable scenario/account storage
- Stripe Checkout with live products and prices
- Stripe webhook fulfillment
- Stripe Billing Portal or a support-backed cancellation path
- Privacy, terms, refund/cancellation language
- Support contact for billing and account issues
- Resend or equivalent email delivery for transactional/report emails

## What Was Added

- `/billing` shows billing management and paid-launch readiness checks.
- `/legal/terms`, `/legal/privacy`, and `/legal/refunds` provide launch-safe
  legal scaffolds.
- `/api/webhooks/stripe` verifies Stripe signatures and maps events to billing
  actions.
- `/api/billing/portal` creates Stripe Billing Portal sessions only in explicit
  local test mode until real auth and customer IDs exist.
- `/sign-in` and `/sign-up` are Clerk-ready routes. They show a setup fallback
  until Clerk environment variables exist.
- `middleware.ts` protects account, watchlist, dashboard, billing, checkout, and
  billing API surfaces once Clerk is configured. Without Clerk env vars it
  passes through so local MVP testing still works.
- `src/lib/billing.ts` centralizes billing entitlement behavior.
- `src/lib/production-readiness.ts` centralizes provider/env readiness checks.

## Required Environment Variables

| Area | Environment variables |
| --- | --- |
| Clerk auth | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Convex storage | `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` |
| Stripe checkout | `STRIPE_SECRET_KEY`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID`, `STRIPE_LIFETIME_PRICE_ID` |
| Stripe webhooks | `STRIPE_WEBHOOK_SECRET` |
| Email | `RESEND_API_KEY` |
| App URL | `NEXT_PUBLIC_APP_URL` |

## Billing Portal Safety

The current app still uses local email as the account placeholder. That is not
safe enough for a public billing portal because someone could type another
person's email.

For that reason, `/api/billing/portal` refuses to create portal sessions unless:

1. `STRIPE_SECRET_KEY` is present, and
2. `DENOMINATED_ENABLE_LOCAL_BILLING_TESTS=true` is set.

That flag should be used only for local Stripe portal testing. Public launch
should use Clerk identity plus a stored Stripe customer ID from Convex.

## Clerk Auth Safety

Clerk is installed and wired conditionally. This avoids breaking local
development before production keys exist, but paid launch still requires:

- Vercel/Clerk environment variables in Production and Preview.
- Clerk sign-in/sign-up verification on the live domain.
- Server-side user ID mapping for saved scenarios and billing.
- Hiding or removing local mock plan controls outside development.
- Migrating local saved scenarios into the authenticated account.

## Stripe Webhook Persistence TODO

`/api/webhooks/stripe` currently verifies signatures and maps events to the
correct billing actions. The remaining launch work is to persist those actions
to durable user billing records in Convex.

Required persisted fields:

- `planTier`
- `stripeCustomerId`
- `stripeSubscriptionId`
- `stripePriceId`
- `subscriptionStatus`
- `currentPeriodEnd`
- `cancelAtPeriodEnd`
- `lifetimePurchasedAt`
- `billingUpdatedAt`

## Manual Launch Signoffs

Before enabling live paid CTAs:

- Confirm final prices and plan language.
- Confirm refund policy for subscriptions and Lifetime.
- Confirm sales tax/VAT handling.
- Confirm support email and process.
- Confirm legal copy has been reviewed.
- Run test-mode checkout, webhook, cancellation, and billing portal flows.
- Repeat the flow in Vercel Preview before Production.
