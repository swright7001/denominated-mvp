import assert from "node:assert/strict";
import test from "node:test";
import { formatPriceDelta, getLatestPriceRecord, getPriceHistory, priceDelta, priceHistory } from "../src/lib/price-history";
import { scenarios } from "../src/lib/scenarios";
import { applyBTCPriceToScenario } from "../src/lib/live-scenarios";
import { buildScenarioCalculatorPath, buildScenarioMetadata } from "../src/lib/scenario-seo";

test("six approved benchmarks are the sole source for presets and share metadata", () => {
  const expected = [["median-us-house", 412300, 440300], ["rent", 1589, 1515], ["elder-care", 5419, 6200], ["childcare", 1400, 13184 / 12], ["college-tuition", 55530, 47800], ["wedding", 35000, 34200]];
  assert.equal(priceHistory.length, 6);
  assert.equal(new Set(priceHistory.map((r) => r.id)).size, 6);
  for (const [slug, previous, next] of expected) {
    const record = getLatestPriceRecord(String(slug));
    const scenario = scenarios.find((s) => s.slug === slug)!;
    assert.equal(record.previousUSD, previous);
    assert.equal(record.newUSD, next);
    assert.equal(scenario.currentItemPriceUSD, next);
    assert.equal(scenario.shortDescription, record.definition);
    assert.equal(record.previousRecordedDate, null);
    assert.equal(record.recordedDate, "2026-09-06");
    assert.ok(record.sourcePeriod && record.sourceName && record.unit && record.methodology);
    assert.equal(new URL(record.sourceURL).protocol, "https:");
    assert.equal(new URL(buildScenarioCalculatorPath(scenario), "https://example.com").searchParams.get("price"), String(next));
    assert.equal(buildScenarioMetadata(scenario).alternates?.canonical, `/examples/${slug}`);
    assert.equal(applyBTCPriceToScenario(scenario, 100000).currentBTCPriceUSD, 100000);
  }
});

test("all twelve stable examples survive and other budgets are unchanged", () => {
  assert.equal(scenarios.length, 12);
  assert.deepEqual(scenarios.filter((s) => !getLatestPriceRecord(s.slug)).map((s) => [s.slug, s.currentItemPriceUSD]), [
    ["tesla-model-3", 41000], ["vacation", 5242], ["laptop", 1299], ["dividend-stock-portfolio", 250000], ["starting-a-business", 50000], ["emergency-fund", 30000],
  ]);
});

test("USD deltas handle rises, falls, unchanged prices and a zero baseline", () => {
  assert.deepEqual(priceDelta(100, 125), { usd: 25, percent: 25 });
  assert.equal(formatPriceDelta(100, 75), "−$25.00 (−25.0%)");
  assert.equal(formatPriceDelta(100, 125), "+$25.00 (+25.0%)");
  assert.equal(formatPriceDelta(100, 100), "$0.00 (0.0%)");
  assert.equal(formatPriceDelta(0, 0), "$0.00 (0.0%)");
  assert.equal(formatPriceDelta(0, 10), "+$10.00 (percentage unavailable)");
  assert.equal(formatPriceDelta(1400, 13184 / 12), "−$301.33 (−21.5%)");
});

test("future appended records sort chronologically without mutating history", () => {
  const first = getLatestPriceRecord("rent");
  const next = { ...first, id: "future-rent", recordedDate: "2027-01-02", previousRecordedDate: first.recordedDate, previousUSD: first.newUSD, newUSD: 1600 };
  const records = [...priceHistory, next];
  assert.equal(getLatestPriceRecord("rent", records), next);
  assert.deepEqual(getPriceHistory("rent", records), [next, first]);
  assert.equal(records[0], priceHistory[0]);
  assert.equal(getPriceHistory("unknown").length, 0);
  const sameDay = { ...next, id: "future-rent-correction", previousUSD: 1600, newUSD: 1610 };
  assert.equal(getLatestPriceRecord("rent", [...records, sameDay]), sameDay);
});

test("methodology preserves definition corrections and tuition exclusions", () => {
  assert.deepEqual(priceHistory.filter((r) => r.benchmarkCorrection).map((r) => r.slug), ["median-us-house", "elder-care", "childcare", "college-tuition"]);
  assert.match(getLatestPriceRecord("childcare").methodology, /Combines care types/);
  assert.match(getLatestPriceRecord("college-tuition").methodology, /living costs, grant aid, and future tuition increases during enrollment/);
});
