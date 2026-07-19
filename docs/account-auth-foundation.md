# Denominated Account And Auth Foundation

This document covers the account foundation added before production auth.

## Selected Production Auth Provider

Clerk is the selected production auth provider because it is available through
the Vercel Marketplace, supports Next.js App Router, and can provide a clean
email-first signup path without requiring phone numbers.

Clerk is now installed as `@clerk/nextjs` and wired conditionally:

- `src/app/layout.tsx` wraps the app in `ClerkProvider` when Clerk env vars are
  present.
- `middleware.ts` protects account, billing, dashboard, watchlist, checkout,
  and billing API surfaces when Clerk is configured.
- `/sign-in` and `/sign-up` render Clerk components when configured, and a
  setup fallback when not configured.

Expected future env vars:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

## Current MVP Account Behavior

The app currently uses a local-first account foundation:

- `/account` lets users create or update an email-only local account.
- `denominated.signupEmail.v1` stores the local email.
- `denominated.mockPlanTier.v1` stores temporary plan state for QA.
- Saved scenarios remain in `denominated.savedScenarios.v1`.
- Signing out locally removes account and mock plan state, but does not delete
  saved scenarios from the device.

This keeps the calculator free and avoids adding hard auth before Clerk and
Convex are configured.

## Saved Scenario Behavior

Users can currently:

- Save scenarios after creating a local email account.
- View saved scenarios in `/watchlist`.
- Rename saved scenarios.
- Delete saved scenarios.
- Reopen saved scenarios in the calculator.

Free accounts are limited to one saved scenario by
`src/lib/entitlements.ts`. Pro and Lifetime mock tiers can be tested from the
Account page until real billing exists.

## Future Clerk And Convex Connection

When production auth is added:

1. Configure Clerk through Vercel Marketplace or equivalent env setup.
2. Replace local email reads with Clerk user identity.
3. Migrate saved scenarios from local storage to Convex per signed-in user.
4. Remove or hide local mock plan controls outside development.
5. Keep local calculator access available for unauthenticated users.
6. Keep `PlanTier` resolution centralized through `src/lib/entitlements.ts`.

Do not require phone/SMS for the first account flow.
