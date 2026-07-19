# Changelog

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
