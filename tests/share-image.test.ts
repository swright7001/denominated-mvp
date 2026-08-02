import assert from "node:assert/strict";
import test from "node:test";
import { calculateScenario } from "../src/lib/calculations";
import { defaultScenario } from "../src/lib/scenarios";
import {
  isShareImageScenarioSafe,
  shareImageAlt,
  shareImageSize,
} from "../src/lib/share-image";

test("share image uses the social-ready 1200 by 630 frame", () => {
  assert.deepEqual(shareImageSize, { width: 1200, height: 630 });
});

test("share image input bounds prevent unbounded server rendering", () => {
  assert.equal(isShareImageScenarioSafe(defaultScenario), true);
  assert.equal(
    isShareImageScenarioSafe({ ...defaultScenario, years: 1_000_000 }),
    false,
  );
});

test("share image alt summarizes the public scenario result", () => {
  const result = calculateScenario(defaultScenario);
  const alt = shareImageAlt(defaultScenario, result);

  assert.match(alt, /Tesla Model 3/);
  assert.match(alt, /0\.5125 BTC today/);
  assert.match(alt, /BTC in 5 years/);
  assert.match(alt, /in Bitcoin terms/);
});
