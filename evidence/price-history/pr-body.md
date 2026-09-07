## What changed

Refresh six example benchmarks and add a running USD price history to the existing Denominated library. Typed append-only records now supply preset prices and definitions, so future appended updates flow into both the examples and log. Cards retain BTC conversions and scenario navigation while adding source periods, signed USD/percentage differences, and independent history links. A standalone chronological history page supplies stable per-example and per-record anchors, with methodology also exposed on detail/SEO routes.

| Stable slug | Previous USD | Refreshed USD | Source / data period |
| --- | ---: | ---: | --- |
| median-us-house | 412300 | 440300 | [NAR](https://www.nar.realtor/newsroom/nar-existing-home-sales-report-shows-1-7-decrease-in-july), July 2026, existing single-family national median |
| rent | 1589 | 1515/month | [Zumper](https://www.zumper.com/rent-research/national-rent-report), August 2026, median one-bedroom asking rent |
| elder-care | 5419 | 6200/month | [CareScout](https://www.carescout.com/cost-of-care), 2025 median assisted living |
| childcare | 1400 | 13184/12 monthly equivalent | [CCAoA](https://info.childcareaware.org/price-and-supply-2025), 2025 annual national average combining care types |
| college-tuition | 55530 | 47800 = 11950×4 | [College Board](https://research.collegeboard.org/media/pdf/Trends-in-College-Pricing-and-Student-Aid-2025-final_1.pdf), 2025–26 public in-state tuition/fees |
| wedding | 35000 | 34200 | [The Knot](https://www.theknot.com/content/average-wedding-cost), weddings held in 2025 |

## Why

Implement the user's approved prototype and explicit contract while preserving all 12 examples, existing light/dark tokens, live BTC conversion, routes, and editable scenario assumptions. Revisions need transparent provenance instead of implying that a change in preset equals comparable market inflation.

## Linear issue

Creation was attempted upstream but blocked by the Linear workspace free issue limit, as stated in the supplied contract. No Linear issue ID is available. This PR carries the complete acceptance contract and evidence; no issue or approval was fabricated.

## Acceptance criteria checked

- [x] AC-1: Only the six approved preset values/definitions refreshed, with stable slugs and exact arithmetic above. Other six values and all growth assumptions preserved.
- [x] AC-2: Readonly typed records contain stable ID, slug, previous/new USD, source URL/name, source data period, recorded date, unit, definition, and methodology. Previous dates are null/unknown. First editorial review record is 2026-09-06, explicitly not publication/deployment. Latest-record mapping supplies presets and history.
- [x] AC-3: Accessible linked Examples/Price history views; six cards show sources, periods, signed USD/percent comparisons, and individual history access. All 12 examples, BTC values, and scenario links retained. Others are labeled illustrative estimates/product budgets. Lucide icons; no nested links.
- [x] AC-4: History groups newest-first by recorded date and supports future append operations, including same-day ordering and stable record anchors. Mobile portrait has no horizontal overflow. Standalone linked history means no dialog focus/Escape handling is needed.
- [x] AC-5: Rise/fall/unchanged/zero-baseline deltas covered. Historical formatting always uses USD independent of scenario display currency. House/childcare/tuition/care corrections, unknown previous dates, and limitations are explicit. Differences are not labeled annual inflation or proven market movements. Tuition excludes living costs, aid, and future during-enrollment increases; childcare combines care types.
- [x] AC-6: Existing detail/SEO pages expose source/history through their shared component. Existing metadata/share URL generation reads refreshed scenarios; no conflicting literal old values remain outside history. Existing routes and saved user scenarios retained; no fabricated series.
- [x] AC-7: Focused meaningful tests plus full tests/lint/production build/diff check passed. Browser desktop/mobile in both themes, screenshots, source/history navigation, and all scenario routes verified.
- [x] Existing free calculator behavior is preserved except approved preset inputs.
- [x] No sensitive account, provider, or payment data included.

## Verification

- `npm test`: **166 passed, 0 failed**, including five focused price-history tests.
- `npm run lint`: passed, including the browser verification script.
- `npm run build`: passed, including TypeScript and production routes.
- `git diff --check`: passed.
- Chromium production check: desktop 1440×1000 and mobile portrait 390×844, light and dark. All 12 scenario pages returned 200 in each combination; six sourced benchmark cards and history links, no nested anchors, no overflow, no page errors. Live BTC prices displayed.
- [Evidence index, logs, and all 12 screenshots](https://github.com/swright7001/denominated-mvp/blob/codex/example-price-history/evidence/price-history/README.md).
- [Examples desktop dark](https://github.com/swright7001/denominated-mvp/blob/codex/example-price-history/evidence/price-history/examples-desktop-dark.png) · [Examples mobile light](https://github.com/swright7001/denominated-mvp/blob/codex/example-price-history/evidence/price-history/examples-mobile-light.png).
- [History desktop light](https://github.com/swright7001/denominated-mvp/blob/codex/example-price-history/evidence/price-history/history-desktop-light.png) · [History mobile dark](https://github.com/swright7001/denominated-mvp/blob/codex/example-price-history/evidence/price-history/history-mobile-dark.png).

How to test: `npm ci`, `npm test`, `npm run lint`, `npm run build`, then `npm run start -- --port 3217`. Browse `/examples`, follow each source/history link, inspect `/examples/price-history#childcare` and tuition exclusions on `/examples/college-tuition`, switch themes, and compare desktop/mobile. Stop the server afterward. The evidence browser script uses the primary checkout's existing Playwright package by absolute import for verification only; no dependency added.

## Risk and rollback

**Medium risk.** Six shared preset inputs alter derived projections on consuming surfaces; national source definitions differ and external source pages may change. The UI explains these benchmark revisions. Saved values, formulas, and growth assumptions are untouched. The local production test server is stopped. Rollback: revert this PR. No merge/deployment or self-approval performed; independent review follows.

## Intentionally not done

- NG-1: No auth, billing, Convex, email, provider, formula, analytics, scraping, or scheduling changes.
- NG-2: No changes to other preset values, growth assumptions, saved user values, or snapshots.
- NG-3: $0 spent; no new dependencies or services.
- NG-4: No merge or deployment. No Discord gate work.
- No fabricated previous source dates, historical series, or market-inflation claims.
- Follow-up issues created: none; workspace issue limit remains an upstream constraint.

## Agent involvement

Codex implemented and verified in the isolated clean clone from `93e7a4b9a1af7f8fa7f6d625af76bfad0c257497`, read repository instructions, the installed Next.js routing/component docs, existing patterns, and the approved prototype. Primary checkout was not modified. Builder has not approved its own work; independent exact-commit review is required.
