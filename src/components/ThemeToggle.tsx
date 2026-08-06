"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { parseTheme, resolveTheme, themeStorageKey, type Theme } from "@/lib/theme";

const darkMediaQuery = "(prefers-color-scheme: dark)";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function readActiveTheme(): Theme {
  const documentTheme = parseTheme(document.documentElement.dataset.theme);
  if (documentTheme) return documentTheme;

  return resolveTheme(
    window.localStorage.getItem(themeStorageKey),
    window.matchMedia(darkMediaQuery).matches,
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const media = window.matchMedia(darkMediaQuery);
    const syncTheme = () => {
      const nextTheme = readActiveTheme();
      applyTheme(nextTheme);
      setTheme(nextTheme);
    };
    const followSystemTheme = (event: MediaQueryListEvent) => {
      if (parseTheme(window.localStorage.getItem(themeStorageKey))) return;
      const nextTheme: Theme = event.matches ? "dark" : "light";
      applyTheme(nextTheme);
      setTheme(nextTheme);
    };

    syncTheme();
    media.addEventListener("change", followSystemTheme);
    return () => media.removeEventListener("change", followSystemTheme);
  }, []);

  const nextTheme = theme === "light" ? "dark" : "light";
  const label = theme ? `Switch to ${nextTheme} mode` : "Toggle color theme";

  return (
    <button
      aria-label={label}
      className="outline-button theme-toggle grid h-10 w-10 shrink-0 place-items-center rounded-md"
      title={label}
      type="button"
      onClick={() => {
        const currentTheme = theme ?? readActiveTheme();
        const selectedTheme: Theme = currentTheme === "light" ? "dark" : "light";
        window.localStorage.setItem(themeStorageKey, selectedTheme);
        applyTheme(selectedTheme);
        setTheme(selectedTheme);
      }}
    >
      <Sun aria-hidden="true" className="theme-icon theme-icon-light" size={18} />
      <Moon aria-hidden="true" className="theme-icon theme-icon-dark" size={18} />
    </button>
  );
}
