# Denominated Free Launch Checklist

This checklist is the source of truth for launching Denominated publicly as a
free purchasing-power calculator before paid accounts are enabled.

## Free Launch Scope

Public launch should focus users on:

- Home
- Calculator
- Examples
- Scenario detail pages
- Learn
- Legal disclaimer, Terms, and Privacy

The public nav and footer intentionally avoid account, dashboard, billing, and
plans surfaces until the paid/account launch path is ready.

## Paid Checkout Safety

Paid checkout is disabled by default. `/api/checkout/stripe` will not create a
Stripe Checkout Session unless:

- `DENOMINATED_ENABLE_PAID_CHECKOUT=true`
- Stripe secret and price environment variables are configured
- Account/auth and billing portal readiness have been completed separately

This keeps the free launch from accidentally accepting paid users before
Clerk-backed identity, Convex account linking, and billing management are ready.

## Required Free Launch Verification

- Homepage loads.
- Calculator loads and BTC price is either live or uses editable fallback.
- Calculator inputs update result cards, chart, share card, and tweet copy.
- Examples page routes to each scenario detail page.
- Learn page is reachable and readable.
- Terms and Privacy pages are reachable.
- Footer disclaimer is visible.
- Mobile nav opens/closes and links route correctly.
- No public navigation points to unfinished paid/account flows.
- `npm test`, `npm run lint`, and `npm run build` pass.

## Still Not Required For Free Launch

- Clerk production auth
- Stripe paid checkout
- Stripe billing portal
- Resend email reports
- Custom domain
- Durable signed-in saved scenarios
- Paid Pro/Lifetime entitlement fulfillment
