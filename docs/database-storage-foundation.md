# Denominated Database Storage Foundation

This document captures the Convex storage foundation for DEN-31.

## Convex Project

- Convex project: `denominated-mvp`
- Dev deployment: `dev:strong-sandpiper-314`
- Dev URL: `https://strong-sandpiper-314.convex.cloud`

Local development uses `.env.local` for:

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`

Do not commit `.env.local`.

## Data Model

`convex/schema.ts` defines three launch tables:

- `accounts`: account profile, email preferences, and billing snapshot fields.
- `savedScenarios`: durable per-user saved calculator scenarios.
- `scenarioPresets`: preset scenario records plus source metadata fields.

Saved scenarios are owned by Convex auth identity through
`identity.tokenIdentifier`. Mutations do not accept a user ID from the client.

## Public Convex Functions

`convex/accounts.ts`:

- `getViewerAccount`
- `ensureViewerAccount`
- `updateEmailPreferences`

`convex/billing.ts`:

- `syncFromStripeWebhook`

`convex/savedScenarios.ts`:

- `list`
- `save`
- `importLocalWatchlist`
- `rename`
- `remove`

`convex/presets.ts`:

- `list`

Preset writes are intentionally not exposed as public signed-in mutations.
Before launch, add a controlled seed workflow with source metadata if presets
need to move into Convex.

Billing state is not client-writable. Paid plan fields on `accounts` are updated
through the Stripe webhook sync path in `convex/billing.ts`, protected by
`DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET`.

## Clerk Dependency

Convex authenticated writes require Clerk JWT configuration:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`

`src/app/layout.tsx` only enables the Convex client provider when both Clerk and
Convex public environment variables exist. This preserves local MVP behavior
when auth is not configured.

`convex/auth.config.ts` intentionally ships with an empty provider list until
the production Clerk issuer exists. After Clerk is configured, update it to:

```ts
export default {
  providers: [
    {
      domain: "https://YOUR_CLERK_ISSUER_DOMAIN",
      applicationID: "convex",
    },
  ],
};
```

Then set the matching issuer value in the Convex dashboard/Vercel environment
and rerun `npx convex dev --once`.

## Local-To-Account Migration

The MVP watchlist remains stored in `denominated.savedScenarios.v1` until Clerk
is configured. `src/lib/convex-storage.ts` provides conversion helpers for:

- Importing local saved scenarios into `savedScenarios`.
- Mirroring local preset definitions into `scenarioPresets`.

When the signed-in UI is wired, call `savedScenarios.importLocalWatchlist` after
account creation/sign-in, then continue using Convex as the account source of
truth.

`savedScenarios.importLocalWatchlist` requires an account record and enforces
the same plan boundary as direct saves: Free Account can have one saved
scenario, while Pro and Lifetime can import up to the mutation batch cap.

## Remaining Launch Work

- Configure Clerk JWT templates and production domain.
- Add the Clerk issuer to `convex/auth.config.ts`.
- Wire account/watchlist/dashboard UI reads and writes to Convex when signed in.
- Set `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` in both Vercel and Convex.
- Link stored `billingSnapshots` to Clerk-backed accounts during account
  creation/sign-in.
- Add a controlled preset seed workflow with source metadata.
- Verify Preview and Production Vercel env vars after the domain is selected.
