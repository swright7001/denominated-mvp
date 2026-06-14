import test from "node:test";
import assert from "node:assert/strict";
import {
  canSaveScenario,
  canUseFeature,
  getFeatureAccess,
  getMockPlanTierFromStorage,
  getPlanEntitlements,
  isProEntitled,
  mockPlanTierKey,
  parsePlanTier,
} from "../src/lib/entitlements";
import { signupEmailKey } from "../src/lib/account";

function storage(values: Record<string, string | null>) {
  return {
    getItem(key: string) {
      return values[key] ?? null;
    },
  } as Storage;
}

test("calculator and share access stay available for every tier", () => {
  for (const tier of ["noAccount", "freeAccount", "pro", "lifetime"] as const) {
    assert.equal(canUseFeature(tier, "calculatorAccess"), true);
    assert.equal(canUseFeature(tier, "shareCopyResult"), true);
  }
});

test("free account can save one scenario and no-account cannot save", () => {
  assert.deepEqual(canSaveScenario("noAccount", 0), {
    allowed: false,
    tier: "noAccount",
    limit: 0,
    reason: "account-required",
  });

  assert.deepEqual(canSaveScenario("freeAccount", 0), {
    allowed: true,
    tier: "freeAccount",
    limit: 1,
  });

  assert.deepEqual(canSaveScenario("freeAccount", 1), {
    allowed: false,
    tier: "freeAccount",
    limit: 1,
    reason: "limit-reached",
  });
});

test("pro and lifetime can save unlimited scenarios", () => {
  assert.deepEqual(canSaveScenario("pro", 42), {
    allowed: true,
    tier: "pro",
    limit: "unlimited",
  });

  assert.deepEqual(canSaveScenario("lifetime", 42), {
    allowed: true,
    tier: "lifetime",
    limit: "unlimited",
  });
});

test("lifetime is treated as pro-entitled for gated habit features", () => {
  assert.equal(isProEntitled("noAccount"), false);
  assert.equal(isProEntitled("freeAccount"), false);
  assert.equal(isProEntitled("pro"), true);
  assert.equal(isProEntitled("lifetime"), true);
});

test("premium features are centralized by feature access", () => {
  assert.equal(getFeatureAccess("noAccount", "emailReports"), "none");
  assert.equal(getFeatureAccess("freeAccount", "emailReports"), "limited");
  assert.equal(getFeatureAccess("pro", "emailReports"), "included");
  assert.equal(getFeatureAccess("lifetime", "emailReports"), "included");

  assert.equal(canUseFeature("freeAccount", "privateShareLinks"), false);
  assert.equal(canUseFeature("pro", "privateShareLinks"), true);
});

test("plan metadata exposes positioning for UI surfaces", () => {
  assert.equal(
    getPlanEntitlements("pro").positioning,
    "Track real-life costs over time with a personal purchasing-power dashboard.",
  );
  assert.equal(getPlanEntitlements("lifetime").savedScenarioLimit, "unlimited");
});

test("mock plan state resolves from explicit local plan before email fallback", () => {
  assert.equal(parsePlanTier("pro"), "pro");
  assert.equal(parsePlanTier("enterprise"), null);

  assert.equal(getMockPlanTierFromStorage(storage({})), "noAccount");
  assert.equal(
    getMockPlanTierFromStorage(storage({ [signupEmailKey]: "you@example.com" })),
    "freeAccount",
  );
  assert.equal(
    getMockPlanTierFromStorage(
      storage({
        [signupEmailKey]: "you@example.com",
        [mockPlanTierKey]: "lifetime",
      }),
    ),
    "lifetime",
  );
});
