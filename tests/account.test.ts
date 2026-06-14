import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultEmailPreferences,
  emailPreferencesKey,
  getStoredAccountEmail,
  saveLocalAccountEmail,
  signupEmailKey,
  signupPromptDismissedKey,
} from "../src/lib/account";

function storage(initialValues: Record<string, string | null> = {}) {
  const values = new Map(
    Object.entries(initialValues).filter(
      (entry): entry is [string, string] => entry[1] !== null,
    ),
  );

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  } as Storage;
}

test("saveLocalAccountEmail normalizes email and resets dismissal", () => {
  const localStorage = storage({ [signupPromptDismissedKey]: "true" });
  const email = saveLocalAccountEmail(localStorage, "  YOU@Example.COM ");

  assert.equal(email, "you@example.com");
  assert.equal(localStorage.getItem(signupEmailKey), "you@example.com");
  assert.equal(localStorage.getItem(signupPromptDismissedKey), null);
  assert.deepEqual(
    JSON.parse(localStorage.getItem(emailPreferencesKey) ?? "{}"),
    defaultEmailPreferences,
  );
});

test("saveLocalAccountEmail rejects invalid email", () => {
  assert.throws(
    () => saveLocalAccountEmail(storage(), "not-email"),
    /valid email/,
  );
});

test("getStoredAccountEmail returns only valid normalized email", () => {
  assert.equal(
    getStoredAccountEmail(storage({ [signupEmailKey]: "USER@Example.com" })),
    "user@example.com",
  );
  assert.equal(getStoredAccountEmail(storage({ [signupEmailKey]: "bad" })), "");
});
