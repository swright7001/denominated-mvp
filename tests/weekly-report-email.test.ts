import test from "node:test";
import assert from "node:assert/strict";
import { buildFallbackBTCPrice } from "../src/lib/btc-price";
import {
  buildWeeklyReportEmail,
  getWeeklyReportEmailEnv,
  getWeeklyReportPeriodKey,
  sendWeeklyReportEmail,
} from "../src/lib/weekly-report-email";

test("weekly email environment requires a verified-style sender and public app URL", () => {
  assert.equal(getWeeklyReportEmailEnv({}), null);
  assert.equal(
    getWeeklyReportEmailEnv({
      VERCEL_ENV: "production",
      RESEND_API_KEY: "re_test",
      DENOMINATED_EMAIL_FROM: "Denominated <onboarding@resend.dev>",
      NEXT_PUBLIC_APP_URL: "https://denominated.example",
    }),
    null,
  );
  assert.deepEqual(
    getWeeklyReportEmailEnv({
      VERCEL_ENV: "production",
      RESEND_API_KEY: "re_live",
      DENOMINATED_EMAIL_FROM: "Denominated <reports@denominated.example>",
      NEXT_PUBLIC_APP_URL: "https://denominated.example",
    }),
    {
      apiKey: "re_live",
      from: "Denominated <reports@denominated.example>",
      appUrl: "https://denominated.example",
    },
  );
});

test("weekly report period key follows ISO week boundaries", () => {
  assert.equal(
    getWeeklyReportPeriodKey(new Date("2026-01-01T12:00:00Z")),
    "2026-W01",
  );
  assert.equal(
    getWeeklyReportPeriodKey(new Date("2026-07-11T12:00:00Z")),
    "2026-W28",
  );
});

test("weekly report template escapes scenario names and includes educational links", () => {
  const email = buildWeeklyReportEmail({
    appUrl: "https://denominated.example",
    btcPrice: buildFallbackBTCPrice(
      "test",
      new Date("2026-07-11T12:00:00Z"),
    ),
    periodKey: "2026-W28",
    reportDate: new Date("2026-07-11T12:00:00Z"),
    examples: [],
    scenarios: [
      {
        scenario: {
          itemName: "Truck <script>",
          currentItemPriceUSD: 40000,
          currentBTCPriceUSD: 70000,
          years: 5,
          itemInflationRate: 4,
          btcGrowthRate: 15,
          purchaseType: "one-time",
        },
        baselineItemCostBTC: 0.6,
      },
    ],
  });

  assert.match(email.subject, /Denominated purchasing-power report/);
  assert.match(email.html, /Truck &lt;script&gt;/);
  assert.doesNotMatch(email.html, /Truck <script>/);
  assert.match(
    email.text,
    /Dashboard: https:\/\/denominated\.example\/dashboard/,
  );
  assert.match(email.text, /educational only/i);
});

test("weekly report uses popular examples when no scenarios are saved", () => {
  const email = buildWeeklyReportEmail({
    appUrl: "https://denominated.example",
    btcPrice: buildFallbackBTCPrice("test"),
    periodKey: "2026-W28",
    reportDate: new Date("2026-07-11T12:00:00Z"),
    scenarios: [],
    examples: [
      {
        itemName: "Median home",
        currentItemPriceUSD: 400000,
        currentBTCPriceUSD: 80000,
        years: 5,
        itemInflationRate: 4,
        btcGrowthRate: 15,
        purchaseType: "one-time",
      },
    ],
  });

  assert.match(email.text, /Median home/);
  assert.match(email.text, /popular life-cost example/);
});

test("weekly report uses the matching localized BTC price for each scenario", () => {
  const usdPrice = buildFallbackBTCPrice("test");
  const email = buildWeeklyReportEmail({
    appUrl: "https://denominated.example",
    btcPrices: {
      USD: usdPrice,
      EUR: {
        ...usdPrice,
        currencyCode: "EUR",
        price: 70000,
        fallbackPrice: 70000,
      },
    },
    periodKey: "2026-W28",
    reportDate: new Date("2026-07-11T12:00:00Z"),
    examples: [],
    scenarios: [
      {
        scenario: {
          itemName: "Euro goal",
          currencyCode: "EUR",
          currentItemPriceUSD: 35000,
          currentBTCPriceUSD: 60000,
          years: 5,
          itemInflationRate: 4,
          btcGrowthRate: 15,
          purchaseType: "one-time",
        },
        baselineItemCostBTC: 0.6,
      },
    ],
  });

  assert.match(email.text, /Euro goal: 0.5000 BTC today/);
  assert.match(email.text, /70\.000[^\n]*BTC/);
});

test("Resend delivery uses idempotency and rejects malformed success responses", async () => {
  let request: RequestInit | undefined;
  const result = await sendWeeklyReportEmail({
    apiKey: "re_test",
    from: "Denominated <reports@example.com>",
    to: "user@example.com",
    subject: "Report",
    html: "<p>Report</p>",
    text: "Report",
    idempotencyKey: "delivery_123",
    fetcher: async (_url, init) => {
      request = init;
      return Response.json({ id: "email_123" });
    },
  });

  assert.deepEqual(result, { id: "email_123" });
  assert.equal(
    (request?.headers as Record<string, string>)["Idempotency-Key"],
    "delivery_123",
  );

  await assert.rejects(
    sendWeeklyReportEmail({
      apiKey: "re_test",
      from: "Denominated <reports@example.com>",
      to: "user@example.com",
      subject: "Report",
      html: "<p>Report</p>",
      text: "Report",
      idempotencyKey: "delivery_456",
      fetcher: async () => Response.json({}, { status: 202 }),
    }),
    /Resend delivery failed/,
  );
});
