import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/checkout/stripe/route";

test("free Production rejects checkout before parsing the request", async () => {
  const previousFlag = process.env.DENOMINATED_ENABLE_PAID_CHECKOUT;
  const previousVercelEnv = process.env.VERCEL_ENV;

  try {
    process.env.VERCEL_ENV = "production";
    for (const flag of [undefined, "false", "true"]) {
      if (flag === undefined) {
        delete process.env.DENOMINATED_ENABLE_PAID_CHECKOUT;
      } else {
        process.env.DENOMINATED_ENABLE_PAID_CHECKOUT = flag;
      }

      for (const body of ["not-json", JSON.stringify({ planId: "proMonthly" })]) {
        const response = await POST(
          new Request("https://getdenominated.com/api/checkout/stripe", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
          }),
        );
        const payload = (await response.json()) as {
          code: string;
          error: string;
        };

        assert.equal(response.status, 503);
        assert.equal(
          payload.code,
          flag === "true"
            ? "PAID_PRODUCTION_NOT_READY"
            : "PAID_CHECKOUT_DISABLED",
        );
        assert.match(
          payload.error,
          flag === "true" ? /not ready for Production/ : /free public launch/,
        );
        assert.match(payload.error, /calculator remains available/);
      }
    }
  } finally {
    if (previousFlag === undefined) {
      delete process.env.DENOMINATED_ENABLE_PAID_CHECKOUT;
    } else {
      process.env.DENOMINATED_ENABLE_PAID_CHECKOUT = previousFlag;
    }
    if (previousVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = previousVercelEnv;
    }
  }
});
