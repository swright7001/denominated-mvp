# Denominated Entitlement Foundation

`src/lib/entitlements.ts` is the central source of truth for consumer plan
access. It covers the current post-MVP tiers:

- `noAccount`
- `freeAccount`
- `pro`
- `lifetime`

The foundation is intentionally local-first while Clerk, Convex, Stripe, and
server-side billing state are not implemented.

## What It Controls

The entitlement configuration defines:

- Calculator access.
- Copy/share result access.
- Saved scenario limit.
- Watchlist access.
- BTC movement impact.
- Daily snapshot.
- Weekly report.
- Email reports.
- Private share links.
- PDF/report export.
- Custom categories and assumption presets.

The basic calculator and result sharing remain included for every tier.

## Current Mock Plan State

`getMockPlanTierFromStorage()` resolves a temporary plan tier from local storage:

1. `denominated.mockPlanTier.v1`, when present and valid.
2. `freeAccount`, when `denominated.signupEmail.v1` exists.
3. `noAccount`, when no local signup email exists.

This gives the UI one place to query plan state before real auth and billing
exist. It also lets future QA set a temporary local plan without adding Stripe.

## Save Limits

`canSaveScenario()` enforces the packaging decision from `DEN-79`:

- No account: 0 saved scenarios.
- Free account: 1 saved scenario.
- Pro: unlimited saved scenarios.
- Lifetime: unlimited saved scenarios.

`SaveScenarioButton` now uses this helper. It still opens the signup prompt for
users without an email, and it shows a value-based plan message if a free
account has already saved its one scenario.

## Future Auth And Payment Connection

When auth and billing arrive, keep UI code pointed at these helpers. Replace
only the plan-resolution layer:

- Clerk should provide the signed-in user identity.
- Convex should store the user profile, saved scenarios, and plan snapshot.
- Stripe should be the billing source for Pro and Lifetime purchases.
- Webhooks should update the server-side user tier.
- Client UI should receive a normalized `PlanTier` and continue to call
  `getPlanEntitlements()`, `getFeatureAccess()`, `canUseFeature()`, and
  `canSaveScenario()`.

Use `docs/stripe-checkout-plan.md` as the Stripe implementation map for
products, prices, checkout sessions, webhook events, cancellation behavior, and
Vercel environment variables.

Do not scatter checks such as `if (user.isPro)` across components. Add or adjust
feature access in `src/lib/entitlements.ts` first, then let UI surfaces query the
central helpers.
