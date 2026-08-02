import { ScenarioDetailPage } from "@/components/ScenarioDetailPage";
import {
  buildScenarioMetadata,
  getScenarioLandingContent,
  getRequiredScenario,
} from "@/lib/scenario-seo";

const scenario = getRequiredScenario("tesla-model-3");
const content = getScenarioLandingContent("tesla-model-3");

export const revalidate = 3600;
export const metadata = buildScenarioMetadata(scenario, content);

export default function TeslaModel3LandingPage() {
  return <ScenarioDetailPage scenario={scenario} landingContent={content} />;
}
