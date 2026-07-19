export type ProConversionMoment =
  | "saveFirstScenario"
  | "saveLimitReached"
  | "dailySnapshot"
  | "weeklyReport"
  | "exportPrivateShare"
  | "customCategoriesPresets"
  | "fullWatchlist";

export type ProConversionCopy = {
  eyebrow: string;
  title: string;
  body: string;
  features: string[];
  primaryCta: string;
  secondaryCta: string;
  footnote: string;
};

export const proConversionCopy: Record<
  ProConversionMoment,
  ProConversionCopy
> = {
  saveFirstScenario: {
    eyebrow: "Save this scenario",
    title: "Start a personal purchasing-power watchlist.",
    body: "Use a free account to save your first scenario, then come back to see how the same real-life cost changes in BTC terms over time.",
    features: [
      "Save one scenario free",
      "Keep your assumptions handy",
      "Build toward a personal dashboard",
      "Continue without an account anytime",
    ],
    primaryCta: "Save my scenario",
    secondaryCta: "Continue without account",
    footnote: "Educational only. No financial advice. Phone number is not required.",
  },
  saveLimitReached: {
    eyebrow: "Watchlist limit",
    title: "Your free saved scenario is working. Pro is for tracking more.",
    body: "Free accounts can save one scenario. Pro and Lifetime are for people who want a full watchlist of real-life costs and goals.",
    features: [
      "Unlimited saved scenarios",
      "See how saved goals change as BTC moves",
      "Keep a personal purchasing-power dashboard",
      "Receive weekly cost-of-life reports",
    ],
    primaryCta: "Compare Plans",
    secondaryCta: "Keep using calculator",
    footnote: "The calculator and sharing stay free. Paid access adds recurring tracking tools.",
  },
  dailySnapshot: {
    eyebrow: "Daily snapshot",
    title: "See how your saved goals changed today.",
    body: "Pro turns saved scenarios into a daily purchasing-power snapshot so you can revisit the same costs without rebuilding the math each time.",
    features: [
      "Daily purchasing-power snapshot",
      "BTC movement impact across saved scenarios",
      "Historical comparisons over time",
      "Personal dashboard for recurring use",
    ],
    primaryCta: "Compare Plans",
    secondaryCta: "Run a Free Scenario",
    footnote: "Snapshots are educational comparisons, not price predictions or financial advice.",
  },
  weeklyReport: {
    eyebrow: "Weekly report",
    title: "Get a weekly cost-of-life view.",
    body: "Pro packages saved scenarios and popular examples into a readable report about purchasing power over time.",
    features: [
      "Weekly cost-of-life report",
      "Saved scenario highlights",
      "Educational note of the week",
      "Optional email report foundation",
    ],
    primaryCta: "Compare Plans",
    secondaryCta: "Run a Free Scenario",
    footnote: "Reports explain assumptions and purchasing power. They are not trading prompts.",
  },
  exportPrivateShare: {
    eyebrow: "Share and export",
    title: "Turn scenarios into clean private links and reports.",
    body: "Pro is planned to help you package purchasing-power comparisons for yourself, your family, or your own planning notes.",
    features: [
      "Private share links",
      "PDF/report exports",
      "Screenshot-friendly summaries",
      "Clear educational disclaimers",
    ],
    primaryCta: "Compare Plans",
    secondaryCta: "Copy free result",
    footnote: "Free copy/share remains available for calculator results.",
  },
  customCategoriesPresets: {
    eyebrow: "Personal setup",
    title: "Organize the costs that matter to your life.",
    body: "Pro custom categories and assumption presets are planned for people tracking multiple recurring goals over time.",
    features: [
      "Custom scenario categories",
      "Custom assumption presets",
      "Reusable planning views",
      "Cleaner long-term watchlists",
    ],
    primaryCta: "Compare Plans",
    secondaryCta: "View Examples",
    footnote: "Presets are educational inputs. Assumptions are not guarantees.",
  },
  fullWatchlist: {
    eyebrow: "Full watchlist",
    title: "Track more than one real-life cost.",
    body: "Free accounts get one saved scenario. Pro and Lifetime add a full watchlist that keeps cars, housing, care, tuition, and other goals in one place.",
    features: [
      "Unlimited saved scenarios",
      "BTC movement impact across all saved goals",
      "Historical comparisons over time",
      "Private share links and PDF/report exports",
    ],
    primaryCta: "Compare Plans",
    secondaryCta: "Run a Free Scenario",
    footnote: "The free calculator stays open. Paid access adds recurring tracking tools.",
  },
};

export function getProConversionCopy(moment: ProConversionMoment) {
  return proConversionCopy[moment];
}
