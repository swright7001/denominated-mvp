import type { BTCPriceResult } from "@/lib/btc-price";
import { formatCurrency } from "@/lib/currency";

export function BTCPriceStatus({
  btcPrice,
  className = "",
}: {
  btcPrice: BTCPriceResult;
  className?: string;
}) {
  const tone =
    btcPrice.status === "fallback" || btcPrice.stale
      ? "border-[var(--accent)]/30 bg-[var(--accent-surface)] text-[var(--accent-soft-text)]"
      : "border-emerald-400/20 bg-emerald-400/5 text-[var(--text-secondary)]";
  const label =
    btcPrice.status === "fallback"
      ? "Using fallback BTC rate"
      : btcPrice.stale
        ? "BTC rate may be stale"
        : "Live BTC rate";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm leading-6 ${tone} ${className}`}
    >
      <p className="font-medium text-[var(--text-primary)]">{label}</p>
      <p className="mt-1">
        {btcPrice.status === "fallback"
          ? `Live pricing is unavailable, so examples are using ${formatCurrency(
              btcPrice.price,
              btcPrice.currencyCode,
            )} BTC for now.`
          : `Examples are using ${formatCurrency(
              btcPrice.price,
              btcPrice.currencyCode,
            )} BTC from ${btcPrice.provider}${formatUpdatedAt(
              btcPrice.lastUpdatedAt,
            )}.`}
      </p>
    </div>
  );
}

function formatUpdatedAt(lastUpdatedAt: string | null) {
  if (!lastUpdatedAt) return "";

  return `, updated ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(lastUpdatedAt))}`;
}
