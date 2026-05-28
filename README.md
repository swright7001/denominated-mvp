# Denominated

Denominated is a consumer purchasing-power calculator. It helps people compare everyday expenses in dollars and Bitcoin terms over time.

Core message: **More expensive in dollars. Cheaper in Bitcoin.**

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Vercel-ready structure
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

## Disclaimer

This tool is educational only. It does not provide financial advice. Future Bitcoin prices, inflation rates, and item prices are assumptions, not guarantees.
