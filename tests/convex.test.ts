import test from "node:test";
import assert from "node:assert/strict";
import {
  getMissingAccountStorageEnvVars,
  isConvexConfigured,
} from "../src/lib/convex";

test("Convex configuration requires the public deployment URL", () => {
  assert.equal(isConvexConfigured({}), false);
  assert.equal(
    isConvexConfigured({
      NEXT_PUBLIC_CONVEX_URL: "https://convex.test",
    }),
    true,
  );
});

test("account storage env helper requires Clerk and Convex trust", () => {
  assert.deepEqual(getMissingAccountStorageEnvVars({}), [
    "CLERK_SECRET_KEY",
    "CLERK_JWT_ISSUER_DOMAIN",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_CONVEX_URL",
  ]);
  assert.deepEqual(
    getMissingAccountStorageEnvVars({
      CLERK_SECRET_KEY: "sk_test_clerk",
      CLERK_JWT_ISSUER_DOMAIN: "https://clerk.test",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_clerk",
      NEXT_PUBLIC_CONVEX_URL: "https://convex.test",
    }),
    [],
  );
});
