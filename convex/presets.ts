import { v } from "convex/values";
import { query } from "./_generated/server";

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
