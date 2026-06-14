# Denominated

Denominated is a consumer purchasing-power calculator. It helps people compare everyday expenses in dollars and Bitcoin terms over time.

Core message: **More expensive in dollars. Cheaper in Bitcoin.**

Production URL: [https://denominated-mvp.vercel.app](https://denominated-mvp.vercel.app)

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Vercel-ready structure
- Vercel Web Analytics and Speed Insights
- Server-side BTC/USD price route backed by CoinGecko
- Placeholder API layer for future consumer price, auth, email, and Stripe work

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
```

## MVP Notes

- Uses local state only.
- Fetches BTC/USD spot price server-side from CoinGecko when available.
- Requires no login.
- Implements no client-side third-party API calls.
- Implements no payments.
- Includes placeholder future API functions in `src/lib/api.ts`.
- Documents the future Stripe checkout plan in `docs/stripe-checkout-plan.md`.
- Uses the provided Denominated logo and UI references from `public/brand`.

## Live BTC Price Data

The calculator calls `/api/prices/bitcoin`, a Next.js route handler that fetches
Bitcoin's USD spot price from CoinGecko's `/simple/price` endpoint with
`include_last_updated_at=true`.

- Provider: CoinGecko
- Server cache: 60 seconds
- Stale threshold: 5 minutes after CoinGecko's reported `last_updated_at`
- Fallback: `$80,000`, still editable in the calculator
- Optional server-only env var: `COINGECKO_API_KEY`

## Production Notes

- Vercel Git Integration is connected to `swright7001/denominated-mvp`.
- Production deploys are triggered from `main`.
- Web Analytics and Speed Insights components are mounted in the root layout.
- Analytics data appears in Vercel when the project-level analytics features are enabled.
- Baseline security headers are configured in `next.config.ts`.
- SEO metadata, Open Graph metadata, `robots.txt`, and `sitemap.xml` are configured for the current production URL.

## Smoke Test Checklist

- Homepage loads and CTAs route to calculator/examples.
- Calculator loads live BTC price or falls back to editable manual input.
- Calculator inputs update result cards, opportunity summary, share card, and chart.
- Copy tweet button shows a copied state.
- Examples page links to scenario detail pages.
- Learn page and disclaimer are visible.
- Mobile layout has no obvious overlap or broken assets.

## Roadmap

- Add a Denominated tab/link from the Hard Money Hustlers guest site.
- Add shareable scenario URLs.
- Harden live BTC pricing with stronger observability and provider fallback.
- Decide custom domain strategy.
- Add optional saved scenarios, email reports, auth, and premium features later.

## Disclaimer

This tool is educational only. It does not provide financial advice. Future Bitcoin prices, inflation rates, and item prices are assumptions, not guarantees.
