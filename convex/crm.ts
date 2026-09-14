import { mutation, query } from "./_generated/server";
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
    const data = JSON.parse(args.payload) as Record<string, unknown>;
    const existing = await ctx.db.query("snapshots").withIndex("by_key", (q) => q.eq("key", key)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { payload: args.payload, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("snapshots", { key, payload: args.payload, updatedAt: Date.now() });
    }

    // Keep the demo snapshot convenient for the client while also materializing
    // each CRM collection into queryable Convex tables for future features.
    const collections = ["contacts", "events", "automations", "programs", "workouts", "finance", "chatThreads", "chatMessages"] as const;
    const rowsByCollection: Record<string, unknown[]> = {
      contacts: Array.isArray(data.contacts) ? data.contacts : [],
      events: Array.isArray(data.events) ? data.events : [],
      automations: Array.isArray(data.automations) ? data.automations : [],
      programs: Array.isArray(data.programs) ? data.programs : [],
      workouts: Array.isArray(data.workouts) ? data.workouts : [],
      finance: Array.isArray(data.finance) ? data.finance : [],
      chatThreads: Array.isArray(data.chats) ? data.chats.map((thread: any) => ({ id: thread.id, name: thread.name, initials: thread.initials, channel: thread.channel, status: thread.status, lastMessage: thread.lastMessage, time: thread.time, unread: thread.unread, stage: thread.stage })) : [],
      chatMessages: Array.isArray(data.chats) ? data.chats.flatMap((thread: any) => Array.isArray(thread.messages) ? thread.messages.map((message: any) => ({ id: message.id, threadId: thread.id, sender: message.sender, text: message.text, time: message.time })) : []) : [],
    };
    const db = ctx.db as any;
    for (const collection of collections) {
      const rows = await db.query(collection).collect();
      for (const row of rows) await db.delete(row._id);
      for (const row of rowsByCollection[collection]) await db.insert(collection, row);
    }
    return { ok: true, updatedAt: Date.now() };
  },
});

export const clearSnapshot = mutation({
  args: {},
  handler: async (ctx) => {
    const snapshot = await ctx.db.query("snapshots").withIndex("by_key", (q) => q.eq("key", key)).unique();
    if (snapshot) await ctx.db.delete(snapshot._id);
    const collections = ["contacts", "events", "automations", "programs", "workouts", "finance", "chatThreads", "chatMessages"] as const;
    const db = ctx.db as any;
    for (const collection of collections) {
      const rows = await db.query(collection).collect();
      for (const row of rows) await db.delete(row._id);
    }
    return { ok: true };
  },
});
