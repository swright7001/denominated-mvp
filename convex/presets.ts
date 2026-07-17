import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { scenarioInputValidator } from "./schema";

const presetInputFields = {
  slug: v.string(),
  scenario: scenarioInputValidator,
  shortDescription: v.string(),
  category: v.string(),
  icon: v.string(),
  sourceName: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
  sourceLastUpdatedAt: v.optional(v.string()),
};

async function requireOwnerTokenIdentifier(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Sign in to manage scenario presets.");
  }

  return identity.tokenIdentifier;
}

export const list = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 100);

    if (args.category) {
      return await ctx.db
        .query("scenarioPresets")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(limit);
    }

    return await ctx.db.query("scenarioPresets").take(limit);
  },
});

export const upsert = mutation({
  args: presetInputFields,
  handler: async (ctx, args) => {
    await requireOwnerTokenIdentifier(ctx);

    const now = Date.now();
    const existing = await ctx.db
      .query("scenarioPresets")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("scenarioPresets", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnerTokenIdentifier(ctx);

    const existing = await ctx.db
      .query("scenarioPresets")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!existing) {
      return null;
    }

    await ctx.db.delete(existing._id);

    return existing._id;
  },
});
