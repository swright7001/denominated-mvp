import test from "node:test";
import assert from "node:assert/strict";
import { isEmailReportsEnabled } from "../src/lib/feature-flags";

test("email reports stay disabled unless explicitly enabled", () => {
  assert.equal(isEmailReportsEnabled({}), false);
  assert.equal(
    isEmailReportsEnabled({ DENOMINATED_ENABLE_EMAIL_REPORTS: "false" }),
    false,
  );
  assert.equal(
    isEmailReportsEnabled({ DENOMINATED_ENABLE_EMAIL_REPORTS: "true" }),
    true,
  );
});
