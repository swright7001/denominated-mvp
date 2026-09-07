/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import { getWeeklyReportPeriodKey } from "../src/lib/weekly-report-email";
import { verifiedPrimaryEmail } from "./weeklyReportDelivery";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);
const owner = "https://clerk.example.test|user_abc";
const email = "reader@example.test";
beforeEach(() => {
  vi.stubEnv("DENOMINATED_ENABLE_RECURRING_EMAIL", "true");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function setup(overrides: Record<string, unknown> = {}) {
  const t = convexTest(schema, modules);
  const accountId = await t.run(async (ctx) =>
    ctx.db.insert("accounts", {
      ownerTokenIdentifier: owner,
      email,
      planTier: "pro",
      emailPreferences: {
        weeklyReport: true,
        scenarioUpdates: true,
        educationLessons: true,
        popularExamples: true,
      },
      weeklyReportSubscribed: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    }),
  );
  return { t, accountId, periodKey: getWeeklyReportPeriodKey() };
}

test("scheduled and manual sends share the same weekly reservation", async () => {
  const { t, accountId, periodKey } = await setup();
  const signedIn = t.withIdentity({ tokenIdentifier: owner });
  const manual = await signedIn.mutation(
    api.emailDeliveries.reserveWeeklyReport,
    { periodKey },
  );
  expect(
    await t.mutation(internal.weeklyReports.reserve, {
      accountId,
      periodKey,
      verifiedEmail: email,
    }),
  ).toBeNull();
  await signedIn.mutation(api.emailDeliveries.completeWeeklyReport, {
    deliveryId: manual.deliveryId,
    providerMessageId: "msg_manual",
  });
  expect(
    await t.mutation(internal.weeklyReports.reserve, {
      accountId,
      periodKey,
      verifiedEmail: email,
    }),
  ).toBeNull();
});

test("scheduled reservation blocks the manual path and duplicate cron invocations", async () => {
  const { t, accountId, periodKey } = await setup();
  const first = await t.mutation(internal.weeklyReports.reserve, {
    accountId,
    periodKey,
    verifiedEmail: email,
  });
  expect(first?.attempt).toBe(1);
  expect(
    await t.mutation(internal.weeklyReports.reserve, {
      accountId,
      periodKey,
      verifiedEmail: email,
    }),
  ).toBeNull();
  await expect(
    t
      .withIdentity({ tokenIdentifier: owner })
      .mutation(api.emailDeliveries.reserveWeeklyReport, { periodKey }),
  ).rejects.toThrow();
});

test.each([
  { planTier: "freeAccount" },
  { weeklyReportSubscribed: false },
  { weeklyReportSubscribed: undefined },
  {
    emailPreferences: {
      weeklyReport: false,
      scenarioUpdates: true,
      educationLessons: true,
      popularExamples: true,
    },
  },
  { email: "someone-else@example.test" },
])(
  "ineligible accounts are skipped at reservation time: %o",
  async (overrides) => {
    const { t, accountId, periodKey } = await setup(overrides);
    expect(
      await t.mutation(internal.weeklyReports.reserve, {
        accountId,
        periodKey,
        verifiedEmail: email,
      }),
    ).toBeNull();
  },
);

test("opt-out and billing downgrade after queueing are honored", async () => {
  const { t, accountId, periodKey } = await setup();
  expect(
    await t.query(internal.weeklyReports.getRecipient, { accountId }),
  ).not.toBeNull();
  await t
    .withIdentity({ tokenIdentifier: owner })
    .mutation(api.accounts.setWeeklyReportSubscription, { enabled: false });
  expect(
    await t.mutation(internal.weeklyReports.reserve, {
      accountId,
      periodKey,
      verifiedEmail: email,
    }),
  ).toBeNull();
  await t
    .withIdentity({ tokenIdentifier: owner })
    .mutation(api.accounts.setWeeklyReportSubscription, { enabled: true });
  await t.run(async (ctx) =>
    ctx.db.patch(accountId, { planTier: "freeAccount" }),
  );
  expect(
    await t.mutation(internal.weeklyReports.reserve, {
      accountId,
      periodKey,
      verifiedEmail: email,
    }),
  ).toBeNull();
});

test("turning weekly reports off also cancels automatic delivery", async () => {
  const { t, accountId } = await setup();
  await t
    .withIdentity({ tokenIdentifier: owner })
    .mutation(api.accounts.updateEmailPreferences, {
      preferences: {
        weeklyReport: false,
        scenarioUpdates: false,
        educationLessons: false,
        popularExamples: false,
      },
    });
  expect(
    (await t.run(async (ctx) => ctx.db.get(accountId)))?.weeklyReportSubscribed,
  ).toBe(false);
  await expect(
    t.mutation(api.accounts.setWeeklyReportSubscription, { enabled: true }),
  ).rejects.toThrow();
});

test("stale completion cannot overwrite a successful later attempt", async () => {
  const { t, accountId, periodKey } = await setup();
  const first = (await t.mutation(internal.weeklyReports.reserve, {
    accountId,
    periodKey,
    verifiedEmail: email,
  }))!;
  await t.mutation(internal.weeklyReports.finish, first);
  const second = (await t.mutation(internal.weeklyReports.reserve, {
    accountId,
    periodKey,
    verifiedEmail: email,
  }))!;
  await t.mutation(internal.weeklyReports.finish, {
    ...second,
    messageId: "msg_success",
  });
  await t.mutation(internal.weeklyReports.finish, first);
  expect(
    (await t.run(async (ctx) => ctx.db.get(first.deliveryId)))?.status,
  ).toBe("sent");
});

test("retry window expires before the provider idempotency window", async () => {
  const { t, accountId, periodKey } = await setup();
  const first = (await t.mutation(internal.weeklyReports.reserve, {
    accountId,
    periodKey,
    verifiedEmail: email,
  }))!;
  await t.run(async (ctx) =>
    ctx.db.patch(first.deliveryId, {
      status: "failed",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
    }),
  );
  expect(
    await t.mutation(internal.weeklyReports.reserve, {
      accountId,
      periodKey,
      verifiedEmail: email,
    }),
  ).toBeNull();
  await expect(
    t
      .withIdentity({ tokenIdentifier: owner })
      .mutation(api.emailDeliveries.reserveWeeklyReport, { periodKey }),
  ).rejects.toThrow();
});

test("disabled scheduler queues nothing and refuses reservations", async () => {
  const { t, accountId, periodKey } = await setup();
  vi.stubEnv("DENOMINATED_ENABLE_RECURRING_EMAIL", "false");
  await t.mutation(internal.weeklyReports.enqueue, {});
  expect(
    await t.run(async (ctx) =>
      ctx.db.system.query("_scheduled_functions").take(100),
    ),
  ).toHaveLength(0);
  expect(
    await t.mutation(internal.weeklyReports.reserve, {
      accountId,
      periodKey,
      verifiedEmail: email,
    }),
  ).toBeNull();
});

test("queue batches only explicit subscribers and schedules a bounded continuation", async () => {
  vi.useFakeTimers();
  const { t } = await setup();
  await t.run(async (ctx) => {
    for (let i = 0; i < 26; i++)
      await ctx.db.insert("accounts", {
        ownerTokenIdentifier: `https://clerk.example.test|user_${i}`,
        email,
        planTier: "lifetime",
        weeklyReportSubscribed: true,
        emailPreferences: {
          weeklyReport: true,
          scenarioUpdates: false,
          educationLessons: false,
          popularExamples: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
  });
  await t.mutation(internal.weeklyReports.enqueue, {});
  const jobs = await t.run(async (ctx) =>
    ctx.db.system.query("_scheduled_functions").take(100),
  );
  expect(jobs).toHaveLength(26); // 25 sends plus one continuation
});

test("recipient verification accepts only the verified primary Clerk address", () => {
  const user = {
    primary_email_address_id: "primary",
    email_addresses: [
      {
        id: "other",
        email_address: "wrong@example.test",
        verification: { status: "verified" },
      },
      {
        id: "primary",
        email_address: "Reader@Example.test",
        verification: { status: "unverified" },
      },
    ],
  };
  expect(verifiedPrimaryEmail(user)).toBeNull();
  user.email_addresses[1].verification.status = "verified";
  expect(verifiedPrimaryEmail(user)).toBe(email);
});

test("delivery verifies Clerk and records the mocked provider result", async () => {
  const { t, accountId, periodKey } = await setup();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv(
    "DENOMINATED_EMAIL_FROM",
    "Denominated <reports@reports.getdenominated.com>",
  );
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://getdenominated.com");
  vi.stubEnv("CLERK_JWT_ISSUER_DOMAIN", "https://clerk.example.test");
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test_mock");
  const requests: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      requests.push(url);
      if (url.includes("api.clerk.com"))
        return Response.json({
          primary_email_address_id: "primary",
          email_addresses: [
            {
              id: "primary",
              email_address: email,
              verification: { status: "verified" },
            },
          ],
        });
      if (url.includes("api.resend.com")) {
        expect(JSON.parse(init?.body as string).to).toEqual([email]);
        return Response.json({ id: "msg_scheduled" });
      }
      return Response.json({
        bitcoin: { usd: 90000, last_updated_at: Math.floor(Date.now() / 1000) },
      });
    }),
  );
  await t.action(internal.weeklyReportDelivery.send, { accountId, periodKey });
  const deliveries = await t.run(async (ctx) =>
    ctx.db.query("emailDeliveries").take(10),
  );
  expect(deliveries[0]).toMatchObject({
    status: "sent",
    providerMessageId: "msg_scheduled",
  });
  expect(requests.filter((url) => url.includes("api.resend.com"))).toHaveLength(
    1,
  );
});

test.each(["unverified", "wrong-address", "deleted"])(
  "no email is sent for %s Clerk recipients",
  async (mode) => {
    const { t, accountId, periodKey } = await setup();
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv(
      "DENOMINATED_EMAIL_FROM",
      "Denominated <reports@reports.getdenominated.com>",
    );
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://getdenominated.com");
    vi.stubEnv("CLERK_JWT_ISSUER_DOMAIN", "https://clerk.example.test");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_mock");
    const mockedFetch = vi.fn(async (input: string | URL | Request) => {
      expect(String(input)).toContain("api.clerk.com");
      if (mode === "deleted") return new Response(null, { status: 404 });
      return Response.json({
        primary_email_address_id: "primary",
        email_addresses: [
          {
            id: "primary",
            email_address:
              mode === "wrong-address" ? "other@example.test" : email,
            verification: {
              status: mode === "unverified" ? "unverified" : "verified",
            },
          },
        ],
      });
    });
    vi.stubGlobal("fetch", mockedFetch);
    await t.action(internal.weeklyReportDelivery.send, {
      accountId,
      periodKey,
    });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(
      await t.run(async (ctx) => ctx.db.query("emailDeliveries").take(10)),
    ).toHaveLength(0);
  },
);

test.each(["rejected", "network-error"])(
  "provider %s leaves a bounded failed record without automatic retries",
  async (mode) => {
    const { t, accountId, periodKey } = await setup();
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv(
      "DENOMINATED_EMAIL_FROM",
      "Denominated <reports@reports.getdenominated.com>",
    );
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://getdenominated.com");
    vi.stubEnv("CLERK_JWT_ISSUER_DOMAIN", "https://clerk.example.test");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_mock");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes("api.clerk.com"))
          return Response.json({
            primary_email_address_id: "primary",
            email_addresses: [
              {
                id: "primary",
                email_address: email,
                verification: { status: "verified" },
              },
            ],
          });
        if (url.includes("api.resend.com")) {
          if (mode === "network-error")
            throw new Error("provider details must not be logged");
          return Response.json(
            { message: "provider details must not be logged" },
            { status: 429 },
          );
        }
        return Response.json({
          bitcoin: {
            usd: 90000,
            last_updated_at: Math.floor(Date.now() / 1000),
          },
        });
      }),
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await t.action(internal.weeklyReportDelivery.send, {
        accountId,
        periodKey,
      });
      const deliveries = await t.run(async (ctx) =>
        ctx.db.query("emailDeliveries").take(10),
      );
      expect(deliveries[0]).toMatchObject({
        status: "failed",
        attempts: 1,
        failureCode: "SCHEDULED_DELIVERY_FAILED",
      });
      expect(log).toHaveBeenCalledExactlyOnceWith(
        "scheduled_weekly_report_failed",
        { periodKey },
      );
      expect(
        await t.run(async (ctx) =>
          ctx.db.system.query("_scheduled_functions").take(100),
        ),
      ).toHaveLength(0);
    } finally {
      log.mockRestore();
    }
  },
);
