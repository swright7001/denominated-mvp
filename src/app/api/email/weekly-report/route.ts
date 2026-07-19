import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { normalizeEmail } from "@/lib/account";
import { getBTCPrice } from "@/lib/btc-price";
import {
  normalizeCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";
import { scenarios } from "@/lib/scenarios";
import {
  buildWeeklyReportEmail,
  getWeeklyReportEmailEnv,
  getWeeklyReportPeriodKey,
  sendWeeklyReportEmail,
} from "@/lib/weekly-report-email";
import { getErrorKind } from "@/lib/monitoring";

export async function POST(request: Request) {
  const emailEnv = getWeeklyReportEmailEnv();

  if (!emailEnv) {
    return NextResponse.json(
      {
        code: "EMAIL_NOT_CONFIGURED",
        error: "Weekly email reports are not configured yet.",
      },
      { status: 503 },
    );
  }

  if (!isSameOriginRequest(request, emailEnv.appUrl)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  const verifiedEmail =
    primaryEmail?.verification?.status === "verified"
      ? normalizeEmail(primaryEmail.emailAddress)
      : "";
  const token = await getToken({ template: "convex" });

  if (!verifiedEmail || !token) {
    return NextResponse.json(
      { error: "A verified account email is required." },
      { status: 409 },
    );
  }

  const periodKey = getWeeklyReportPeriodKey();
  let deliveryId: Id<"emailDeliveries"> | null = null;

  try {
    const reservation = await fetchMutation(
      api.emailDeliveries.reserveWeeklyReport,
      { periodKey },
      { token },
    );
    deliveryId = reservation.deliveryId;

    if (normalizeEmail(reservation.email) !== verifiedEmail) {
      await fetchMutation(
        api.emailDeliveries.failWeeklyReport,
        { deliveryId: reservation.deliveryId, failureCode: "EMAIL_MISMATCH" },
        { token },
      );
      return NextResponse.json(
        { error: "Verify the email saved on your Denominated account." },
        { status: 409 },
      );
    }

    const savedScenarios = await fetchQuery(
      api.savedScenarios.list,
      { limit: 20 },
      { token },
    );
    const requestedCurrencies = new Set<CurrencyCode>(["USD"]);
    savedScenarios.forEach((savedScenario) =>
      requestedCurrencies.add(
        normalizeCurrencyCode(savedScenario.scenario.currencyCode),
      ),
    );
    const btcPrices = Object.fromEntries(
      await Promise.all(
        [...requestedCurrencies].map(async (currencyCode) => [
          currencyCode,
          await getBTCPrice({ currencyCode }),
        ]),
      ),
    );
    const email = buildWeeklyReportEmail({
      appUrl: emailEnv.appUrl,
      btcPrices,
      examples: scenarios.slice(0, 3),
      periodKey,
      reportDate: new Date(),
      scenarios: savedScenarios.map((savedScenario) => ({
        scenario: savedScenario.scenario,
        baselineItemCostBTC: savedScenario.baselineItemCostBTC,
      })),
    });
    const result = await sendWeeklyReportEmail({
      apiKey: emailEnv.apiKey,
      from: emailEnv.from,
      to: verifiedEmail,
      idempotencyKey: `denominated-${reservation.deliveryId}`,
      ...email,
    });

    await fetchMutation(
      api.emailDeliveries.completeWeeklyReport,
      { deliveryId: reservation.deliveryId, providerMessageId: result.id },
      { token },
    );

    return NextResponse.json({ sent: true, periodKey });
  } catch (error) {
    if (deliveryId) {
      await fetchMutation(
        api.emailDeliveries.failWeeklyReport,
        { deliveryId, failureCode: "PROVIDER_ERROR" },
        { token },
      ).catch(() => null);
    }

    console.error("weekly_report_delivery_failed", {
      periodKey,
      errorKind: getErrorKind(error),
    });
    return NextResponse.json(
      {
        error:
          "This week's report could not be sent. Check your plan and email preferences, then try again later.",
      },
      { status: 409 },
    );
  }
}

function isSameOriginRequest(request: Request, appUrl: string) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(appUrl).origin);
}
