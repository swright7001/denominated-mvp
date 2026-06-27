# Denominated Paid V2 Preview Runbook

This runbook is the launch gate for the paid V2 branch. Keep the free
calculator live, keep paid checkout off in Production, and prove the paid flow
on Vercel Preview before merging or promoting anything.

Current branch: `codex/paid-v2-launch`

Draft PR: https://github.com/swright7001/denominated-mvp/pull/2

## Launch Rule

Do not set `DENOMINATED_ENABLE_PAID_CHECKOUT=true` in Production until all
Preview checks in this document have passed.

It is acceptable to temporarily set `DENOMINATED_ENABLE_PAID_CHECKOUT=true` for
the paid branch's Vercel Preview deployment after Clerk, Convex, Stripe prices,
and Stripe webhooks are configured for Preview.

## Required Preview Environment Variables

Add these to the Vercel project for the Preview environment first. Prefer a
branch-scoped Preview variable for `codex/paid-v2-launch` when possible.

| Area | Environment variables |
| --- | --- |
| Clerk auth | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN` |
| Convex storage | `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` |
| Stripe checkout | `STRIPE_SECRET_KEY`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID`, `STRIPE_LIFETIME_PRICE_ID` |
| Stripe webhooks | `STRIPE_WEBHOOK_SECRET`, `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` |
| Email foundation | `RESEND_API_KEY` |
| App URL | `NEXT_PUBLIC_APP_URL` |
| Feature flag | `DENOMINATED_ENABLE_PAID_CHECKOUT` |

`DENOMINATED_ENABLE_PAID_CHECKOUT` should stay unset or `false` until the
Preview deployment is ready for Stripe test-mode checkout validation.

## Provider Setup

1. Configure Clerk for the Preview URL.
2. Configure the Clerk Convex JWT template with audience/application ID
   `convex`.
3. Set `CLERK_JWT_ISSUER_DOMAIN` to the Clerk issuer used by that JWT template.
4. Configure Convex env vars, including
   `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` with the same value used by Vercel.
5. Create Stripe test-mode products/prices:
   - Denominated Pro monthly
   - Denominated Pro annual
   - Denominated Lifetime
6. Add the three Stripe test price IDs to Vercel Preview.
7. Create a Stripe test webhook endpoint pointed at the Preview deployment:
   `/api/webhooks/stripe`
8. Subscribe the webhook endpoint to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Local Verification Before Preview

Run the normal checks before pushing a new Preview deployment:

```bash
npm test
npm run build
npm run lint
```

If Vercel Preview env vars have been configured, pull them locally only into a
gitignored file:

```bash
vercel env pull .env.local --environment=preview --yes
```

Never commit `.env.local` or provider secrets.

## Preview Verification

Use a fresh test user and Stripe test card data.

1. Deploy the paid branch to Vercel Preview.
2. Confirm `DENOMINATED_ENABLE_PAID_CHECKOUT` is still off.
3. Visit the Preview URL.
4. Sign up with Clerk.
5. Sign out and sign back in.
6. Run a calculator scenario.
7. Save the scenario.
8. Confirm `/watchlist`, `/dashboard`, and `/account` read the saved scenario
   from the signed-in account.
9. Confirm the account starts as Free Account and enforces the one-saved-scenario
   limit without blocking the free calculator.
10. Enable `DENOMINATED_ENABLE_PAID_CHECKOUT=true` only for the Preview branch.
11. Redeploy or rebuild Preview so the flag is active.
12. Start Pro monthly checkout from `/plans`.
13. Complete checkout with a Stripe test card.
14. Confirm the Stripe webhook updates Convex billing state.
15. Confirm `/account`, `/dashboard`, `/watchlist`, and gated surfaces resolve
    Pro from persisted Convex billing state.
16. Open the authenticated billing portal from `/billing`.
17. Cancel the subscription in the portal.
18. Confirm cancellation webhook state is reflected without blocking the free
    calculator.
19. Trigger a failed-payment subscription state in Stripe test mode.
20. Confirm the app handles the billing issue without trading language or hard
    blocking the free calculator.
21. Complete Lifetime checkout with a separate test user.
22. Confirm Lifetime grants access from persisted Convex billing state.
23. Confirm Lifetime continues to win over subscription cancellation or failed
    payment changes.

## Production Promotion Gate

Only merge/promote the paid PR after:

- Preview auth is verified.
- Preview Convex saved scenario storage is verified.
- Preview Stripe checkout is verified for Pro and Lifetime.
- Preview Stripe webhooks persist billing snapshots.
- Billing portal opens only for the authenticated Stripe customer.
- Cancellation and failed-payment flows are verified.
- Legal, refund, support, tax/accounting, and pricing language are approved.
- `DENOMINATED_ENABLE_PAID_CHECKOUT=true` is intentionally set for Production.

Until then, Production should remain the free launch.
