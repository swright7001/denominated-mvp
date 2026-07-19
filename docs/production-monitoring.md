# Production monitoring

Denominated uses Vercel-native observability for the initial production launch.
This keeps the operational surface small while the app remains a consumer web
application with a limited backend.

## Signals

- `GET /api/health` is the deployment health check. A healthy deployment returns
  HTTP 200, `status: "ok"`, the service name, and a timestamp. It does not call
  Clerk, Convex, Stripe, Resend, or CoinGecko, so provider incidents remain
  distinguishable from a failed web deployment.
- Next.js `instrumentation.ts` records server runtime errors as the structured
  `server_runtime_error` event in Vercel Runtime Logs.
- Route and root error boundaries submit a bounded `client_runtime_error` event
  and show a recovery screen instead of exposing exception details.
- Vercel Web Analytics and Speed Insights remain enabled for aggregate traffic
  and performance signals.
- Provider routes log bounded operational events for BTC price fallback, Stripe
  webhook processing, and weekly report failure.

## Privacy boundary

Monitoring events may include an opaque Next.js digest, HTTP method, route file
template, error class, route type, and coarse status. They must not include:

- error messages or stack traces in custom events
- request URLs, query strings, headers, cookies, or bodies
- names, email addresses, Clerk user IDs, Stripe customer/subscription IDs
- scenario names, assumptions, prices, or saved-scenario contents
- provider secrets, API keys, webhook payloads, or checkout URLs

The client endpoint accepts only a fixed event schema and a maximum 512-byte
body. Unknown fields are discarded.

## Release health check

For every Production deployment and paid Preview candidate:

1. Confirm the Vercel deployment is `READY`.
2. Request `/api/health`; require HTTP 200 and `status: "ok"`.
3. Load `/`, `/calculator`, `/examples`, and `/learn` on a mobile and desktop
   viewport; require no console errors and no error fallback.
4. For paid Preview, also request `/api/readiness/paid-preview` and complete the
   authenticated checkout/webhook/billing runbook.
5. Review Runtime Logs for new `server_runtime_error`,
   `client_runtime_error`, repeated BTC fallback, webhook failures, and weekly
   report failures.

Rollback the deployment when the health endpoint fails, a core route cannot
render, or a new runtime error repeats on a core flow.

## Review cadence and alerts

- During launch week: review Vercel Runtime Logs, Web Analytics, and Speed
  Insights each day and after every deployment.
- After launch week: review weekly and after every deployment.
- Treat any repeated core-flow runtime error, five or more identical error events
  in 15 minutes, or a failed health check as an incident requiring immediate
  investigation.
- Treat repeated Stripe webhook or weekly-email failures as provider incidents;
  disable the affected paid feature if data consistency or customer access is at
  risk.

The Hobby deployment does not provide a custom paging integration in this
implementation. The review cadence above is the launch alerting policy; add a
dedicated paging/error provider when traffic or backend complexity warrants it.

## Known benign conditions

- A single `btc_price_lookup` fallback or stale event can occur during a
  CoinGecko timeout. The calculator uses the labeled fallback price. Escalate
  only when fallback repeats across checks or persists for more than 15 minutes.
- Clerk returns a hidden 404 for protected API routes when no session exists.
  This is expected access control, not an application outage.
- Paid Preview intentionally uses Clerk development keys and therefore emits
  Clerk's development-key console warning. This is expected only on Preview;
  the same warning in Production is a launch blocker covered by DEN-85.
- Duplicate Stripe webhook deliveries are expected. Convex persistence is
  idempotent; investigate only signature failures, persistence errors, or an
  entitlement that does not converge.
- A duplicate weekly report request is intentionally deduplicated per account
  and ISO week.
- Browser extension and content-blocker console messages are not Denominated
  runtime errors unless reproduced in a clean browser profile.
