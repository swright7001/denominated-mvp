import assert from "node:assert/strict";
import test from "node:test";
import {
  absoluteUrl,
  resolveRequestAppOrigin,
  siteConfig,
} from "../src/lib/site";

test("uses the production custom domain for public metadata URLs", () => {
  assert.equal(siteConfig.url, "https://getdenominated.com");
  assert.equal(
    absoluteUrl("/calculator"),
    "https://getdenominated.com/calculator",
  );
});

test("resolveRequestAppOrigin uses configured app URL only for matching hosts", () => {
  assert.equal(
    resolveRequestAppOrigin({
      requestUrl: "https://getdenominated.com/api/checkout/stripe",
      configuredAppUrl: "https://getdenominated.com",
    }),
    "https://getdenominated.com",
  );

  assert.equal(
    resolveRequestAppOrigin({
      requestUrl:
        "https://denominated-preview-swright.vercel.app/api/checkout/stripe",
      configuredAppUrl: "https://getdenominated.com",
    }),
    "https://denominated-preview-swright.vercel.app",
  );
});

test("resolveRequestAppOrigin falls back to request origin for local or invalid config", () => {
  assert.equal(
    resolveRequestAppOrigin({
      requestUrl: "http://localhost:3000/api/billing/portal",
      configuredAppUrl: undefined,
    }),
    "http://localhost:3000",
  );

  assert.equal(
    resolveRequestAppOrigin({
      requestUrl: "http://localhost:3000/api/billing/portal",
      configuredAppUrl: "not a url",
    }),
    "http://localhost:3000",
  );
});
