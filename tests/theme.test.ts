import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  parseTheme,
  resolveTheme,
  themeInitScript,
  themeStorageKey,
} from "../src/lib/theme";

const readSource = (path: string) => readFileSync(path, "utf8");

test("theme preference parsing accepts only supported values", () => {
  assert.equal(parseTheme("light"), "light");
  assert.equal(parseTheme("dark"), "dark");
  assert.equal(parseTheme("system"), null);
  assert.equal(parseTheme(null), null);
});

test("stored preferences override the system while first visits follow it", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
});

test("the inline initializer applies a theme before hydration", () => {
  assert.match(themeInitScript, new RegExp(themeStorageKey));
  assert.match(themeInitScript, /prefers-color-scheme: dark/);
  assert.match(themeInitScript, /document\.documentElement\.dataset\.theme/);

  const layout = readSource("src/app/layout.tsx");
  assert.match(layout, /suppressHydrationWarning/);
  assert.match(layout, /dangerouslySetInnerHTML=\{\{ __html: themeInitScript \}\}/);
});

test("theme selection stays browser-local and exposes an accessible control", () => {
  const toggle = readSource("src/components/ThemeToggle.tsx");
  assert.match(toggle, /aria-label=\{label\}/);
  assert.match(toggle, /localStorage\.setItem\(themeStorageKey/);
  assert.doesNotMatch(toggle, /fetch\(|document\.cookie/);
});

test("both palettes and live chart tokens are defined", () => {
  const styles = readSource("src/app/globals.css");
  const chart = readSource("src/components/BTCComparisonChart.tsx");

  assert.match(styles, /\[data-theme="dark"\]/);
  assert.match(styles, /\[data-theme="light"\]/);
  assert.match(styles, /color-scheme: dark/);
  assert.match(styles, /color-scheme: light/);
  assert.match(chart, /var\(--chart-bar\)/);
  assert.match(chart, /var\(--chart-btc\)/);
  assert.doesNotMatch(chart, /#b9ab9a|#a55f38|#efe6da/);
});
