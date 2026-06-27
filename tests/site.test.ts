import test from "node:test";
import assert from "node:assert/strict";
import { absoluteUrl, resolveRequestAppOrigin } from "../src/lib/site";

test("absoluteUrl builds canonical production URLs", () => {
  assert.equal(
    absoluteUrl("/plans"),
    "https://denominated-mvp.vercel.app/plans",
  );
});

test("resolveRequestAppOrigin uses configured app URL only for matching hosts", () => {
  assert.equal(
    resolveRequestAppOrigin({
      requestUrl: "https://denominated-mvp.vercel.app/api/checkout/stripe",
      configuredAppUrl: "https://denominated-mvp.vercel.app",
    }),
    "https://denominated-mvp.vercel.app",
  );

  assert.equal(
    resolveRequestAppOrigin({
      requestUrl:
        "https://denominated-preview-swright.vercel.app/api/checkout/stripe",
      configuredAppUrl: "https://denominated-mvp.vercel.app",
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
