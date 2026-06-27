# Denominated Stripe Checkout Plan

This is the implementation plan for `DEN-84`. It defines how Denominated should
support Pro subscriptions and Lifetime purchases while keeping the calculator
free.

Checkout plumbing now exists behind `/api/checkout/stripe`, but it is not live
until Stripe environment variables and real account identity are configured.
Billing settings and payment fulfillment are not implemented in this MVP.

## Product And Price Structure

Create three Stripe Prices under two Stripe Products.

### Product: Denominated Pro

Recurring subscription for the full recurring-use product.

- Monthly price: `$7/month`
- Annual price: `$59/year`
- Stripe billing mode: subscription
- App tier after active payment: `pro`
- App tier when canceled at period end but still active: `pro` until
  `current_period_end`
- App tier after cancellation period ends: `freeAccount`

Recommended Stripe metadata:

| Key | Value |
| --- | --- |
| `denominated_plan` | `pro` |
| `billing_interval` | `month` or `year` |
| `entitlement_tier` | `pro` |

### Product: Denominated Lifetime

One-time purchase for full Pro ownership forever.

- Launch price placeholder: `$99`
- Standard price placeholder later: `$149-$249`
- Stripe billing mode: payment
- App tier after completed payment: `lifetime`
- App tier after subscription cancellations or failed Pro payments:
  `lifetime` should continue to win if the user owns Lifetime

Recommended Stripe metadata:

| Key | Value |
| --- | --- |
| `denominated_plan` | `lifetime` |
| `billing_interval` | `one_time` |
| `entitlement_tier` | `lifetime` |

## App Billing State

The server-side user/account record should store a normalized billing snapshot
that can be converted to `PlanTier` from `src/lib/entitlements.ts`.

Recommended user billing fields:

| Field | Purpose |
| --- | --- |
| `planTier` | `freeAccount`, `pro`, or `lifetime` |
| `stripeCustomerId` | Stripe customer identifier |
| `stripeSubscriptionId` | Active or most recent Pro subscription |
| `stripePriceId` | Current Pro monthly/annual price or Lifetime price |
| `subscriptionStatus` | Stripe subscription status |
| `currentPeriodEnd` | End of paid Pro access when subscription remains active |
| `cancelAtPeriodEnd` | Whether Pro is scheduled to cancel |
| `lifetimePurchasedAt` | Timestamp proving Lifetime ownership |
| `billingUpdatedAt` | Last webhook or checkout sync timestamp |

Entitlement resolution should follow this order:

1. If `lifetimePurchasedAt` exists, return `lifetime`.
2. If subscription status is `active` or `trialing`, return `pro`.
3. If subscription is `past_due`, keep `pro` only during a short grace period
   if the product owner chooses one.
4. Otherwise, return `freeAccount` for signed-in users.
5. Return `noAccount` for anonymous users.

The free calculator, examples, learn content, and copy/share result actions must
remain available regardless of billing status.

## Checkout Flow

Checkout should eventually be reachable from:

- `/plans` tier cards.
- Pro upgrade prompts on dashboard/watchlist/report surfaces.
- Save-limit messaging when a free account reaches one saved scenario.

Do not launch checkout from the first calculator scenario or from basic
copy/share actions.

Flow:

1. User runs scenarios freely.
2. User creates a free account or already has one.
3. User clicks a Pro or Lifetime CTA from `/plans` or a gated feature prompt.
4. App creates a Stripe Checkout Session server-side.
5. Stripe redirects user to hosted Checkout.
6. Stripe returns user to a success page.
7. Webhook confirms payment state and updates server-side user billing state.
8. UI receives normalized `PlanTier` and unlocks Pro/Lifetime features through
   the existing entitlement helpers.

If the user is not signed in at checkout time, require account creation before
creating a Checkout Session so the Stripe customer can map to a user.

## Checkout Session Requirements

Pro monthly and annual:

- `mode: "subscription"`
- One line item with the selected recurring Price ID
- Attach authenticated user ID in `client_reference_id`
- Include user ID and desired tier in `metadata`
- Success URL should return to `/dashboard?checkout=success`
- Cancel URL should return to `/plans?checkout=cancelled`

Lifetime:

- `mode: "payment"`
- One line item with the Lifetime Price ID
- Attach authenticated user ID in `client_reference_id`
- Include user ID and `entitlement_tier=lifetime` in `metadata`
- Success URL should return to `/dashboard?checkout=success`
- Cancel URL should return to `/plans?checkout=cancelled`

## Webhook Events

Handle Stripe webhooks server-side and verify signatures with
`STRIPE_WEBHOOK_SECRET`.

| Event | Behavior |
| --- | --- |
| `checkout.session.completed` | Link customer to user; grant Pro or Lifetime based on mode/price metadata |
| `customer.subscription.created` | Store subscription ID, status, price, and period end |
| `customer.subscription.updated` | Update status, current period end, cancellation flags, and tier |
| `customer.subscription.deleted` | Remove Pro entitlement unless user owns Lifetime |
| `invoice.payment_succeeded` | Keep Pro active and update billing timestamp |
| `invoice.payment_failed` | Mark subscription payment issue; optionally start grace period |

For Lifetime, `checkout.session.completed` should be enough to grant access,
but storing the related PaymentIntent and invoice data is useful for support.

## Cancellation And Failed Payment Behavior

Cancellation:

- If Pro is canceled at period end, keep `pro` until `current_period_end`.
- After the period ends, downgrade to `freeAccount` unless Lifetime exists.
- Saved scenarios beyond the free limit should not be deleted. They should
  remain stored but locked/hidden behind Pro upgrade prompts.

Failed payment:

- If Stripe marks the subscription `past_due`, show a gentle billing issue
  message inside account/billing surfaces once those exist.
- Do not block calculator access.
- Decide before launch whether to allow a short Pro grace period.
- When Stripe marks subscription `unpaid`, `canceled`, or deleted, downgrade to
  `freeAccount` unless Lifetime exists.

Lifetime:

- Lifetime ownership does not expire.
- Lifetime should override subscription cancellation or failed Pro payment.
- Refund behavior needs a launch policy before checkout goes live.

## Test Mode Setup

Use Stripe test mode before any production launch.

Recommended setup:

1. Install Stripe through the Vercel Marketplace or configure Stripe manually.
2. Create test products and prices:
   - Pro monthly
   - Pro annual
   - Lifetime
3. Add Vercel environment variables for Preview and Development first.
4. Use Stripe CLI for local webhook forwarding.
5. Test Checkout with Stripe test cards.
6. Verify webhooks update app billing state.
7. Verify entitlement resolution returns `pro` and `lifetime`.
8. Verify cancellation, failed payment, and Lifetime override behavior.
9. Repeat in Vercel Preview before Production.

## Vercel Environment Variables

Expected future env vars:

| Env var | Scope | Purpose |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Server only | Create checkout sessions and verify Stripe state |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client safe | Stripe client initialization if needed |
| `STRIPE_WEBHOOK_SECRET` | Server only | Verify webhook signatures |
| `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` | Server only, also set in Convex | Authorize the verified Next.js webhook route to persist billing snapshots in Convex |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Server only | Pro monthly Checkout line item |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Server only | Pro annual Checkout line item |
| `STRIPE_LIFETIME_PRICE_ID` | Server only | Lifetime Checkout line item |
| `NEXT_PUBLIC_APP_URL` | Client/server | Success and cancel URL origin |

If installed through Vercel Marketplace, Stripe may auto-provision the core
Stripe keys. Product price IDs should still be explicitly configured.

## Legal, Tax, And Accounting Review

Before production checkout:

- Confirm refund policy for Lifetime and subscriptions.
- Confirm whether Lifetime should be described as "ownership", "access", or
  another legally safer term.
- Confirm sales tax/VAT treatment for digital subscriptions and digital
  one-time purchases.
- Confirm Stripe Tax setup or accounting workflow.
- Confirm terms of service and privacy policy are present.
- Confirm financial disclaimer remains visible and clear.
- Confirm pricing is final, not placeholder, before transactional CTAs go live.

## Implementation Boundaries

Implemented as setup-safe plumbing:

- `/api/checkout/stripe` validates plan ID and local account email.
- `/plans` can start Pro monthly, Pro annual, or Lifetime checkout.
- Missing Stripe env vars return a setup-required response instead of creating
  a fake payment.

Do implement later:

- Webhook signature verification.
- Server-side billing state.
- Entitlement resolution from real auth/payment state.
- Billing success/cancel screens.
- Billing support states.

Still not implemented:

- Billing portal.
- B2B billing.
- SMS billing.
- Crypto payments.

## Open Decisions

- Final monthly Pro price.
- Final annual Pro price.
- Final Lifetime launch and standard price.
- Whether Pro has a free trial.
- Whether `past_due` keeps Pro access during a grace period.
- Exact refund policy for Lifetime.
- Whether Stripe Tax is required at launch.
- Whether Billing Portal ships with the first paid launch or after checkout.
