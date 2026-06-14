import { calculateScenario } from "./calculations";
import type { SavedScenario, ScenarioInput } from "./types";

export const WATCHLIST_STORAGE_KEY = "denominated.savedScenarios.v1";
export const watchlistChangedEvent = "denominated-watchlist-changed";

type SaveScenarioOptions = {
  id?: string;
  savedAt?: string;
};

export function buildSavedScenario(
  scenario: ScenarioInput,
  options: SaveScenarioOptions = {},
): SavedScenario {
  const result = calculateScenario(scenario);

  return {
    id: options.id ?? createSavedScenarioId(),
    scenario,
    savedAt: options.savedAt ?? new Date().toISOString(),
    baselineBTCPriceUSD: scenario.currentBTCPriceUSD,
    baselineItemCostBTC: result.currentItemCostBTC,
  };
}

export function addSavedScenario(
  savedScenarios: SavedScenario[],
  scenario: ScenarioInput,
  options: SaveScenarioOptions = {},
) {
  return [buildSavedScenario(scenario, options), ...savedScenarios];
}

export function removeSavedScenario(
  savedScenarios: SavedScenario[],
  id: string,
) {
  return savedScenarios.filter((savedScenario) => savedScenario.id !== id);
}

export function renameSavedScenario(
  savedScenarios: SavedScenario[],
  id: string,
  itemName: string,
) {
  const trimmedItemName = itemName.trim();

  if (!trimmedItemName) return savedScenarios;

  return savedScenarios.map((savedScenario) =>
    savedScenario.id === id
      ? {
          ...savedScenario,
          scenario: {
            ...savedScenario.scenario,
            itemName: trimmedItemName,
          },
        }
      : savedScenario,
  );
}

export function parseSavedScenarios(value: string | null): SavedScenario[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSavedScenario);
  } catch {
    return [];
  }
}

export function serializeSavedScenarios(savedScenarios: SavedScenario[]) {
  return JSON.stringify(savedScenarios);
}

function createSavedScenarioId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isSavedScenario(value: unknown): value is SavedScenario {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<SavedScenario>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.savedAt === "string" &&
    typeof candidate.baselineBTCPriceUSD === "number" &&
    typeof candidate.baselineItemCostBTC === "number" &&
    isScenarioInput(candidate.scenario)
  );
}

function isScenarioInput(value: unknown): value is ScenarioInput {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ScenarioInput>;

  return (
    typeof candidate.itemName === "string" &&
    typeof candidate.currentItemPriceUSD === "number" &&
    typeof candidate.currentBTCPriceUSD === "number" &&
    typeof candidate.years === "number" &&
    typeof candidate.itemInflationRate === "number" &&
    typeof candidate.btcGrowthRate === "number" &&
    (candidate.purchaseType === "one-time" ||
      candidate.purchaseType === "monthly")
  );
}
