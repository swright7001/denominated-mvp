import assert from "node:assert/strict";
import test from "node:test";
import {
  getConfiguredSupportEmail,
  publicSupportEmail,
} from "../src/lib/support";

test("support contact exposes only the approved branded alias", () => {
  assert.equal(
    getConfiguredSupportEmail(" support@getdenominated.com ", "true"),
    publicSupportEmail,
  );
  assert.equal(
    getConfiguredSupportEmail("support@getdenominated.com", "false"),
    null,
  );
  assert.equal(getConfiguredSupportEmail("private@example.com", "true"), null);
  assert.equal(getConfiguredSupportEmail(undefined, undefined), null);
});
