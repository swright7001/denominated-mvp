import Link from "next/link";
import { BrandMark } from "./BrandMark";

export const DISCLAIMER =
  "This tool is educational only. It does not provide financial advice. Future Bitcoin prices, inflation rates, and item prices are assumptions, not guarantees.";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(240,163,111,0.16)] py-10">
      <div className="container grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div className="space-y-5">
          <BrandMark />
          <p className="max-w-2xl text-sm leading-6 text-[#b9ab9a]">
            {DISCLAIMER}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[#d9ccbd] md:justify-end">
          <Link href="/calculator">Calculator</Link>
          <Link href="/examples">Examples</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/plans">Plans</Link>
          <Link href="/account">Account</Link>
          <Link href="/learn">Learn</Link>
        </div>
      </div>
    </footer>
  );
}
