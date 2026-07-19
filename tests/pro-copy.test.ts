import test from "node:test";
import assert from "node:assert/strict";
import {
  getProConversionCopy,
  proConversionCopy,
  type ProConversionMoment,
} from "../src/lib/pro-copy";

const moments = Object.keys(proConversionCopy) as ProConversionMoment[];

test("all Pro conversion moments have complete reusable copy", () => {
  for (const moment of moments) {
    const copy = getProConversionCopy(moment);

    assert.ok(copy.eyebrow.length > 0);
    assert.ok(copy.title.length > 0);
    assert.ok(copy.body.length > 0);
    assert.ok(copy.features.length > 0);
    assert.ok(copy.primaryCta.length > 0);
    assert.ok(copy.secondaryCta.length > 0);
    assert.ok(copy.footnote.length > 0);
  }
});

test("conversion copy avoids trading and financial-advice language", () => {
  const bannedTerms = ["buy bitcoin", "sell bitcoin", "trade", "not financial advice"];
  const allCopy = moments
    .map((moment) => {
      const copy = getProConversionCopy(moment);
      return [
        copy.eyebrow,
        copy.title,
        copy.body,
        copy.features.join(" "),
        copy.footnote,
      ].join(" ");
    })
    .join(" ")
    .toLowerCase();

  for (const term of bannedTerms) {
    assert.equal(allCopy.includes(term), false);
  }
});

test("save-first-scenario copy includes an escape hatch", () => {
  assert.equal(
    getProConversionCopy("saveFirstScenario").secondaryCta,
    "Continue without account",
  );
});

test("conversion copy remains accurate when paid checkout is enabled", () => {
  const allCopy = moments
    .map((moment) => JSON.stringify(getProConversionCopy(moment)))
    .join(" ")
    .toLowerCase();

  assert.equal(allCopy.includes("no checkout"), false);
  assert.equal(allCopy.includes("no payment is collected"), false);
});
