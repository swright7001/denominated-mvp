import Link from "next/link";
import { Bitcoin, Menu } from "lucide-react";
import { BrandMark } from "./BrandMark";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/examples", label: "Examples" },
  { href: "/learn", label: "Learn" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(240,163,111,0.16)] bg-[#090806]/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" aria-label="Denominated home">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#d9ccbd] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="transition hover:text-[#f0a36f]"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-[rgba(240,163,111,0.32)] px-4 py-2 text-sm text-[#efe6da] sm:flex">
            <Bitcoin size={16} className="text-[#f0a36f]" />
            BTC
          </div>
          <Link
            className="outline-button hidden rounded-md px-4 py-2 text-sm text-[#f0a36f] sm:block"
            href="/calculator"
          >
            Run a Scenario
          </Link>
          <button
            aria-label="Open navigation"
            className="outline-button rounded-md p-2 md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
