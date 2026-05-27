"use client";

import { useMemo, useState } from "react";
import { calculateScenario } from "@/lib/calculations";
import { defaultScenario } from "@/lib/scenarios";
import { ScenarioInput } from "@/lib/types";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { BTCComparisonChart } from "./BTCComparisonChart";
import { CopyTweetButton } from "./CopyTweetButton";
import { OpportunityCostCard } from "./OpportunityCostCard";
import { ResultCards } from "./ResultCards";
import { ScenarioForm } from "./ScenarioForm";
import { ShareableResultCard } from "./ShareableResultCard";

export function CalculatorExperience() {
  const [scenario, setScenario] = useState<ScenarioInput>(defaultScenario);
  const result = useMemo(() => calculateScenario(scenario), [scenario]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <p className="eyebrow">Calculator</p>
        <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
          Run a purchasing-power scenario
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
          Change the price, timeline, and assumptions to see whether an expense
          gets more expensive in dollars but cheaper in Bitcoin terms.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <ScenarioForm value={scenario} onChange={setScenario} />
        <div className="space-y-6">
          <ResultCards scenario={scenario} result={result} />
          <BTCComparisonChart result={result} />
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <OpportunityCostCard scenario={scenario} result={result} />
            <AssumptionsPanel scenario={scenario} />
          </div>
          <section className="panel rounded-lg p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="eyebrow mb-3">Share your results</p>
                <p className="mb-5 text-sm leading-6 text-[#b9ab9a]">
                  Spread the message in a format that is easy to screenshot and
                  plain enough for everyday people.
                </p>
                <CopyTweetButton scenario={scenario} result={result} />
              </div>
              <ShareableResultCard scenario={scenario} result={result} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
