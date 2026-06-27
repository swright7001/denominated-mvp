import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { scenarioInputValidator } from "./schema";

const savedScenarioInputFields = {
  clientId: v.optional(v.string()),
  scenario: scenarioInputValidator,
  savedAt: v.string(),
  baselineBTCPriceUSD: v.number(),
  baselineItemCostBTC: v.number(),
  sourceType: v.optional(v.union(v.literal("custom"), v.literal("preset"))),
  presetSlug: v.optional(v.string()),
  sourceName: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
  sourceLastUpdatedAt: v.optional(v.string()),
};

const savedScenarioInputValidator = v.object(savedScenarioInputFields);

async function requireOwnerTokenIdentifier(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Sign in to use saved scenario storage.");
  }

  return identity.tokenIdentifier;
}

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);

    return await ctx.db
      .query("savedScenarios")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", ownerTokenIdentifier),
      )
      .order("desc")
      .take(Math.min(Math.max(args.limit ?? 100, 1), 100));
  },
});

export const save = mutation({
  args: savedScenarioInputFields,
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);
    const now = Date.now();
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", ownerTokenIdentifier),
      )
      .unique();

    if (!account) {
      throw new Error("Create an account before saving scenarios.");
    }

    if (args.clientId) {
      const existing = await ctx.db
        .query("savedScenarios")
        .withIndex("by_ownerTokenIdentifier_and_clientId", (q) =>
          q
            .eq("ownerTokenIdentifier", ownerTokenIdentifier)
            .eq("clientId", args.clientId),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...args,
          sourceType: args.sourceType ?? "custom",
          updatedAt: now,
        });

        return existing._id;
      }
    }

    if (account.planTier === "freeAccount") {
      const existingSavedScenarios = await ctx.db
        .query("savedScenarios")
        .withIndex("by_ownerTokenIdentifier", (q) =>
          q.eq("ownerTokenIdentifier", ownerTokenIdentifier),
        )
        .take(1);

      if (existingSavedScenarios.length >= 1) {
        throw new Error("Upgrade to Pro to save more than one scenario.");
      }
    }

    return await ctx.db.insert("savedScenarios", {
      ownerTokenIdentifier,
      ...args,
      sourceType: args.sourceType ?? "custom",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const importLocalWatchlist = mutation({
  args: {
    savedScenarios: v.array(savedScenarioInputValidator),
  },
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);

    if (args.savedScenarios.length > 50) {
      throw new Error("Import up to 50 saved scenarios at a time.");
    }

    const importedIds = [];

    for (const savedScenario of args.savedScenarios) {
      const now = Date.now();
      const existing = savedScenario.clientId
        ? await ctx.db
            .query("savedScenarios")
            .withIndex("by_ownerTokenIdentifier_and_clientId", (q) =>
              q
                .eq("ownerTokenIdentifier", ownerTokenIdentifier)
                .eq("clientId", savedScenario.clientId),
            )
            .unique()
        : null;

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...savedScenario,
          sourceType: savedScenario.sourceType ?? "custom",
          updatedAt: now,
        });
        importedIds.push(existing._id);
      } else {
        importedIds.push(
          await ctx.db.insert("savedScenarios", {
            ownerTokenIdentifier,
            ...savedScenario,
            sourceType: savedScenario.sourceType ?? "custom",
            createdAt: now,
            updatedAt: now,
          }),
        );
      }
    }

    return importedIds;
  },
});

export const rename = mutation({
  args: {
    id: v.id("savedScenarios"),
    itemName: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);
    const savedScenario = await ctx.db.get(args.id);

    if (!savedScenario) {
      throw new Error("Saved scenario not found.");
    }

    if (savedScenario.ownerTokenIdentifier !== ownerTokenIdentifier) {
      throw new Error("You do not have access to this saved scenario.");
    }

    const itemName = args.itemName.trim();

    if (!itemName) {
      throw new Error("Enter a saved scenario name.");
    }

    await ctx.db.patch(args.id, {
      scenario: {
        ...savedScenario.scenario,
        itemName,
      },
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("savedScenarios"),
  },
  handler: async (ctx, args) => {
    const ownerTokenIdentifier = await requireOwnerTokenIdentifier(ctx);
    const savedScenario = await ctx.db.get(args.id);

    if (!savedScenario) {
      return null;
    }

    if (savedScenario.ownerTokenIdentifier !== ownerTokenIdentifier) {
      throw new Error("You do not have access to this saved scenario.");
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
