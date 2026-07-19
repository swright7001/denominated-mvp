# Denominated

Denominated is a consumer purchasing-power calculator. It helps people compare everyday expenses in dollars and Bitcoin terms over time.

Core message: **More expensive in dollars. Cheaper in Bitcoin.**

Production URL: [https://getdenominated.com](https://getdenominated.com)

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Vercel-ready structure
- Vercel Web Analytics and Speed Insights
- Server-side BTC price route backed by CoinGecko with official ECB fiat
  reference rates
- Clerk authentication and Convex account-backed saved scenarios
- Setup-safe Stripe and email foundations for later paid rollout

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Free Launch Notes

- Keeps the calculator, examples, education, and sharing available without an account.
- Fetches BTC/USD spot price server-side from CoinGecko when available.
- Uses Clerk and Convex for account-backed saved scenarios and plan entitlements.
- Implements no client-side third-party API calls.
- Keeps public paid checkout fail-closed until the explicit paid launch flag
  and production-readiness checks both pass.
- Includes placeholder future API functions in `src/lib/api.ts`.
- Includes account, watchlist, dashboard, support, and product walkthrough routes.
- Documents the future Stripe checkout plan in `docs/stripe-checkout-plan.md`.
- Implements USD, EUR, GBP, CHF, and JPY calculation, persistence, sharing, and
  report support behind `DENOMINATED_ENABLE_MULTI_CURRENCY=true`.
- Uses the provided Denominated logo and UI references from `public/brand`.

## Live BTC Price Data

The calculator calls `/api/prices/bitcoin`, a Next.js route handler that fetches
Bitcoin's USD spot price from CoinGecko's `/simple/price` endpoint with
`include_last_updated_at=true`.

For EUR, GBP, CHF, and JPY, the server crosses that USD reference through the
European Central Bank's official daily EUR-base rates. These are educational
reference values, not executable FX quotes. Successful ECB observations are
cached for six hours and treated as stale after 48 hours.

- Provider: CoinGecko
- Server cache: 60 seconds
- Stale threshold: 5 minutes after CoinGecko's reported `last_updated_at`
- Fallback: `$80,000`, still editable in the calculator
- Optional server-only env var: `COINGECKO_API_KEY`
- Rollout env var: `DENOMINATED_ENABLE_MULTI_CURRENCY=true`

## Production Notes

- Vercel Git Integration is connected to `swright7001/denominated-mvp`.
- Production deploys are triggered from `main`.
- Web Analytics and Speed Insights components are mounted in the root layout.
- Analytics data appears in Vercel when the project-level analytics features are enabled.
- Baseline security headers are configured in `next.config.ts`.
- SEO metadata, Open Graph metadata, `robots.txt`, and `sitemap.xml` are configured for the current production URL.
- `DENOMINATED_SUPPORT_EMAIL` must equal `support@getdenominated.com` and
  `DENOMINATED_SUPPORT_EMAIL_VERIFIED=true` before the private support mail link
  is published. The public feedback and private security paths remain available
  without those variables.
- The private operator inbox at `/support/inbox` uses Resend Receiving and
  requires `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`,
  `DENOMINATED_SUPPORT_EMAIL_FROM`, `DENOMINATED_SUPPORT_RECEIVING_EMAIL`,
  `DENOMINATED_SUPPORT_ADMIN_EMAILS`, and a matching
  `DENOMINATED_SUPPORT_INBOX_SECRET` in Vercel and Convex.
- Forward `support@getdenominated.com` to the Resend-managed receiving address;
  never publish that receiving address. Configure the Resend webhook at
  `/api/webhooks/resend` for `email.received` only.

## Smoke Test Checklist

- Homepage loads and CTAs route to calculator/examples.
- Calculator loads live BTC price or falls back to editable manual input.
- Calculator inputs update result cards, opportunity summary, share card, and chart.
- Copy tweet button shows a copied state.
- Examples page links to scenario detail pages.
- Dashboard, account, and watchlist use the same persisted Convex plan tier.
- Product walkthrough controls and text-only transcript work with a keyboard.
- Support page reaches public feedback and private security channels.
- Learn page and disclaimer are visible.
- Mobile layout has no obvious overlap or broken assets.

## Roadmap

- Add a Denominated tab/link from the Hard Money Hustlers guest site.
- Harden live BTC pricing with stronger observability and provider fallback.
- Finish provider cutover and custom-domain smoke testing for the future paid launch.
- Complete Preview and mobile QA before enabling multi-currency in Production.
- Complete verified support-email forwarding and paid billing operations.

## Disclaimer

This tool is educational only. It does not provide financial advice. Future Bitcoin prices, inflation rates, and item prices are assumptions, not guarantees.
