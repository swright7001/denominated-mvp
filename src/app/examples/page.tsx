import { Layout } from "@/components/Layout";
import { PresetScenarioGrid } from "@/components/PresetScenarioGrid";
import { scenarios } from "@/lib/scenarios";

export default function ExamplesPage() {
  return (
    <Layout>
      <section className="container py-12">
        <div className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">Examples</p>
            <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
              Popular Scenarios
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
              See how everyday expenses compare in today&apos;s dollars versus
              future purchasing power.
            </p>
          </div>
          <div className="outline-button rounded-md px-4 py-3 text-sm text-[#f0a36f]">
            United States
          </div>
        </div>
        <PresetScenarioGrid scenarios={scenarios} />
      </section>
    </Layout>
  );
}
