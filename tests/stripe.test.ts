import test from "node:test";
import assert from "node:assert/strict";
import { stripeApiVersion } from "../src/lib/stripe";

test("Stripe client uses the pinned SDK API version", () => {
  assert.equal(stripeApiVersion, "2026-05-27.dahlia");
});
