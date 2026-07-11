import type { BTCPriceResult } from "./btc-price";
import { calculateScenario, formatBTC, formatUSD } from "./calculations";
import { EDUCATIONAL_DISCLAIMER } from "./legal";
import type { ScenarioInput } from "./types";

type Env = Record<string, string | undefined>;
type Fetcher = typeof fetch;

export type WeeklyReportScenario = {
  scenario: ScenarioInput;
  baselineItemCostBTC: number;
};

export type WeeklyReportEmailInput = {
  appUrl: string;
  btcPrice: BTCPriceResult;
  examples: ScenarioInput[];
  periodKey: string;
  reportDate: Date;
  scenarios: WeeklyReportScenario[];
};

export function getWeeklyReportEmailEnv(env: Env = process.env) {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const from = env.DENOMINATED_EMAIL_FROM?.trim() ?? "";
  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() ?? "";

  if (
    !apiKey.startsWith("re_") ||
    !isValidEmailFrom(from) ||
    !isPublicHttpsUrl(appUrl)
  ) {
    return null;
  }

  if (env.VERCEL_ENV === "production" && /@resend\.dev>?$/i.test(from)) {
    return null;
  }

  return { apiKey, from, appUrl };
}

export function getWeeklyReportPeriodKey(date = new Date()) {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function buildWeeklyReportEmail(input: WeeklyReportEmailInput) {
  const reportDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(input.reportDate);
  const rows = input.scenarios
    .slice(0, 20)
    .map(({ scenario, baselineItemCostBTC }) => {
      const currentScenario = {
        ...scenario,
        currentBTCPriceUSD: input.btcPrice.priceUSD,
      };
      const currentCostBTC =
        calculateScenario(currentScenario).currentItemCostBTC;
      const difference = currentCostBTC - baselineItemCostBTC;
      const direction =
        Math.abs(difference) < 0.00005
          ? "about the same"
          : difference < 0
            ? `${formatBTC(Math.abs(difference))} BTC cheaper`
            : `${formatBTC(difference)} BTC higher`;

      return { itemName: scenario.itemName, currentCostBTC, direction };
    });
  const reportRows = rows.length
    ? rows.map((row) => ({
        ...row,
        detail: `${row.direction} than the saved baseline`,
      }))
    : input.examples.slice(0, 3).map((scenario) => {
        const currentCostBTC = calculateScenario({
          ...scenario,
          currentBTCPriceUSD: input.btcPrice.priceUSD,
        }).currentItemCostBTC;
        return {
          itemName: scenario.itemName,
          currentCostBTC,
          direction: "popular example",
          detail: "popular life-cost example",
        };
      });
  const scenarioMarkup = reportRows
    .map(
      (row) =>
        `<li style="margin:0 0 14px"><strong>${escapeHtml(row.itemName)}</strong><br>${formatBTC(row.currentCostBTC)} BTC today; ${escapeHtml(row.detail)}.</li>`,
    )
    .join("");
  const priceContext = `${formatUSD(input.btcPrice.priceUSD)} BTC (${input.btcPrice.status === "live" ? "CoinGecko reference" : "editable fallback"})`;

  return {
    subject: `Your Denominated purchasing-power report — ${reportDate}`,
    text: [
      `Denominated weekly purchasing-power report — ${reportDate}`,
      `BTC price used: ${priceContext}`,
      "",
      ...reportRows.map(
        (row) =>
          `${row.itemName}: ${formatBTC(row.currentCostBTC)} BTC today; ${row.detail}.`,
      ),
      "",
      `Dashboard: ${input.appUrl}/dashboard`,
      `Watchlist: ${input.appUrl}/watchlist`,
      `Calculator: ${input.appUrl}/calculator`,
      `Email preferences: ${input.appUrl}/dashboard`,
      "",
      EDUCATIONAL_DISCLAIMER,
    ].join("\n"),
    html: `<!doctype html><html><body style="margin:0;background:#090806;color:#efe6da;font-family:Arial,sans-serif"><main style="max-width:640px;margin:0 auto;padding:32px 22px"><p style="color:#f0a36f;text-transform:uppercase;letter-spacing:2px;font-size:12px">Denominated</p><h1 style="font-size:30px;margin:12px 0">Weekly purchasing-power report</h1><p style="color:#b9ab9a">${escapeHtml(reportDate)} · BTC price used: ${escapeHtml(priceContext)}</p><ul style="padding-left:20px;line-height:1.6">${scenarioMarkup}</ul><p><a style="color:#f0a36f" href="${input.appUrl}/dashboard">Open dashboard</a> · <a style="color:#f0a36f" href="${input.appUrl}/watchlist">Watchlist</a> · <a style="color:#f0a36f" href="${input.appUrl}/calculator">Calculator</a></p><p style="color:#8f8172;font-size:12px;line-height:1.5">${escapeHtml(EDUCATIONAL_DISCLAIMER)}</p><p style="color:#8f8172;font-size:12px"><a style="color:#b9ab9a" href="${input.appUrl}/dashboard">Manage email preferences</a></p></main></body></html>`,
  };
}

export async function sendWeeklyReportEmail({
  apiKey,
  fetcher = fetch,
  from,
  html,
  idempotencyKey,
  subject,
  text,
  to,
}: {
  apiKey: string;
  fetcher?: Fetcher;
  from: string;
  html: string;
  idempotencyKey: string;
  subject: string;
  text: string;
  to: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let response: Response;

  try {
    response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => null)) as {
    id?: unknown;
  } | null;

  if (!response.ok || typeof payload?.id !== "string" || !payload.id) {
    throw new Error(`Resend delivery failed with status ${response.status}`);
  }

  return { id: payload.id };
}

export function isValidEmailFrom(value: string) {
  const match = value.match(/^(?:[^<>]+<)?([^<>\s]+@[^<>\s]+)>?$/);
  return Boolean(match?.[1] && /^[^@]+@[^@]+\.[^@]+$/.test(match[1]));
}

function isPublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
