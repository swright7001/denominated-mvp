import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

test("account public mutations do not expose client-writable billing state", () => {
  const accountsSource = readFileSync(
    join(repoRoot, "convex/accounts.ts"),
    "utf8",
  );

  assert.equal(accountsSource.includes("updateBillingSnapshot"), false);
  assert.equal(accountsSource.includes("planTierValidator"), false);
  assert.equal(accountsSource.includes("subscriptionStatusValidator"), false);
});

test("Stripe billing persistence requires the webhook sync secret", () => {
  const billingSource = readFileSync(join(repoRoot, "convex/billing.ts"), "utf8");

  assert.match(billingSource, /export const syncFromStripeWebhook = mutation/);
  assert.match(billingSource, /syncSecret: v\.string\(\)/);
  assert.match(billingSource, /assertWebhookSyncSecret\(args\.syncSecret\)/);
});

test("scenario presets expose public reads only", () => {
  const presetsSource = readFileSync(join(repoRoot, "convex/presets.ts"), "utf8");

  assert.match(presetsSource, /export const list = query/);
  assert.equal(presetsSource.includes("export const upsert"), false);
  assert.equal(presetsSource.includes("export const remove"), false);
  assert.equal(presetsSource.includes("mutation("), false);
});
