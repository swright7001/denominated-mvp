import assert from "node:assert/strict";
import test from "node:test";
import { createScenarioSaveHandler } from "../src/lib/scenario-save-route";
import { defaultScenario } from "../src/lib/scenarios";
import { buildSavedScenario } from "../src/lib/watchlist";

const savedScenario = buildSavedScenario(defaultScenario, {
  id: "scenario-test",
  savedAt: "2026-07-18T12:00:00.000Z",
});

function request(body: unknown = { savedScenario }) {
  return new Request("https://getdenominated.com/api/scenarios/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function dependencies(
  overrides: Partial<Parameters<typeof createScenarioSaveHandler>[0]> = {},
) {
  return {
    getMissingEnvVars: () => [],
    authenticate: async () => ({
      userId: "user_test",
      getConvexToken: async () => "convex-token",
    }),
    getPrimaryEmail: async () => "member@example.com",
    ensureAccount: async () => "account_test",
    saveScenario: async () => "saved_scenario_test",
    log: () => {},
    ...overrides,
  };
}

test("signed-in scenario save ensures the account and persists the scenario", async () => {
  const calls: string[] = [];
  const handler = createScenarioSaveHandler(
    dependencies({
      ensureAccount: async (email, token) => {
        calls.push(`account:${email}:${token}`);
      },
      saveScenario: async (scenario, token) => {
        calls.push(`save:${scenario.id}:${token}`);
        return "saved_scenario_test";
      },
    }),
  );

  const response = await handler(request());

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    savedScenarioId: "saved_scenario_test",
  });
  assert.deepEqual(calls, [
    "account:member@example.com:convex-token",
    "save:scenario-test:convex-token",
  ]);
});

test("unsigned scenario save returns an account-required response", async () => {
  const handler = createScenarioSaveHandler(
    dependencies({
      authenticate: async () => ({
        userId: null,
        getConvexToken: async () => null,
      }),
    }),
  );

  const response = await handler(request());
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.code, "ACCOUNT_REQUIRED");
});

test("signed-in scenario save reports a missing Convex token without asking for sign-in", async () => {
  const handler = createScenarioSaveHandler(
    dependencies({
      authenticate: async () => ({
        userId: "user_test",
        getConvexToken: async () => null,
      }),
    }),
  );

  const response = await handler(request());
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.code, "CONVEX_AUTH_TOKEN_REQUIRED");
  assert.match(payload.error, /account is signed in/i);
});

test("scenario save reports configuration gaps separately", async () => {
  const handler = createScenarioSaveHandler(
    dependencies({
      getMissingEnvVars: () => ["NEXT_PUBLIC_CONVEX_URL"],
    }),
  );

  const response = await handler(request());
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.code, "ACCOUNT_STORAGE_NOT_CONFIGURED");
  assert.deepEqual(payload.missingEnvVars, ["NEXT_PUBLIC_CONVEX_URL"]);
});

test("scenario save preserves the free-account limit response", async () => {
  const handler = createScenarioSaveHandler(
    dependencies({
      saveScenario: async () => {
        throw new Error("Upgrade to Pro to save more than one scenario.");
      },
    }),
  );

  const response = await handler(request());
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.code, "SAVE_LIMIT_REACHED");
});

test("scenario save distinguishes Convex authentication failures", async () => {
  const handler = createScenarioSaveHandler(
    dependencies({
      ensureAccount: async () => {
        throw new Error("Sign in to use Denominated account storage.");
      },
    }),
  );

  const response = await handler(request());
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.code, "ACCOUNT_STORAGE_AUTH_FAILED");
  assert.match(payload.error, /account is signed in/i);
});
