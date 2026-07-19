import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { CalculatorExperience } from "@/components/CalculatorExperience";
import { Layout } from "@/components/Layout";
import { defaultScenario } from "@/lib/scenarios";
import { parseScenarioSearchParams } from "@/lib/share-url";
import { absoluteUrl } from "@/lib/site";
import { isClerkConfigured } from "@/lib/auth";
import { isConvexConfigured } from "@/lib/convex";
import { isMultiCurrencyEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Bitcoin Purchasing-Power Calculator",
  description:
    "Run a scenario to compare an everyday expense in dollars and Bitcoin terms over time.",
  alternates: {
    canonical: "/calculator",
  },
  openGraph: {
    title: "Bitcoin Purchasing-Power Calculator | Denominated",
    description:
      "Compare an everyday expense in dollars and Bitcoin terms over time.",
    url: absoluteUrl("/calculator"),
  },
};

type CalculatorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalculatorPage({
  searchParams,
}: CalculatorPageProps) {
  const sharedScenario = parseScenarioSearchParams(
    await searchParams,
    defaultScenario,
  );
  const realAccountsEnabled = isClerkConfigured() && isConvexConfigured();
  const isSignedIn = realAccountsEnabled ? Boolean((await auth()).userId) : false;

  return (
    <Layout>
      <CalculatorExperience
        initialScenario={sharedScenario ?? defaultScenario}
        hasSharedScenario={sharedScenario !== null}
        realAccountsEnabled={realAccountsEnabled}
        isSignedIn={isSignedIn}
        multiCurrencyEnabled={isMultiCurrencyEnabled()}
      />
    </Layout>
  );
}
