import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSavedScenarioOwner,
  getSavedScenarioImportDecision,
} from "../convex/savedScenarios";

test("saved scenario ownership allows only the authenticated owner", () => {
  assert.doesNotThrow(() =>
    assertSavedScenarioOwner("issuer|owner", "issuer|owner"),
  );
  assert.throws(
    () => assertSavedScenarioOwner("issuer|owner", "issuer|other-user"),
    /You do not have access to this saved scenario/,
  );
});

test("free account import allows one new saved scenario", () => {
  assert.deepEqual(getSavedScenarioImportDecision("freeAccount", 0, 1), {
    allowed: true,
  });
});

test("free account import blocks new scenarios beyond the one-scenario limit", () => {
  assert.deepEqual(getSavedScenarioImportDecision("freeAccount", 0, 2), {
    allowed: false,
    reason: "Upgrade to Pro to import more than one saved scenario.",
  });

  assert.deepEqual(getSavedScenarioImportDecision("freeAccount", 1, 1), {
    allowed: false,
    reason: "Upgrade to Pro to import more than one saved scenario.",
  });
});

test("free account import allows updates that do not create new saved scenarios", () => {
  assert.deepEqual(getSavedScenarioImportDecision("freeAccount", 1, 0), {
    allowed: true,
  });
});

test("pro and lifetime imports allow batch migration within the mutation cap", () => {
  assert.deepEqual(getSavedScenarioImportDecision("pro", 12, 38), {
    allowed: true,
  });
  assert.deepEqual(getSavedScenarioImportDecision("lifetime", 12, 38), {
    allowed: true,
  });
});
