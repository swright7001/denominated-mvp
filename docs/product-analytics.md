# Product analytics

Denominated uses Vercel Web Analytics for privacy-oriented aggregate pageviews
and Vercel Runtime Logs for a small fixed set of custom funnel events. This
works on the current Hobby deployment without adding a third-party analytics
vendor, cookies, user profiles, or session replay.

## Event contract

| Event              | Allowed property                   | Purpose                          |
| ------------------ | ---------------------------------- | -------------------------------- |
| `calculator_used`  | `source`: `direct`, `shared`       | Calculator adoption              |
| `preset_opened`    | `surface`: `home`, `examples`      | Preset discovery                 |
| `result_copied`    | `format`: `tweet`, `scenario_link` | Sharing behavior                 |
| `cta_clicked`      | fixed CTA identifier               | Navigation and conversion intent |
| `checkout_started` | `plan`: fixed plan identifier      | Paid Preview funnel intent       |

The API accepts only those enumerated fields, rejects cross-origin requests,
and limits event bodies to 256 bytes. Unknown fields are discarded. Events do
not include scenario or item names, prices, assumptions, email addresses,
Clerk/Stripe/Convex identifiers, page URLs, query strings, IP addresses, or
free-form text. Denominated does not implement session replay.

Vercel may process request-level infrastructure metadata under the Vercel
service configuration. The product event itself intentionally contains no
account or scenario identifier and cannot be used to reconstruct an
individual's calculator activity.

## Dashboard and queries

Use Vercel Web Analytics for pageview and route adoption. Use Vercel Runtime
Logs for custom events:

1. Open the Denominated project in Vercel.
2. Choose **Logs** and select the Production environment and desired time
   window.
3. Filter by an exact event name such as `calculator_used`, `preset_opened`,
   `result_copied`, `cta_clicked`, or `checkout_started`.
4. Compare event counts across equal periods. Do not attempt to identify or
   profile individual visitors.

Useful launch funnel reviews:

- calculator adoption: `calculator_used`
- calculator-to-share: compare `calculator_used` with `result_copied`
- example discovery: `preset_opened`, grouped by `surface`
- homepage CTA mix: `cta_clicked` filtered to `hero_run_scenario` and
  `hero_view_examples`
- signup prompt response: `cta_clicked` filtered to
  `signup_save_scenario` and `signup_continue_without_account`
- paid Preview intent: `checkout_started`, grouped by fixed `plan`

Review daily during launch week and weekly afterward. Aggregate counts may be
used for product decisions; they are not financial behavior or investment
signals.
