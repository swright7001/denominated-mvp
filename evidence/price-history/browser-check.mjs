import { chromium } from '/Users/openclaw/Documents/Denominated/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const theme of ['dark', 'light']) {
      for (const [size, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
        const page = await browser.newPage({ viewport: { width, height }, colorScheme: theme });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto('http://localhost:3217/examples');
        await page.locator('[data-price-benchmark]').first().waitFor();
        assert.equal(await page.locator('[data-price-benchmark]').count(), 6);
        assert.equal(await page.locator('main article').count(), 12);
        assert.equal(await page.locator('a a').count(), 0);
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        const scenarioLinks = await page.locator('main article > a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
        assert.equal(new Set(scenarioLinks).size, 12);
        await page.screenshot({ path: `evidence/price-history/examples-${size}-${theme}.png`, fullPage: true });
        await page.getByRole('link', { name: 'View price history for childcare' }).click();
        await page.waitForURL('**/examples/price-history#childcare');
        assert.equal(await page.locator('#childcare').count(), 1);
        assert.equal(await page.locator('main article').count(), 6);
        assert.equal(await page.locator('main article a[target="_blank"]').count(), 6);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `evidence/price-history/history-${size}-${theme}.png`, fullPage: true });
        for (const href of scenarioLinks) {
          const response = await page.goto(`http://localhost:3217${href}`);
          assert.equal(response.status(), 200, href);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, href);
          if (['rent', 'median-us-house', 'elder-care', 'childcare', 'college-tuition', 'wedding'].some((slug) => href.endsWith('/' + slug))) {
            assert.equal(await page.locator('[data-price-benchmark]').count(), 1, href);
          }
        }
        await page.goto('http://localhost:3217/examples/college-tuition');
        await page.screenshot({ path: `evidence/price-history/tuition-${size}-${theme}.png`, fullPage: true });
        assert.deepEqual(errors, []);
        results.push({ theme, size, width, checks: '12 routes, 6 benchmarks, history navigation and sources, no nested anchors, no overflow, no page errors: PASS' });
        await page.close();
      }
    }
    fs.writeFileSync('evidence/price-history/browser-results.json', JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
