import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeNumericInputDraft,
  parseNumericInputDraft,
} from "../src/lib/numeric-input";

test("parseNumericInputDraft allows temporarily empty drafts", () => {
  assert.equal(parseNumericInputDraft(""), null);
  assert.equal(parseNumericInputDraft("-"), null);
  assert.equal(parseNumericInputDraft("."), null);
});

test("parseNumericInputDraft parses usable numeric drafts", () => {
  assert.equal(parseNumericInputDraft("05"), 5);
  assert.equal(parseNumericInputDraft("4.5"), 4.5);
});

test("normalizeNumericInputDraft falls back and clamps minimums", () => {
  assert.equal(
    normalizeNumericInputDraft({ draft: "", fallback: 41000, min: 0 }),
    41000,
  );
  assert.equal(
    normalizeNumericInputDraft({ draft: "-5", fallback: 41000, min: 0 }),
    0,
  );
});
