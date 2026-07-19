import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const planTierValidator = v.union(
  v.literal("freeAccount"),
  v.literal("pro"),
  v.literal("lifetime"),
);

export const purchaseTypeValidator = v.union(
  v.literal("one-time"),
  v.literal("monthly"),
);

export const currencyCodeValidator = v.union(
  v.literal("USD"),
  v.literal("EUR"),
  v.literal("GBP"),
  v.literal("CHF"),
  v.literal("JPY"),
);

export const scenarioInputValidator = v.object({
  itemName: v.string(),
  currencyCode: v.optional(currencyCodeValidator),
  currentItemPriceUSD: v.number(),
  currentBTCPriceUSD: v.number(),
  years: v.number(),
  itemInflationRate: v.number(),
  btcGrowthRate: v.number(),
  purchaseType: purchaseTypeValidator,
});

export const emailPreferencesValidator = v.object({
  weeklyReport: v.boolean(),
  scenarioUpdates: v.boolean(),
  educationLessons: v.boolean(),
  popularExamples: v.boolean(),
});

export const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("trialing"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("incomplete"),
  v.literal("incomplete_expired"),
  v.literal("unpaid"),
  v.literal("paused"),
  v.literal("unknown"),
);

export const supportThreadStatusValidator = v.union(
  v.literal("open"),
  v.literal("closed"),
);

export const supportMessageStatusValidator = v.union(
  v.literal("processing"),
  v.literal("sent"),
  v.literal("failed"),
);

export default defineSchema({
  accounts: defineTable({
    ownerTokenIdentifier: v.string(),
    email: v.optional(v.string()),
    planTier: planTierValidator,
    emailPreferences: emailPreferencesValidator,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    subscriptionStatus: v.optional(subscriptionStatusValidator),
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    lifetimePurchasedAt: v.optional(v.string()),
    billingUpdatedAt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerTokenIdentifier", ["ownerTokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  billingSnapshots: defineTable({
    convexAccountId: v.optional(v.id("accounts")),
    stripeCustomerId: v.optional(v.string()),
    email: v.optional(v.string()),
    planTier: planTierValidator,
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    subscriptionStatus: v.optional(subscriptionStatusValidator),
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    lifetimePurchasedAt: v.optional(v.string()),
    billingUpdatedAt: v.string(),
    stripeEventId: v.string(),
    stripeEventType: v.string(),
    lastWebhookAction: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_convexAccountId", ["convexAccountId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_email", ["email"])
    .index("by_stripeEventId", ["stripeEventId"]),

  savedScenarios: defineTable({
    ownerTokenIdentifier: v.string(),
    clientId: v.optional(v.string()),
    scenario: scenarioInputValidator,
    savedAt: v.string(),
    baselineBTCPriceUSD: v.number(),
    baselineItemCostBTC: v.number(),
    baselineCurrencyCode: v.optional(currencyCodeValidator),
    sourceType: v.union(v.literal("custom"), v.literal("preset")),
    presetSlug: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    sourceLastUpdatedAt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerTokenIdentifier", ["ownerTokenIdentifier"])
    .index("by_ownerTokenIdentifier_and_clientId", [
      "ownerTokenIdentifier",
      "clientId",
    ]),

  scenarioPresets: defineTable({
    slug: v.string(),
    scenario: scenarioInputValidator,
    shortDescription: v.string(),
    category: v.string(),
    icon: v.string(),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    sourceLastUpdatedAt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  emailDeliveries: defineTable({
    ownerTokenIdentifier: v.string(),
    kind: v.literal("weekly-report"),
    periodKey: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    attempts: v.number(),
    providerMessageId: v.optional(v.string()),
    failureCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_ownerTokenIdentifier_and_kind_and_periodKey", [
    "ownerTokenIdentifier",
    "kind",
    "periodKey",
  ]),

  supportThreads: defineTable({
    senderEmail: v.string(),
    senderName: v.optional(v.string()),
    subject: v.string(),
    subjectKey: v.string(),
    status: supportThreadStatusValidator,
    latestInboundMessageId: v.optional(v.string()),
    lastMessageAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_senderEmail_and_subjectKey", ["senderEmail", "subjectKey"])
    .index("by_status_and_lastMessageAt", ["status", "lastMessageAt"]),

  supportMessages: defineTable({
    threadId: v.id("supportThreads"),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    status: supportMessageStatusValidator,
    eventId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    providerEmailId: v.optional(v.string()),
    messageId: v.optional(v.string()),
    sender: v.string(),
    recipient: v.string(),
    subject: v.string(),
    textBody: v.string(),
    attachmentCount: v.number(),
    failureCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_requestId", ["requestId"])
    .index("by_providerEmailId", ["providerEmailId"])
    .index("by_threadId_and_createdAt", ["threadId", "createdAt"])
    .index("by_threadId_and_direction_and_createdAt", [
      "threadId",
      "direction",
      "createdAt",
    ]),
});
