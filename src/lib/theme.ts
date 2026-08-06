export const themeStorageKey = "denominated-theme";

export type Theme = "light" | "dark";

export function parseTheme(value: string | null | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function resolveTheme(
  storedTheme: string | null | undefined,
  systemPrefersDark: boolean,
): Theme {
  return parseTheme(storedTheme) ?? (systemPrefersDark ? "dark" : "light");
}

export const themeInitScript = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(themeStorageKey)});
    const theme = stored === "light" || stored === "dark"
      ? stored
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
})();`;
