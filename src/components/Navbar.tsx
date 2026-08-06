"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Bitcoin, Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const primaryNavItems = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/examples", label: "Examples" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plans", label: "Plans" },
  { href: "/learn", label: "Learn" },
];

export function Navbar({ realAccountsEnabled = false }: { realAccountsEnabled?: boolean }) {
  if (realAccountsEnabled) return <AuthAwareNavbar />;

  return <NavbarShell accountItem={{ href: "/account", label: "Account" }} />;
}

function AuthAwareNavbar() {
  const { isLoaded, isSignedIn } = useUser();
  const accountItem =
    isLoaded && isSignedIn
      ? { href: "/account", label: "Account" }
      : { href: "/sign-in", label: "Sign in" };

  return <NavbarShell accountItem={accountItem} />;
}

function NavbarShell({
  accountItem,
}: {
  accountItem: { href: string; label: string };
}) {
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
  const navItems = [
    ...primaryNavItems.slice(0, 6),
    accountItem,
    ...primaryNavItems.slice(6),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--accent-line-soft)] bg-[var(--nav-background)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-[min(1440px,calc(100%-32px))] items-center justify-between gap-2 sm:gap-4">
        <Link
          className="min-w-0 shrink"
          href="/"
          aria-label="Denominated home"
          onClick={closeMenu}
        >
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--text-secondary)] xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="whitespace-nowrap transition hover:text-[var(--accent-text)]"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <div
            aria-label="Bitcoin benchmark denomination"
            className="hidden items-center gap-2 px-2 py-2 text-xs text-[var(--text-muted)] sm:flex"
          >
            <Bitcoin size={16} className="text-[var(--accent-text)]" />
            <span className="whitespace-nowrap">BTC benchmark</span>
          </div>
          <Link
            className="outline-button hidden rounded-md px-4 py-2 text-sm text-[var(--accent-text)] sm:block"
            href="/calculator"
          >
            Run a Scenario
          </Link>
          <ThemeToggle />
          <button
            aria-controls={mobileMenuId}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            className="outline-button rounded-md p-2 xl:hidden"
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <MobileMenuIcon size={20} />
          </button>
        </div>
      </div>
      <div
        id={mobileMenuId}
        className={`container xl:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <nav className="mb-4 rounded-lg border border-[var(--accent-line)] bg-[var(--menu-background)] p-3 shadow-2xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="block rounded-md px-4 py-3 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--accent-text)]"
              href={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="copper-button mt-2 block rounded-md px-4 py-3 text-center text-sm font-semibold"
            href="/calculator"
            onClick={closeMenu}
          >
            Run a Scenario
          </Link>
        </nav>
      </div>
    </header>
  );
}
