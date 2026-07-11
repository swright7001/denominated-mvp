"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Bitcoin, Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { trackProductEvent } from "@/lib/product-analytics";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/examples", label: "Examples" },
  { href: "/learn", label: "Learn" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const MobileMenuIcon = isMenuOpen ? X : Menu;

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(240,163,111,0.16)] bg-[#090806]/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-2 sm:gap-4">
        <Link
          className="min-w-0"
          href="/"
          aria-label="Denominated home"
          onClick={closeMenu}
        >
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
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-[rgba(240,163,111,0.32)] px-4 py-2 text-sm text-[#efe6da] sm:flex">
            <Bitcoin size={16} className="text-[#f0a36f]" />
            BTC
          </div>
          <Link
            className="outline-button hidden rounded-md px-4 py-2 text-sm text-[#f0a36f] sm:block"
            href="/calculator"
            onClick={() =>
              trackProductEvent({
                event: "cta_clicked",
                cta: "nav_run_scenario",
              })
            }
          >
            Run a Scenario
          </Link>
          <button
            aria-controls={mobileMenuId}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            className="outline-button rounded-md p-2 md:hidden"
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <MobileMenuIcon size={20} />
          </button>
        </div>
      </div>
      <div
        id={mobileMenuId}
        className={`container md:hidden ${isMenuOpen ? "block" : "hidden"}`}
      >
        <nav className="mb-4 rounded-lg border border-[rgba(240,163,111,0.24)] bg-[#120d09]/95 p-3 shadow-2xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="block rounded-md px-4 py-3 text-sm text-[#d9ccbd] transition hover:bg-white/5 hover:text-[#f0a36f]"
              href={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="copper-button mt-2 block rounded-md px-4 py-3 text-center text-sm font-semibold"
            href="/calculator"
            onClick={() => {
              trackProductEvent({
                event: "cta_clicked",
                cta: "nav_run_scenario",
              });
              closeMenu();
            }}
          >
            Run a Scenario
          </Link>
        </nav>
      </div>
    </header>
  );
}
