# Recurring weekly reports

The Convex cron runs Monday at 13:00 UTC (09:00 EDT / 08:00 EST), in batches of
25 explicitly subscribed accounts. Each batch spaces sends two seconds apart
and schedules its continuation after 50 seconds. Existing accounts are not
automatically enrolled, even if their legacy weekly-report preference is true.

On the paid dashboard, customers explicitly select “Send me the weekly
purchasing-power email automatically on Mondays.” Turning that checkbox off,
or disabling weekly reports, stops future reservations. Pro or Lifetime access,
the current verified primary Clerk email, the stored account email, and consent
are checked before each send. At most 20 saved scenarios are used. Emails link
back to the dashboard to manage preferences and opt out.

Manual and scheduled sends share the account/week delivery record and Resend
idempotency key. Concurrent reservations are transactional. Completed sends and
recent in-flight sends are skipped. Uncertain provider failures are recorded
without automatic resend; manual recovery allows at most three attempts, only
within 23 hours of the first reservation. This ends before Resend's 24-hour
idempotency window. Changed payloads may be rejected by Resend during recovery;
never change the idempotency key to force a duplicate. Inspect the provider
record before recovery. Errors log only a bounded code/period, not recipients
or credentials. A queued action that has already passed its final consent
check may still finish if the customer opts out while the provider request is
in flight.

## Activation

1. Verify `reports.getdenominated.com` in Resend. The domain was added on
   September 5, 2026; DNS verification is still pending. The authoritative DNS
   is Spaceship (`launch1.spaceship.net`, `launch2.spaceship.net`). Use the
   records currently shown in Resend: DKIM TXT at `resend._domainkey.reports`,
   and sending CNAMEs at `rsend.reports` and `send.reports`. Do not change the
   apex MX records or the existing `hardmoneyhustlers.com` sender.
2. Create a Resend key restricted to sending from this domain. Store it securely
   as `RESEND_API_KEY`; use `Denominated <reports@reports.getdenominated.com>`
   for `DENOMINATED_EMAIL_FROM`.
3. Scheduled delivery runs in Convex, so configure its own `RESEND_API_KEY`,
   `DENOMINATED_EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`, `CLERK_SECRET_KEY`, and
   `CLERK_JWT_ISSUER_DOMAIN` in the intended Convex environment. The Clerk key
   must belong to the issuer used for account identities. Vercel variables do
   not automatically propagate to Convex. Manual delivery still uses Vercel's
   variables. The scheduled sender rejects `resend.dev` and non-Denominated
   domains, including the HMH sender.
4. Keep `DENOMINATED_ENABLE_RECURRING_EMAIL` unset until a verified sender and
   an approved delivery test are ready. Deploy the backend to the intended
   environment; enable this flag there only when ready to send. Disabling it
   stops both new batches and queued actions before reservation.
5. With one opted-in test Pro or Lifetime account, verify scheduled delivery,
   the Resend message ID, inbox arrival, and the shared delivery record.
   Confirm a manual send in the same week cannot duplicate it. Confirm opt-out
   and downgrade skip delivery. Record evidence in DEN-104/DEN-109.
6. Production needs separate credentials and verification. No production
   deployment, real send, or paid-checkout activation is implied by a passing
   local test or development deployment.

## Verification

`npm test` runs the existing unit suite and Convex integration tests. Convex
tests mock Clerk, market data, and Resend; no real messages are sent. They cover
explicit consent, cross-account recipient verification, stale attempts, manual
and scheduled deduplication, cancellation, downgrade, batch limits, and disabled
operation. `npx tsc --noEmit`, lint, build, and `npx convex dev --once` verify
types and deployment compatibility. Development deployment is
`strong-sandpiper-314`; its recurring flag remains unset.
