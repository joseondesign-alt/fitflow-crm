import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const contact = v.object({
  id: v.string(), name: v.string(), email: v.string(), phone: v.string(), source: v.string(),
  stage: v.string(), next: v.string(), activity: v.string(),
});
const event = v.object({ id: v.string(), date: v.string(), label: v.string(), contact: v.string(), detail: v.string() });
const automation = v.object({ id: v.string(), service: v.string(), name: v.string(), status: v.string(), lastRun: v.string() });
const program = v.object({ id: v.string(), client: v.string(), goal: v.string(), frequency: v.string(), status: v.string(), createdAt: v.string() });
const workout = v.object({ id: v.string(), client: v.string(), date: v.string(), label: v.string(), duration: v.string(), completion: v.number(), volume: v.string() });
const finance = v.object({ id: v.string(), month: v.string(), type: v.string(), category: v.string(), amount: v.number() });
const chatThread = v.object({ id: v.string(), name: v.string(), initials: v.string(), channel: v.string(), status: v.string(), lastMessage: v.string(), time: v.string(), unread: v.number(), stage: v.string() });
const chatMessage = v.object({ id: v.string(), threadId: v.string(), sender: v.string(), text: v.string(), time: v.string() });

export default defineSchema({
  contacts: defineTable(contact).index("by_external_id", ["id"]),
  events: defineTable(event).index("by_external_id", ["id"]),
  automations: defineTable(automation).index("by_external_id", ["id"]),
  programs: defineTable(program).index("by_external_id", ["id"]),
  workouts: defineTable(workout).index("by_external_id", ["id"]),
  finance: defineTable(finance).index("by_external_id", ["id"]),
  chatThreads: defineTable(chatThread).index("by_external_id", ["id"]),
  chatMessages: defineTable(chatMessage).index("by_external_id", ["id"]).index("by_thread", ["threadId"]),
  snapshots: defineTable({ key: v.string(), payload: v.string(), updatedAt: v.number() }).index("by_key", ["key"]),
});
