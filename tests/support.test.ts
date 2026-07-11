import test from "node:test";
import assert from "node:assert/strict";
import {
  getSupportContact,
  getSupportContactNote,
} from "../src/lib/support";

test("support contact requires a valid email and public URL", () => {
  assert.equal(getSupportContact({}), null);
  assert.equal(
    getSupportContact({
      DENOMINATED_SUPPORT_EMAIL: "support@example.com",
      NEXT_PUBLIC_SUPPORT_URL: "http://localhost:3000/support",
    }),
    null,
  );
});

test("support contact normalizes approved production details", () => {
  assert.deepEqual(
    getSupportContact({
      DENOMINATED_SUPPORT_EMAIL: " Support@Example.com ",
      NEXT_PUBLIC_SUPPORT_URL: "https://example.com/support",
    }),
    {
      email: "support@example.com",
      url: "https://example.com/support",
    },
  );
});

test("support note stays fail-closed until contact details are complete", () => {
  assert.match(getSupportContactNote({}), /must be published/);
  assert.equal(
    getSupportContactNote({
      DENOMINATED_SUPPORT_EMAIL: "support@example.com",
      NEXT_PUBLIC_SUPPORT_URL: "https://example.com/support",
    }),
    "Customer support is available at support@example.com and https://example.com/support.",
  );
});
