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

For the free public launch checklist, see `docs/free-launch-checklist.md`.
For the paid V2 Preview gate, see `docs/paid-v2-preview-runbook.md`.

## What Was Added

- `/billing` shows billing management and paid-launch readiness checks.
- `/legal/terms`, `/legal/privacy`, and `/legal/refunds` provide launch-facing
  legal pages that still require final professional review before paid launch.
- `/api/webhooks/stripe` verifies Stripe signatures, maps events to billing
  actions, and persists normalized billing snapshots to Convex.
- `/api/billing/portal` creates Stripe Billing Portal sessions only in explicit
  local test mode until real auth and customer IDs exist.
- `/sign-in` and `/sign-up` are Clerk-ready routes. They show a setup fallback
  until Clerk environment variables exist.
- `middleware.ts` protects account, watchlist, dashboard, billing, checkout, and
  billing API surfaces once Clerk is configured. Without Clerk env vars it
  passes through so local MVP testing still works.
- `src/lib/billing.ts` centralizes billing entitlement behavior.
- `src/lib/production-readiness.ts` centralizes provider/env readiness checks.
  It separates provider setup from manual paid Preview verification so paid
  launch is not treated as ready just because environment variables exist.
- Convex is initialized for durable account, billing snapshot, saved scenario,
  and preset storage. See `docs/database-storage-foundation.md`.

## Required Environment Variables

| Area | Environment variables |
| --- | --- |
| Clerk auth | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Convex storage | `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `CLERK_JWT_ISSUER_DOMAIN` |
| Stripe checkout | `STRIPE_SECRET_KEY`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID`, `STRIPE_LIFETIME_PRICE_ID` |
| Stripe webhooks | `STRIPE_WEBHOOK_SECRET`, `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` |
| Email | `RESEND_API_KEY`, `DENOMINATED_EMAIL_FROM` |
| Support inbox | `RESEND_WEBHOOK_SECRET`, `DENOMINATED_SUPPORT_INBOX_SECRET`, `DENOMINATED_SUPPORT_EMAIL_FROM`, `DENOMINATED_SUPPORT_RECEIVING_EMAIL`, `DENOMINATED_SUPPORT_ADMIN_EMAILS` |
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

## Stripe Webhook Persistence

`/api/webhooks/stripe` now verifies signatures and persists normalized billing
snapshots to Convex through `convex/billing.ts`.

Persisted fields include:

- `planTier`
- `stripeCustomerId`
- `stripeSubscriptionId`
- `stripePriceId`
- `subscriptionStatus`
- `currentPeriodEnd`
- `cancelAtPeriodEnd`
- `lifetimePurchasedAt`
- `billingUpdatedAt`

If a matching account exists by Stripe customer ID or email, the account billing
snapshot is patched too. If no matching account exists yet, the webhook data is
still stored in `billingSnapshots` so it can be linked after Clerk-backed account
identity is configured.

Production setup still requires `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` to be
set in both Vercel and Convex. This is separate from Stripe signature
verification and protects the Convex sync mutation from direct public calls.

## Paid Checkout Safety

`/api/checkout/stripe` is disabled by default for free launch. It will not
create Checkout Sessions unless `DENOMINATED_ENABLE_PAID_CHECKOUT=true` is set.
Do not set that flag in Production until Clerk-backed identity, billing portal
access, Stripe products/prices, webhooks, support, and legal/tax signoffs are
ready.

## Manual Launch Signoffs

Before enabling live paid CTAs:

- Confirm final prices and plan language.
- Confirm Terms, Privacy, and Refunds/Cancellations pages have been reviewed.
- Confirm refund policy for subscriptions and Lifetime is visible at checkout.
- Confirm sales tax/VAT handling.
- Confirm support email and process.
- Confirm financial disclaimer placement across calculator, result cards,
  share/tweet surfaces, dashboard/report views, pricing, and footer.
- Confirm assumptions and data-source caveats are visible wherever live/preset
  prices or future scenarios are shown.
- Run test-mode checkout, webhook, cancellation, and billing portal flows.
- Repeat the flow in Vercel Preview before Production.
- Keep `DENOMINATED_ENABLE_PAID_CHECKOUT=true` out of Production until the paid
  V2 Preview runbook has passed.
