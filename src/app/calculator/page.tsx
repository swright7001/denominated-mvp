import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { CalculatorExperience } from "@/components/CalculatorExperience";
import { Layout } from "@/components/Layout";
import { calculateScenario } from "@/lib/calculations";
import { defaultScenario } from "@/lib/scenarios";
import { shareImageAlt } from "@/lib/share-image";
import {
  parseScenarioSearchParams,
  scenarioToShareImagePath,
} from "@/lib/share-url";
import { absoluteUrl } from "@/lib/site";
import { isClerkConfigured } from "@/lib/auth";
import { isConvexConfigured } from "@/lib/convex";
import { isMultiCurrencyEnabled } from "@/lib/feature-flags";

type CalculatorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: CalculatorPageProps): Promise<Metadata> {
  const sharedScenario = parseScenarioSearchParams(
    await searchParams,
    defaultScenario,
  );
  const title = sharedScenario
    ? `${sharedScenario.itemName} in Bitcoin Terms`
    : "Bitcoin Purchasing-Power Calculator";
  const description = sharedScenario
    ? `See how ${sharedScenario.itemName} changes in Bitcoin purchasing-power terms over ${sharedScenario.years} years.`
    : "Run a scenario to compare an everyday expense in dollars and Bitcoin terms over time.";
  const image = sharedScenario
    ? absoluteUrl(scenarioToShareImagePath(sharedScenario))
    : undefined;
  const imageAlt = sharedScenario
    ? shareImageAlt(sharedScenario, calculateScenario(sharedScenario))
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: "/calculator" },
    openGraph: {
      title: `${title} | Denominated`,
      description,
      url: absoluteUrl("/calculator"),
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Denominated`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

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
