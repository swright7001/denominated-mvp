import assert from "node:assert/strict";
import test from "node:test";
import { absoluteUrl, siteConfig } from "../src/lib/site";

test("uses the production custom domain for public metadata URLs", () => {
  assert.equal(siteConfig.url, "https://getdenominated.com");
  assert.equal(
    absoluteUrl("/calculator"),
    "https://getdenominated.com/calculator",
  );
});
