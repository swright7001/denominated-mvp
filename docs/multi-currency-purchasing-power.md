# Multi-currency purchasing-power design

Status: Implemented behind `DENOMINATED_ENABLE_MULTI_CURRENCY`. Production
activation remains a rollout decision after Preview and mobile QA.

## Product model

Bitcoin remains the benchmark denomination. A scenario gains a `currencyCode`
that identifies the local fiat currency used for both the item price and the
Bitcoin reference price.

Supported launch codes:

| Code | Display locale | Minor units | Example |
| --- | --- | ---: | --- |
| USD | en-US | 2 | $41,000.00 |
| EUR | de-DE | 2 | 41.000,00 EUR |
| GBP | en-GB | 2 | GBP 41,000.00 |
| CHF | de-CH | 2 | CHF 41'000.00 |
| JPY | ja-JP | 0 | JPY 41,000 |

Calculations continue to use unrounded JavaScript numbers. Locale formatting is
applied only at display boundaries. The core formulas do not change:

```text
currentItemCostBTC = currentItemPriceFiat / currentBTCPriceFiat
futureItemPriceFiat = currentItemPriceFiat * (1 + itemInflationRate) ^ years
futureBTCPriceFiat = currentBTCPriceFiat * (1 + btcGrowthRate) ^ years
futureItemCostBTC = futureItemPriceFiat / futureBTCPriceFiat
```

## Exchange-rate source

Use the European Central Bank's official daily reference rates as the primary
fiat source. Convert the existing USD BTC price into the scenario currency by
crossing through the ECB EUR-base rates. This is a purchasing-power benchmark,
not an executable FX quote.

Provider response metadata must include:

- currency code
- converted BTC price
- source name and URL
- provider observation timestamp
- application fetch timestamp
- `live`, `stale`, `fallback`, or `manual` status

Cache successful reference rates for six hours. Mark observations older than 48
hours as stale to accommodate weekends and holidays. If the provider fails, use
the most recent cached observation. When no cached observation exists, preserve
the editable USD default or require an explicit manual BTC price for non-USD
scenarios. Never silently label a fallback as live.

## Inputs and formatting

- Currency selection changes labels, symbols, and the displayed BTC reference
  price; it does not rewrite a value the user has manually entered without an
  explicit conversion confirmation.
- Inputs accept locale decimal separators but normalize to a canonical numeric
  draft internally.
- Currency symbols are never used as stored identifiers.
- JPY displays zero minor units by default while retaining full internal
  precision.
- Charts use `Cost in {CODE}` and `Cost in BTC`; result cards name the local
  currency rather than assuming dollars.

## Data contracts and migration

Add `currencyCode: CurrencyCode` to scenario inputs, saved scenarios, presets,
reports, and snapshot baselines. Existing records and URLs without a code
migrate to `USD` at read time and are backfilled lazily on the next write.

Share URLs add `currency=USD|EUR|GBP|CHF|JPY`. Unknown codes fall back to USD and
are never passed into `Intl.NumberFormat`. Share cards, tweet copy, watchlists,
daily snapshots, weekly reports, and exports must carry the code explicitly.

Presets remain country-specific. The initial preset catalog stays USD until a
maintained local-price source exists for another region; changing the display
currency is not represented as changing the underlying national price source.

## Rollout and analytics

1. Ship the domain model and backward-compatible readers behind a disabled
   `multiCurrency` feature flag.
2. Add the ECB provider, caching, stale handling, and manual fallback.
3. Enable internal Preview testing for all five currencies.
4. Release the selector gradually after saved scenarios and share links pass
   migration tests.

Track only currency code, provider status, and product surface. Do not send item
names, entered prices, email addresses, or saved-goal details to analytics.

## Required verification

- unit tests for cross-rate conversion, stale/fallback behavior, locale parsing,
  formatting, JPY precision, and unsupported codes
- migration tests proving old USD scenarios and URLs remain unchanged
- formula parity tests proving BTC results do not change when both fiat values
  are converted by the same rate
- saved-scenario, chart, result-card, share-link, tweet, snapshot, and report
  tests for every supported code
- mobile browser checks for long currency labels and formatted values
- provider outage and weekend-staleness walkthroughs

## Implemented scope

1. The `CurrencyCode` domain model, USD migration readers, and feature flag are
   implemented.
2. The ECB adapter, cache policy, status metadata, and provider tests are
   implemented.
3. Locale-aware parsing and formatting are implemented.
4. The calculator selector and manual-value conversion confirmation are
   implemented.
5. Currency is carried through Convex storage, URLs, share cards, watchlists,
   snapshots, and weekly reports.
6. Analytics records only bounded currency/provider/surface metadata.

## Non-goals

- No FX trading, conversion execution, buy/sell language, intraday quote claims,
  or currency forecasting.
- No cosmetic header selector before the calculation and persistence contracts
  are complete.
