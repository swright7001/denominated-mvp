import test from "node:test";
import assert from "node:assert/strict";
import { buildProductAnalyticsEvent } from "../src/lib/product-analytics";

test("analytics accepts every documented funnel event", () => {
  assert.deepEqual(
    buildProductAnalyticsEvent({ event: "calculator_used", source: "shared" }),
    { event: "calculator_used", source: "shared", version: 1 },
  );
  assert.deepEqual(
    buildProductAnalyticsEvent({ event: "preset_opened", surface: "home" }),
    { event: "preset_opened", surface: "home", version: 1 },
  );
  assert.deepEqual(
    buildProductAnalyticsEvent({ event: "result_copied", format: "tweet" }),
    { event: "result_copied", format: "tweet", version: 1 },
  );
  assert.deepEqual(
    buildProductAnalyticsEvent({
      event: "cta_clicked",
      cta: "hero_run_scenario",
    }),
    { event: "cta_clicked", cta: "hero_run_scenario", version: 1 },
  );
});

test("analytics strips unknown fields instead of logging user input", () => {
  assert.deepEqual(
    buildProductAnalyticsEvent({
      event: "result_copied",
      format: "scenario_link",
      itemName: "Private medical expense",
      email: "person@example.com",
      price: 41000,
      assumptions: { btcGrowth: 15 },
    }),
    { event: "result_copied", format: "scenario_link", version: 1 },
  );
});

test("analytics rejects arbitrary event names and property values", () => {
  assert.equal(
    buildProductAnalyticsEvent({ event: "user_input", value: "secret" }),
    null,
  );
  assert.equal(
    buildProductAnalyticsEvent({ event: "preset_opened", surface: "tesla" }),
    null,
  );
  assert.equal(
    buildProductAnalyticsEvent({
      event: "cta_clicked",
      cta: "person@example.com",
    }),
    null,
  );
});
