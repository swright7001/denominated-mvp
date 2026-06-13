"use client";

import { useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import {
  addSavedScenario,
  parseSavedScenarios,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
} from "@/lib/watchlist";
import type { ScenarioInput } from "@/lib/types";

const watchlistChangedEvent = "denominated-watchlist-changed";

export function SaveScenarioButton({ scenario }: { scenario: ScenarioInput }) {
  const [saved, setSaved] = useState(false);

  function saveScenario() {
    const current = parseSavedScenarios(
      window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
    );
    const next = addSavedScenario(current, scenario);

    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, serializeSavedScenarios(next));
    window.dispatchEvent(new Event(watchlistChangedEvent));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  return (
    <button
      type="button"
      className="copper-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold transition hover:brightness-110 sm:w-auto"
      onClick={saveScenario}
    >
      {saved ? <Check size={18} /> : <BookmarkPlus size={18} />}
      {saved ? "Saved to Watchlist" : "Save Scenario"}
    </button>
  );
}
