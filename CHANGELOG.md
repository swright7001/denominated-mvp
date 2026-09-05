# Changelog

## 0.2.1 - Unreleased

### Changed

- Added a Monday Convex schedule for opted-in Pro and Lifetime accounts, with
  verified-email checks, bounded batches, and shared manual/scheduled deduplication.
- Added explicit automatic-email consent and opt-out controls; existing accounts
  are not automatically subscribed.
- Restored recurring email to the paid-launch scope, including dashboard email
  preferences, the authenticated report request, and plan/privacy wording.
- Required Resend configuration for paid-launch readiness again.
- When automatic tax is approved, Checkout now collects a billing address and
  persists it for existing customers so Stripe can calculate tax reliably.

### Security

- Preserved verified-account, paid-entitlement, opt-in, and weekly delivery
  deduplication checks on the report endpoint.
- Updated Next.js to 16.3.0 and the PostCSS override to 8.5.23.

### Notes

- The public calculator remains free and does not require an account.
- Automatic weekly scheduling is implemented but disabled. Production sender
  verification and real inbox delivery remain required launch work under
  DEN-104 and DEN-109.

## 0.2.0 - 2026-07-19

### Added

- Added USD, EUR, GBP, CHF, and JPY purchasing-power scenarios behind the
  `DENOMINATED_ENABLE_MULTI_CURRENCY` rollout flag, using official ECB daily
  reference rates and explicit stale/manual fallback states.
- Added Stripe Checkout, webhook entitlement persistence, Billing Portal,
  legal-policy, weekly report, monitoring, analytics, and paid-readiness
  foundations.
- Added account billing status, localized saved scenarios and reports, and a
  signed-in weekly-report request flow for eligible accounts.

### Security

- Kept checkout fail-closed unless both the paid launch flag and every
  production provider, support, legal, and tax readiness gate pass.
- Restricted billing entitlement writes to the verified Stripe webhook path
  and removed client-writable preset mutations.
- Required the verified branded support alias before exposing customer support
  contact details or declaring paid launch readiness.

### Notes

- The public calculator remains free and does not require an account.
- Production paid checkout remains disabled until live provider verification
  and owner-approved legal and tax facts are recorded.
- Existing saved scenarios and share links without a currency migrate to USD.

## 0.1.3 - 2026-07-18

### Added

- Added a captioned, accessible product walkthrough built from real public Denominated screens.
- Added a public support route with account, feedback, and private security paths.
- Added guided GitHub bug and product-feedback forms plus contributor and pull-request instructions.
- Added the approved multi-currency architecture and implementation roadmap for USD, EUR, GBP, CHF, and JPY.

### Fixed

- Connected the production dashboard to the same Convex account tier and saved-scenario state used by the account and watchlist.
- Stabilized the initial calculator chart dimensions and corrected above-fold result-card image loading.

### Notes

- The free calculator remains available without an account.
- Multi-currency is designed but remains intentionally disabled until its calculation, provider, persistence, and migration work ships together.
- Paid checkout remains disabled in the public free launch.

## 0.1.2 - 2026-07-18

### Fixed

- Restored authenticated scenario saving through the Next.js 16 proxy layer and added clearer save errors.
- Kept the header readable across mobile, tablet, and desktop widths.
- Replaced the inactive BTC button treatment with a clear benchmark label.
- Restored the global header and footer on the personal dashboard.
- Displayed account plan status from persisted account and billing data.
- Aligned the calculator's current-price fields.
- Removed the duplicate watchlist save action.
- Replaced the default deployment favicon with Denominated app icons.

### Notes

- The free calculator remains available without an account.
- Paid checkout remains disabled in the public free launch.
