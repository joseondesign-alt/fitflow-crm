import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";
import { v } from "convex/values";

const key = "fitflow-demo";

export const getSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const snapshot = await ctx.db.query("snapshots").withIndex("by_key", (q) => q.eq("key", key)).unique();
    if (!snapshot) return null;
    return { payload: snapshot.payload, updatedAt: snapshot.updatedAt };
  },
});

export const replaceSnapshot = mutation({
  args: { payload: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("snapshots").withIndex("by_key", (q) => q.eq("key", key)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { payload: args.payload, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("snapshots", { key, payload: args.payload, updatedAt: Date.now() });
    }
    return { ok: true, updatedAt: Date.now() };
  },
});
