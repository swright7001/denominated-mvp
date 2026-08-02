import type { Metadata } from "next";
import { getScenario } from "@/lib/scenarios";
import { absoluteUrl } from "@/lib/site";
import { scenarioToSearchParams, scenarioToShareImagePath } from "@/lib/share-url";
import type { Scenario } from "@/lib/types";

export type ScenarioLandingSlug =
  | "median-us-house"
  | "rent"
  | "tesla-model-3";

export type ScenarioLandingContent = {
  slug: ScenarioLandingSlug;
  title: string;
  heading: string;
  description: string;
  intro: string;
  howItWorks: string;
  whatCanChange: string;
  relatedSlugs: [string, string];
};

const scenarioLandingContent: Record<
  ScenarioLandingSlug,
  ScenarioLandingContent
> = {
  "median-us-house": {
    slug: "median-us-house",
    title: "How Much Is a Median U.S. House in Bitcoin?",
    heading: "How Much Is a Median U.S. House in Bitcoin?",
    description:
      "Compare a median U.S. house price in dollars and Bitcoin, then explore how changing assumptions affect its BTC-denominated cost.",
    intro:
      "A home can become more expensive in dollars while costing less in Bitcoin terms. This example turns a familiar housing price into a purchasing-power comparison you can adjust.",
    howItWorks:
      "The calculation divides the home price by the Bitcoin price for each point in time. It then applies the listed home-price inflation and Bitcoin-growth assumptions over the selected horizon.",
    whatCanChange:
      "Housing prices vary by location and market conditions, while Bitcoin prices can move sharply. Change the price, horizon, and growth assumptions to explore a range that fits your question.",
    relatedSlugs: ["rent", "tesla-model-3"],
  },
  rent: {
    slug: "rent",
    title: "How Much Is Monthly Rent in Bitcoin?",
    heading: "How Much Is Monthly Rent in Bitcoin?",
    description:
      "Measure a monthly rent estimate in dollars and Bitcoin, with editable assumptions for rent inflation, Bitcoin growth, and time horizon.",
    intro:
      "Monthly rent is one of the clearest ways to see purchasing power at work. This example compares the same recurring expense in dollars and Bitcoin terms over time.",
    howItWorks:
      "The calculation divides monthly rent by the Bitcoin price today, then applies the listed rent-inflation and Bitcoin-growth assumptions to estimate the same monthly cost later.",
    whatCanChange:
      "Actual rent depends on location, lease timing, and housing supply. Bitcoin prices are also volatile, so these editable assumptions illustrate possibilities rather than predict outcomes.",
    relatedSlugs: ["median-us-house", "tesla-model-3"],
  },
  "tesla-model-3": {
    slug: "tesla-model-3",
    title: "How Much Is a Tesla Model 3 in Bitcoin?",
    heading: "How Much Is a Tesla Model 3 in Bitcoin?",
    description:
      "Compare a Tesla Model 3 price in dollars and Bitcoin, then test how vehicle inflation and Bitcoin-growth assumptions change the result.",
    intro:
      "A car's sticker price tells only the dollar side of the story. This example shows how a Tesla Model 3 can be measured in Bitcoin terms today and across an adjustable time horizon.",
    howItWorks:
      "The calculation divides the vehicle price by the Bitcoin price today, then applies the listed vehicle-inflation and Bitcoin-growth assumptions to compare the future dollar and BTC costs.",
    whatCanChange:
      "Vehicle pricing can change with trims, incentives, taxes, and market conditions. Bitcoin prices can move quickly, so use the calculator to test assumptions instead of treating this example as a forecast.",
    relatedSlugs: ["median-us-house", "rent"],
  },
};

export const scenarioLandingSlugs = Object.keys(
  scenarioLandingContent,
) as ScenarioLandingSlug[];

export function isScenarioLandingSlug(
  slug: string,
): slug is ScenarioLandingSlug {
  return slug in scenarioLandingContent;
}

export function getScenarioLandingContent(slug: ScenarioLandingSlug) {
  return scenarioLandingContent[slug];
}

export function getRequiredScenario(slug: ScenarioLandingSlug) {
  const scenario = getScenario(slug);

  if (!scenario) {
    throw new Error(`Required scenario is missing: ${slug}`);
  }

  return scenario;
}

export function buildScenarioCalculatorPath(scenario: Scenario) {
  return `/calculator?${scenarioToSearchParams(scenario).toString()}`;
}

export function getRelatedScenarios(content: ScenarioLandingContent) {
  return content.relatedSlugs.flatMap((slug) => {
    const scenario = getScenario(slug);
    return scenario ? [scenario] : [];
  });
}

export function buildScenarioMetadata(
  scenario: Scenario,
  content?: ScenarioLandingContent,
): Metadata {
  const title = content?.title ?? `${scenario.itemName} in Bitcoin Terms`;
  const description =
    content?.description ??
    `See how ${scenario.itemName.toLowerCase()} changes when measured in dollars and Bitcoin purchasing power over time.`;
  const path = `/examples/${scenario.slug}`;
  const imagePath = scenarioToShareImagePath(scenario);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Denominated`,
      description,
      url: absoluteUrl(path),
      ...(content
        ? {
            type: "website" as const,
            images: [
              {
                url: absoluteUrl(imagePath),
                width: 1200,
                height: 630,
                alt: `${scenario.itemName} purchasing-power comparison`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      title: `${title} | Denominated`,
      description,
      ...(content
        ? { card: "summary_large_image" as const, images: [absoluteUrl(imagePath)] }
        : {}),
    },
  };
}

export function buildScenarioStructuredData(
  scenario: Scenario,
  content: ScenarioLandingContent,
) {
  const pageUrl = absoluteUrl(`/examples/${scenario.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: content.title,
        description: content.description,
        isPartOf: { "@id": `${absoluteUrl("/")}#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Examples",
            item: absoluteUrl("/examples"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: scenario.itemName,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
