import assert from "node:assert/strict";
import test from "node:test";
import { walkthroughSteps } from "../src/lib/walkthrough";

test("product walkthrough uses three complete local product screens", () => {
  assert.equal(walkthroughSteps.length, 3);
  assert.equal(new Set(walkthroughSteps.map((step) => step.id)).size, 3);

  for (const step of walkthroughSteps) {
    assert.match(step.image, /^\/walkthrough-[a-z-]+\.jpg$/);
    assert.ok(step.imageAlt.length > 20);
    assert.ok(step.description.length > 40);
  }
});

test("walkthrough copy stays educational", () => {
  const copy = JSON.stringify(walkthroughSteps).toLowerCase();

  assert.doesNotMatch(copy, /buy now|sell now|financial advice|guaranteed return/);
  assert.match(copy, /purchasing-power|purchasing power/);
});
