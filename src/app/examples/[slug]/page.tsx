import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScenarioDetailPage } from "@/components/ScenarioDetailPage";
import {
  buildScenarioMetadata,
  isScenarioLandingSlug,
} from "@/lib/scenario-seo";
import { getScenario, scenarios } from "@/lib/scenarios";

type ScenarioDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return scenarios
    .filter((scenario) => !isScenarioLandingSlug(scenario.slug))
    .map((scenario) => ({ slug: scenario.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ScenarioDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getScenario(slug);

  if (!scenario) {
    return { title: "Scenario Not Found" };
  }

  return buildScenarioMetadata(scenario);
}

export default async function ScenarioDetailRoute({
  params,
}: ScenarioDetailRouteProps) {
  const { slug } = await params;
  const scenario = getScenario(slug);

  if (!scenario) notFound();

  return <ScenarioDetailPage scenario={scenario} />;
}
