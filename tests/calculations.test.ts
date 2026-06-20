import test from "node:test";
import assert from "node:assert/strict";
import { buildTweet, calculateScenario } from "../src/lib/calculations";
import { defaultScenario } from "../src/lib/scenarios";

test("buildTweet includes educational assumption caveat", () => {
  const tweet = buildTweet(defaultScenario, calculateScenario(defaultScenario));

  assert.match(tweet, /Educational only/);
  assert.match(tweet, /Assumptions, not guarantees/);
});
