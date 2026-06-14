import type { MetadataRoute } from "next";
import { scenarios } from "@/lib/scenarios";
import { siteConfig } from "@/lib/site";

const staticRoutes = ["", "/calculator", "/examples", "/learn", "/plans"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
  }));
  const scenarioEntries = scenarios.map((scenario) => ({
    url: `${siteConfig.url}/examples/${scenario.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...scenarioEntries];
}
