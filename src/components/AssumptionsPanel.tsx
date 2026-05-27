import { ScenarioInput } from "@/lib/types";
import { EducationTooltip } from "./EducationTooltip";

export function AssumptionsPanel({ scenario }: { scenario: ScenarioInput }) {
  return (
    <div className="panel rounded-lg p-5">
      <div className="mb-4 flex items-center gap-2">
        <p className="eyebrow">Assumptions</p>
        <EducationTooltip text="These are inputs for exploring purchasing power. They are not forecasts." />
      </div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="muted">Time horizon</dt>
          <dd className="text-[#efe6da]">{scenario.years} years</dd>
        </div>
        <div>
          <dt className="muted">Purchase type</dt>
          <dd className="capitalize text-[#efe6da]">
            {scenario.purchaseType.replace("-", " ")}
          </dd>
        </div>
        <div>
          <dt className="muted">Item inflation</dt>
          <dd className="text-[#efe6da]">{scenario.itemInflationRate}% / year</dd>
        </div>
        <div>
          <dt className="muted">BTC growth</dt>
          <dd className="text-[#efe6da]">{scenario.btcGrowthRate}% / year</dd>
        </div>
      </dl>
    </div>
  );
}
