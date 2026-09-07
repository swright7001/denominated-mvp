# Example price refresh verification

Built from `origin/main` at `93e7a4b9a1af7f8fa7f6d625af76bfad0c257497` in the isolated `/tmp/den-price-history-build` clone. Approved prototype: `/tmp/denominated-price-preview/index.html`. No merge or deployment performed. Recorded date `2026-09-06` denotes editorial review, not a live publication date.

## Checks

- `npm test`: 166 passed, zero failures. Five focused tests cover the six exact records, preset/metadata mapping, unchanged budgets, live BTC application, signed/zero deltas, future history ordering, and methodology.
- `npm run lint`: passed.
- `npm run build`: passed, including TypeScript and all public routes.
- `git diff --check`: passed.
- Chromium production browser checks: 1440×1000 desktop and 390×844 portrait, light and dark. All 12 scenario routes returned 200 in every combination. Six source/history cards and individual history navigation passed. No nested anchors, horizontal overflow, or browser page errors. Live CoinGecko BTC values remained visible.
- Existing saved-scenario tests pass; no saved-value/storage code changed.

See [test log](tests.log), [lint log](lint.log), [production build log](build.log), and [browser results](browser-results.json). The [browser script](browser-check.mjs) uses the primary checkout's existing Playwright package solely for verification; it does not write to that checkout or add dependencies. Run it against `npm run start -- --port 3217` after building, then stop the server.

## Screenshots

| View | Desktop dark | Desktop light | Mobile dark | Mobile light |
| --- | --- | --- | --- | --- |
| Examples | [PNG](examples-desktop-dark.png) | [PNG](examples-desktop-light.png) | [PNG](examples-mobile-dark.png) | [PNG](examples-mobile-light.png) |
| History | [PNG](history-desktop-dark.png) | [PNG](history-desktop-light.png) | [PNG](history-mobile-dark.png) | [PNG](history-mobile-light.png) |
| Tuition detail | [PNG](tuition-desktop-dark.png) | [PNG](tuition-desktop-light.png) | [PNG](tuition-mobile-dark.png) | [PNG](tuition-mobile-light.png) |

Examples/history screenshots were visually inspected in all four combinations. Detail captures show the benchmark explanation within the existing calculator page; chart animation timing can vary in screenshots.

## Data maintenance

Append a typed record in `src/lib/price-history.ts`, preserving previous IDs and records. Use the preceding record's price/date for the next previous value/date. Keep source period separate from editorial recorded date. The latest record supplies both the preset price and definition. History sorts newest first, with later appended records first on the same date. Source URLs are editorial references and may later change their published content; there is no scraping or reconstructed series.

## Scope and risk

Medium risk: shared preset consumers now receive the six approved values; unchanged growth assumptions yield different projections as a consequence. USD history deliberately stays independent of scenario display currency. National benchmarks have different definitions, especially housing, care, childcare, and tuition; displayed differences must not be interpreted as inflation or comparable market movements. Rollback: revert the PR.

Linear creation was attempted upstream but blocked by the workspace's free issue limit, per the supplied contract. No issue ID or follow-up issue was fabricated. Independent review remains required.
