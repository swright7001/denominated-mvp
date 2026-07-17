import assert from "node:assert/strict";
import test from "node:test";
import { isClerkConfigured, signInPath, signUpPath } from "../src/lib/auth";

test("Clerk requires both public and server credentials", () => {
  assert.equal(isClerkConfigured({}), false);
  assert.equal(
    isClerkConfigured({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_test" }),
    false,
  );
  assert.equal(
    isClerkConfigured({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_test",
      CLERK_SECRET_KEY: "sk_live_test",
    }),
    true,
  );
});

test("Clerk routes use the public Denominated auth pages", () => {
  assert.equal(signInPath, "/sign-in");
  assert.equal(signUpPath, "/sign-up");
});
