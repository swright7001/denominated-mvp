# Denominated

Denominated is a consumer purchasing-power calculator. It helps people compare everyday expenses in dollars and Bitcoin terms over time.

Core message: **More expensive in dollars. Cheaper in Bitcoin.**

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Vercel-ready structure
- Placeholder API layer for future Convex, Clerk, Resend, and Stripe work

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
- Requires no login.
- Implements no real external APIs.
- Implements no payments.
- Includes placeholder future API functions in `src/lib/api.ts`.
- Uses the provided Denominated logo and UI references from `public/brand`.

## Disclaimer

This tool is educational only. It does not provide financial advice. Future Bitcoin prices, inflation rates, and item prices are assumptions, not guarantees.
