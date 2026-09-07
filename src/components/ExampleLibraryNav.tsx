import Link from "next/link";
import { History, LayoutGrid } from "lucide-react";
import { priceHistory } from "@/lib/price-history";

export function ExampleLibraryNav({ history = false }: { history?: boolean }) {
  return <nav aria-label="Example library views" className="mb-7 flex gap-7 border-b border-[var(--neutral-line)]">
    {[{ href: "/examples", label: "Examples", active: !history, Icon: LayoutGrid }, { href: "/examples/price-history", label: `Price history (${priceHistory.length})`, active: history, Icon: History }].map(({ href, label, active, Icon }) => (
      <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`inline-flex items-center gap-2 border-b-2 py-4 text-sm ${active ? "border-[var(--accent-text)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-muted)]"}`}><Icon size={16} aria-hidden="true" />{label}</Link>
    ))}
  </nav>;
}
