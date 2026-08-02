import { ScenarioDetailPage } from "@/components/ScenarioDetailPage";
import {
  buildScenarioMetadata,
  getScenarioLandingContent,
  getRequiredScenario,
} from "@/lib/scenario-seo";

const scenario = getRequiredScenario("median-us-house");
const content = getScenarioLandingContent("median-us-house");

export const revalidate = 3600;
export const metadata = buildScenarioMetadata(scenario, content);

export default function MedianUSHouseLandingPage() {
  return <ScenarioDetailPage scenario={scenario} landingContent={content} />;
}
