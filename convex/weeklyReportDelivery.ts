import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizeEmail } from "../src/lib/account";
import { getBTCPrice } from "../src/lib/btc-price";
import { normalizeCurrencyCode, type CurrencyCode } from "../src/lib/currency";
import { scenarios } from "../src/lib/scenarios";
import {
  buildWeeklyReportEmail,
  getWeeklyReportEmailEnv,
  sendWeeklyReportEmail,
} from "../src/lib/weekly-report-email";

export function verifiedPrimaryEmail(user: {
  primary_email_address_id?: string | null;
  email_addresses?: Array<{
    id: string;
    email_address: string;
    verification?: { status?: string };
  }>;
}) {
  const primary = user.email_addresses?.find(
    (email) => email.id === user.primary_email_address_id,
  );
  return primary?.verification?.status === "verified"
    ? normalizeEmail(primary.email_address)
    : null;
}

export const send = internalAction({
  args: { accountId: v.id("accounts"), periodKey: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (process.env.DENOMINATED_ENABLE_RECURRING_EMAIL !== "true") return null;
    const env = getWeeklyReportEmailEnv({
      ...process.env,
      VERCEL_ENV: "production",
    });
    const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN;
    const clerkKey = process.env.CLERK_SECRET_KEY;
    if (
      !env ||
      !issuer ||
      !clerkKey ||
      !/@(?:[a-z0-9-]+\.)*getdenominated\.com>?$/i.test(env.from)
    ) {
      throw new Error("RECURRING_EMAIL_NOT_CONFIGURED");
    }
    const recipient = await ctx.runQuery(internal.weeklyReports.getRecipient, {
      accountId: args.accountId,
    });
    if (!recipient || !recipient.owner.startsWith(`${issuer}|`)) return null;
    const subject = recipient.owner.slice(issuer.length + 1);
    if (!/^user_[a-zA-Z0-9]+$/.test(subject)) return null;
    const response = await fetch(`https://api.clerk.com/v1/users/${subject}`, {
      headers: { Authorization: `Bearer ${clerkKey}` },
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("RECIPIENT_VERIFICATION_FAILED");
    const email = verifiedPrimaryEmail(await response.json());
    if (!email || email !== normalizeEmail(recipient.email)) return null;
    const saved = await ctx.runQuery(internal.weeklyReports.scenarios, {
      accountId: args.accountId,
    });
    const currencies = new Set<CurrencyCode>([
      "USD",
      ...saved.map((item) => normalizeCurrencyCode(item.scenario.currencyCode)),
    ]);
    const btcPrices = Object.fromEntries(
      await Promise.all(
        [...currencies].map(async (currency) => [
          currency,
          await getBTCPrice({ currencyCode: currency }),
        ]),
      ),
    );
    const payload = buildWeeklyReportEmail({
      appUrl: env.appUrl,
      btcPrices,
      examples: scenarios.slice(0, 3),
      periodKey: args.periodKey,
      reportDate: new Date(),
      scenarios: saved.map((item) => ({
        scenario: item.scenario,
        baselineItemCostBTC: item.baselineItemCostBTC,
      })),
    });
    const reservation = await ctx.runMutation(internal.weeklyReports.reserve, {
      ...args,
      verifiedEmail: email,
    });
    if (!reservation) return null;
    try {
      const result = await sendWeeklyReportEmail({
        apiKey: env.apiKey,
        from: env.from,
        to: email,
        idempotencyKey: `denominated-${reservation.deliveryId}`,
        ...payload,
      });
      await ctx.runMutation(internal.weeklyReports.finish, {
        ...reservation,
        messageId: result.id,
      });
    } catch {
      await ctx.runMutation(internal.weeklyReports.finish, reservation);
      // Deliberately do not retry an uncertain external send automatically.
      // The shared record permits bounded manual recovery inside 23 hours.
      console.error("scheduled_weekly_report_failed", {
        periodKey: args.periodKey,
      });
    }
    return null;
  },
});
