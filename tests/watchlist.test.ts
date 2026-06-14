import assert from "node:assert/strict";
import test from "node:test";
import { defaultScenario } from "../src/lib/scenarios";
import {
  addSavedScenario,
  buildSavedScenario,
  parseSavedScenarios,
  renameSavedScenario,
  removeSavedScenario,
  serializeSavedScenarios,
} from "../src/lib/watchlist";

test("buildSavedScenario stores the scenario and BTC baseline", () => {
  const savedScenario = buildSavedScenario(defaultScenario, {
    id: "saved-1",
    savedAt: "2026-06-13T00:00:00.000Z",
  });

  assert.equal(savedScenario.id, "saved-1");
  assert.equal(savedScenario.savedAt, "2026-06-13T00:00:00.000Z");
  assert.deepEqual(savedScenario.scenario, defaultScenario);
  assert.equal(savedScenario.baselineBTCPriceUSD, 80000);
  assert.equal(savedScenario.baselineItemCostBTC, 0.5125);
});

test("addSavedScenario prepends new saved scenarios", () => {
  const existing = buildSavedScenario(defaultScenario, { id: "old" });
  const next = addSavedScenario([existing], defaultScenario, { id: "new" });

  assert.deepEqual(
    next.map((savedScenario) => savedScenario.id),
    ["new", "old"],
  );
});

test("removeSavedScenario removes matching saved scenario", () => {
  const first = buildSavedScenario(defaultScenario, { id: "first" });
  const second = buildSavedScenario(defaultScenario, { id: "second" });

  assert.deepEqual(removeSavedScenario([first, second], "first"), [second]);
});

test("renameSavedScenario updates the saved item name only", () => {
  const first = buildSavedScenario(defaultScenario, { id: "first" });
  const second = buildSavedScenario(
    { ...defaultScenario, itemName: "Original second" },
    { id: "second" },
  );
  const renamed = renameSavedScenario([first, second], "second", "  New name ");

  assert.equal(renamed[0].scenario.itemName, defaultScenario.itemName);
  assert.equal(renamed[1].scenario.itemName, "New name");
  assert.equal(renamed[1].baselineItemCostBTC, second.baselineItemCostBTC);
});

test("renameSavedScenario ignores blank names", () => {
  const savedScenario = buildSavedScenario(defaultScenario, { id: "saved" });

  assert.deepEqual(renameSavedScenario([savedScenario], "saved", "   "), [
    savedScenario,
  ]);
});

test("parseSavedScenarios only returns valid saved scenario records", () => {
  const valid = buildSavedScenario(defaultScenario, { id: "valid" });
  const parsed = parseSavedScenarios(
    JSON.stringify([valid, { id: "bad" }, null, "nope"]),
  );

  assert.deepEqual(parsed, [valid]);
});

test("serializeSavedScenarios round trips with parseSavedScenarios", () => {
  const savedScenario = buildSavedScenario(defaultScenario, { id: "saved" });

  assert.deepEqual(
    parseSavedScenarios(serializeSavedScenarios([savedScenario])),
    [savedScenario],
  );
});
