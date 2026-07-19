"use client";

import { useEffect, useMemo, useState } from "react";
import type { BTCPriceResult } from "./btc-price";
import {
  normalizeCurrencyCode,
  type CurrencyCode,
} from "./currency";
import type { SavedScenario } from "./types";

export function useBTCPrices(savedScenarios: SavedScenario[]) {
  const currencyKey = useMemo(
    () =>
      Array.from(
        new Set([
          "USD" as CurrencyCode,
          ...savedScenarios.map((savedScenario) =>
            normalizeCurrencyCode(savedScenario.scenario.currencyCode),
          ),
        ]),
      )
        .sort()
        .join(","),
    [savedScenarios],
  );
  const [prices, setPrices] = useState<
    Partial<Record<CurrencyCode, BTCPriceResult>>
  >({});

  useEffect(() => {
    const controller = new AbortController();
    const currencies = currencyKey
      .split(",")
      .filter(Boolean) as CurrencyCode[];

    async function loadBTCPrices() {
      try {
        const entries = await Promise.all(
          currencies.map(async (currencyCode) => {
            const response = await fetch(
              `/api/prices/bitcoin?currency=${currencyCode}`,
              { signal: controller.signal },
            );
            if (!response.ok) throw new Error("Live BTC price request failed");
            return [
              currencyCode,
              (await response.json()) as BTCPriceResult,
            ] as const;
          }),
        );
        setPrices(Object.fromEntries(entries));
      } catch {
        // Saved reference prices remain available during a provider outage.
      }
    }

    if (currencies.length > 0) loadBTCPrices();
    return () => controller.abort();
  }, [currencyKey]);

  return prices;
}
