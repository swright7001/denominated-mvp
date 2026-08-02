import { ScenarioDetailPage } from "@/components/ScenarioDetailPage";
import {
  buildScenarioMetadata,
  getScenarioLandingContent,
  getRequiredScenario,
} from "@/lib/scenario-seo";

const scenario = getRequiredScenario("rent");
const content = getScenarioLandingContent("rent");

export const revalidate = 3600;
export const metadata = buildScenarioMetadata(scenario, content);

export default function RentLandingPage() {
  return <ScenarioDetailPage scenario={scenario} landingContent={content} />;
}
