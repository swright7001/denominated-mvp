export type PriceRecord = Readonly<{
  id: string;
  slug: string;
  previousUSD: number;
  newUSD: number;
  previousRecordedDate: string | null;
  recordedDate: string;
  sourceName: string;
  sourceURL: string;
  sourcePeriod: string;
  unit: string;
  definition: string;
  methodology: string;
  benchmarkCorrection: boolean;
}>;

// Append records; never rewrite earlier entries. Recorded dates describe editorial
// review, not publication/deployment. Unknown previous dates remain null.
export const priceHistory: readonly PriceRecord[] = [
  {
    id: "2026-09-06-median-us-house", slug: "median-us-house",
    previousUSD: 412300, newUSD: 440300, previousRecordedDate: null,
    recordedDate: "2026-09-06", sourceName: "NAR", sourcePeriod: "July 2026",
    sourceURL: "https://www.nar.realtor/newsroom/nar-existing-home-sales-report-shows-1-7-decrease-in-july",
    unit: "per home", definition: "Existing single-family home · national median",
    methodology: "The previous preset said only national median price. This benchmark now specifically covers existing single-family homes; the revision does not prove comparable home prices rose by this amount.",
    benchmarkCorrection: true,
  },
  {
    id: "2026-09-06-rent", slug: "rent",
    previousUSD: 1589, newUSD: 1515, previousRecordedDate: null,
    recordedDate: "2026-09-06", sourceName: "Zumper", sourcePeriod: "August 2026",
    sourceURL: "https://www.zumper.com/rent-research/national-rent-report",
    unit: "per month", definition: "One-bedroom apartment · national median asking rent",
    methodology: "Asking rent is a national reference point, not the rent paid by every existing tenant or a local quote.",
    benchmarkCorrection: false,
  },
  {
    id: "2026-09-06-elder-care", slug: "elder-care",
    previousUSD: 5419, newUSD: 6200, previousRecordedDate: null,
    recordedDate: "2026-09-06", sourceName: "CareScout", sourcePeriod: "2025 survey",
    sourceURL: "https://www.carescout.com/cost-of-care",
    unit: "per month", definition: "Assisted living community · national median",
    methodology: "Corrects the previous average label to median. Local costs and individual care needs vary; this is a benchmark correction, not a comparable market-price series.",
    benchmarkCorrection: true,
  },
  {
    id: "2026-09-06-childcare", slug: "childcare",
    previousUSD: 1400, newUSD: 13184 / 12, previousRecordedDate: null,
    recordedDate: "2026-09-06", sourceName: "Child Care Aware", sourcePeriod: "2025 data",
    sourceURL: "https://info.childcareaware.org/price-and-supply-2025",
    unit: "per month", definition: "National average · monthly equivalent",
    methodology: "$13,184 annual national average divided by 12. Combines care types and arrangements; it is not specifically an infant daycare quote. Replacing the previous full-time care estimate with this broader benchmark does not establish a market price decline.",
    benchmarkCorrection: true,
  },
  {
    id: "2026-09-06-college-tuition", slug: "college-tuition",
    previousUSD: 55530, newUSD: 11950 * 4, previousRecordedDate: null,
    recordedDate: "2026-09-06", sourceName: "College Board", sourcePeriod: "2025–26",
    sourceURL: "https://research.collegeboard.org/media/pdf/Trends-in-College-Pricing-and-Student-Aid-2025-final_1.pdf",
    unit: "per 4 years", definition: "Public in-state tuition + fees · four-year estimate",
    methodology: "$11,950 annual tuition and fees × 4. Excludes housing, meals, other living costs, grant aid, and future tuition increases during enrollment. This revises the benchmark definition rather than measuring a tuition price decline. The scenario growth assumption remains a separate editable projection.",
    benchmarkCorrection: true,
  },
  {
    id: "2026-09-06-wedding", slug: "wedding",
    previousUSD: 35000, newUSD: 34200, previousRecordedDate: null,
    recordedDate: "2026-09-06", sourceName: "The Knot", sourcePeriod: "2025 weddings",
    sourceURL: "https://www.theknot.com/content/average-wedding-cost",
    unit: "per wedding", definition: "U.S. survey average · weddings held in 2025",
    methodology: "The 2026 study reports on couples married in 2025. This survey average is not a minimum budget or a quote.",
    benchmarkCorrection: false,
  },
];

export function getPriceHistory(slug?: string, records = priceHistory) {
  return records.filter((record) => !slug || record.slug === slug)
    .sort((a, b) => b.recordedDate.localeCompare(a.recordedDate) || records.indexOf(b) - records.indexOf(a));
}

export function getLatestPriceRecord(slug: string, records = priceHistory) {
  return getPriceHistory(slug, records)[0];
}

export function priceDelta(previousUSD: number, newUSD: number) {
  const usd = newUSD - previousUSD;
  return { usd, percent: previousUSD === 0 ? (usd === 0 ? 0 : null) : usd / previousUSD * 100 };
}

export function formatHistoryUSD(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function formatPriceDelta(previousUSD: number, newUSD: number) {
  const { usd, percent } = priceDelta(previousUSD, newUSD);
  const sign = usd > 0 ? "+" : usd < 0 ? "−" : "";
  return `${sign}${formatHistoryUSD(Math.abs(usd))} (${percent === null ? "percentage unavailable" : `${sign}${Math.abs(percent).toFixed(1)}%`})`;
}
