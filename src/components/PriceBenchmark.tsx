import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ExternalLink, Minus } from "lucide-react";
import { formatHistoryUSD, formatPriceDelta, getLatestPriceRecord, priceDelta } from "@/lib/price-history";

export function PriceBenchmark({ slug, detail = false }: { slug: string; detail?: boolean }) {
  const record = getLatestPriceRecord(slug);
  if (!record) return <p className="text-xs text-[var(--text-muted)]">Illustrative estimate or product budget · not a tracked market benchmark</p>;
  const delta = priceDelta(record.previousUSD, record.newUSD);
  const Icon = delta.usd > 0 ? ArrowUpRight : delta.usd < 0 ? ArrowDownRight : Minus;
  return (
    <div className="space-y-3 text-sm" data-price-benchmark={slug}>
      <p className={`flex items-center gap-1 tabular-nums ${delta.usd < 0 ? "text-[var(--price-down)]" : "text-[var(--accent-text)]"}`}>
        <Icon size={18} aria-hidden="true" />{formatPriceDelta(record.previousUSD, record.newUSD)}
      </p>
      <p className="text-xs text-[var(--text-muted)]">USD vs. previous preset of {formatHistoryUSD(record.previousUSD)} · {record.unit}</p>
      <p className="text-xs text-[var(--text-muted)]">{record.benchmarkCorrection ? "Benchmark definition updated" : "Previous source date not recorded"}</p>
      <div className="flex flex-wrap justify-between gap-2 border-t border-[var(--neutral-line)] pt-3 text-xs text-[var(--text-muted)]">
        <a href={record.sourceURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">{record.sourceName}<ExternalLink size={12} aria-hidden="true" /></a>
        <span>{record.sourcePeriod}</span>
      </div>
      {detail && <p className="leading-6 text-[var(--text-muted)]">{record.definition}. {record.methodology}</p>}
      {detail && <p className="text-xs text-[var(--text-muted)]">Recorded for editorial review {record.recordedDate}, not a publication or deployment date. Previous source date unknown. Differences compare presets, not annual inflation or proven market price changes.</p>}
      <Link href={`/examples/price-history#${slug}`} className="inline-flex items-center gap-2 text-[var(--accent-text)]">View price history<span className="sr-only"> for {slug.replaceAll("-", " ")}</span><ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  );
}
