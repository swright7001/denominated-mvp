import assert from "node:assert/strict";
import test from "node:test";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import {
  buildScenarioCalculatorPath,
  buildScenarioMetadata,
  buildScenarioStructuredData,
  getRelatedScenarios,
  getScenarioLandingContent,
  scenarioLandingSlugs,
} from "../src/lib/scenario-seo";
import { getScenario, scenarios } from "../src/lib/scenarios";
import { siteConfig } from "../src/lib/site";

test("DEN-34 defines exactly three unique, intent-led landing pages", () => {
  assert.deepEqual(scenarioLandingSlugs.sort(), [
    "median-us-house",
    "rent",
    "tesla-model-3",
  ]);

  const pages = scenarioLandingSlugs.map(getScenarioLandingContent);
  assert.equal(new Set(pages.map((page) => page.title)).size, 3);
  assert.equal(new Set(pages.map((page) => page.heading)).size, 3);
  assert.equal(new Set(pages.map((page) => page.description)).size, 3);
  pages.forEach((page) => {
    assert.match(page.heading, /Bitcoin/);
    assert.ok(page.intro.length > 80);
    assert.ok(page.howItWorks.length > 100);
    assert.ok(page.whatCanChange.length > 100);
  });
});

test("landing metadata is canonical and uses the existing public share image", () => {
  scenarioLandingSlugs.forEach((slug) => {
    const scenario = getScenario(slug);
    assert.ok(scenario);
    const content = getScenarioLandingContent(slug);
    const metadata = buildScenarioMetadata(scenario, content);

    assert.equal(metadata.alternates?.canonical, `/examples/${slug}`);
    assert.equal(metadata.openGraph?.url, `${siteConfig.url}/examples/${slug}`);
    assert.equal(metadata.twitter?.card, "summary_large_image");

    const openGraphImages = metadata.openGraph?.images;
    assert.ok(Array.isArray(openGraphImages));
    assert.equal(openGraphImages.length, 1);
    const image = openGraphImages[0];
    assert.equal(typeof image, "object");
    assert.ok(image && "url" in image);
    const imageUrl = new URL(String(image.url));
    assert.equal(imageUrl.pathname, "/api/share-image");
    assert.deepEqual([...imageUrl.searchParams.keys()], [
      "item",
      "currency",
      "price",
      "btc",
      "years",
      "inflation",
      "growth",
      "type",
    ]);
  });
});

test("calculator links restore only public scenario inputs", () => {
  scenarioLandingSlugs.forEach((slug) => {
    const scenario = getScenario(slug);
    assert.ok(scenario);
    const url = new URL(buildScenarioCalculatorPath(scenario), siteConfig.url);

    assert.equal(url.pathname, "/calculator");
    assert.equal(url.searchParams.get("item"), scenario.itemName);
    assert.equal(url.searchParams.get("price"), String(scenario.currentItemPriceUSD));
    assert.equal(url.searchParams.get("type"), scenario.purchaseType);
    assert.equal(url.searchParams.has("email"), false);
    assert.equal(url.searchParams.has("user"), false);
    assert.equal(url.searchParams.has("savedScenarioId"), false);
  });
});

test("structured data is limited to WebPage and BreadcrumbList", () => {
  scenarioLandingSlugs.forEach((slug) => {
    const scenario = getScenario(slug);
    assert.ok(scenario);
    const jsonLd = buildScenarioStructuredData(
      scenario,
      getScenarioLandingContent(slug),
    );
    const graph = jsonLd["@graph"];

    assert.deepEqual(
      graph.map((entry) => entry["@type"]),
      ["WebPage", "BreadcrumbList"],
    );
    const breadcrumb = graph[1];
    assert.ok("itemListElement" in breadcrumb);
    assert.equal(breadcrumb.itemListElement.length, 3);
  });
});

test("each landing page has two distinct related scenario links", () => {
  scenarioLandingSlugs.forEach((slug) => {
    const content = getScenarioLandingContent(slug);
    const related = getRelatedScenarios(content);
    assert.equal(related.length, 2);
    assert.equal(new Set(related.map((scenario) => scenario.slug)).size, 2);
    assert.ok(related.every((scenario) => scenario.slug !== slug));
  });
});

test("all twelve scenario URLs remain discoverable through sitemap and robots", () => {
  const sitemapUrls = new Set(sitemap().map((entry) => entry.url));
  assert.equal(scenarios.length, 12);
  assert.equal(
    scenarios.filter(
      (scenario) => !scenarioLandingSlugs.includes(
        scenario.slug as (typeof scenarioLandingSlugs)[number],
      ),
    ).length,
    9,
  );
  scenarios.forEach((scenario) => {
    assert.ok(sitemapUrls.has(`${siteConfig.url}/examples/${scenario.slug}`));
  });

  const robotsOutput = robots();
  assert.equal(robotsOutput.sitemap, `${siteConfig.url}/sitemap.xml`);
});
