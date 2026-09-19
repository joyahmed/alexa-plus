import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { now, type Db } from "../db/index.js";

// Every tool description is written for a voice assistant: short, imperative, says when to use it.
// The property is fixed per deployment (one Echo per house) — PROPERTY_ID env, default "lakeview".

type Property = { id: string; name: string; address: string; checkout_time: string; wifi_ssid: string | null };
type GuideEntry = { topic: string; keywords: string; answer: string; image_url: string | null };
type Stay = { id: string; guest_name: string; guests: number; check_in: string; check_out: string };

const text = (t: string, structured?: Record<string, unknown>) => ({
  content: [{ type: "text" as const, text: t }],
  ...(structured ? { structuredContent: structured } : {}),
});

export const registerTools = (server: McpServer, db: Db, propertyId: string) => {
  const property = () =>
    db.prepare(`SELECT id, name, address, checkout_time, wifi_ssid FROM properties WHERE id = ?`).get(propertyId) as
      | Property
      | undefined;

  const currentStay = () =>
    db
      .prepare(
        `SELECT id, guest_name, guests, check_in, check_out FROM stays
         WHERE property_id = ? AND check_in <= date('now') AND check_out >= date('now')
         ORDER BY check_in DESC LIMIT 1`,
      )
      .get(propertyId) as Stay | undefined;

  server.registerTool(
    "get_property_guide",
    {
      title: "Ask the house",
      description:
        "Answer a guest's question about how something in this house works (hot tub, wifi, heating, checkout, bins, coffee). Call this first for any 'how do I' or 'where is' question. Returns the host's own instructions and, when there is one, a picture to show.",
      inputSchema: { question: z.string().describe("The guest's question, as spoken") },
    },
    async ({ question }) => {
      const q = question.toLowerCase();
      const entries = db.prepare(`SELECT topic, keywords, answer, image_url FROM guide_entries WHERE property_id = ?`).all(propertyId) as GuideEntry[];
      const scored = entries
        .map((e) => ({ e, score: e.keywords.split(",").filter((k) => q.includes(k.trim())).length }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);
      if (scored.length === 0) {
        const topics = entries.map((e) => e.topic).join(", ");
        return text(`The host hasn't written anything about that. Topics I do know: ${topics}.`, { found: false, topics: entries.map((e) => e.topic) });
      }
      const { e } = scored[0];
      return text(e.answer, { found: true, topic: e.topic, answer: e.answer, imageUrl: e.image_url });
    },
  );

  server.registerTool(
    "get_current_stay",
    {
      title: "Who is staying",
      description:
        "Get the current booking at this house: guest name, party size, check-in and check-out dates, checkout time, and the next arrival. Use it to personalise a reply or before scheduling anything at the property.",
      inputSchema: {},
    },
    async () => {
      const p = property();
      if (!p) return text("This device is not linked to a property yet.", { linked: false });
      const stay = currentStay();
      const next = db
        .prepare(`SELECT id, guest_name, guests, check_in, check_out FROM stays WHERE property_id = ? AND check_in > date('now') ORDER BY check_in LIMIT 1`)
        .get(propertyId) as Stay | undefined;
      const summary = stay
        ? `${stay.guest_name} (${stay.guests} guest${stay.guests === 1 ? "" : "s"}) is staying at ${p.name} until ${stay.check_out}; checkout is ${p.checkout_time}.` +
          (next ? ` The next guests arrive ${next.check_in}.` : "")
        : `Nobody is checked in at ${p.name} right now.` + (next ? ` The next guests arrive ${next.check_in}.` : "");
      return text(summary, { property: p, stay: stay ?? null, nextStay: next ?? null });
    },
  );

  server.registerTool(
    "report_issue",
    {
      title: "Report a problem",
      description:
        "Log something broken or wrong at the house (leak, no hot water, heating, appliance, noise, pests). Creates a maintenance ticket for the host and returns its number. Use urgency 'urgent' only when there is water, gas, electrical danger or the guest cannot stay.",
      inputSchema: {
        category: z.enum(["plumbing", "electrical", "heating", "appliance", "cleaning", "other"]),
        description: z.string().describe("What the guest said, in their words"),
        urgency: z.enum(["normal", "urgent"]).default("normal"),
      },
    },
    async ({ category, description, urgency }) => {
      const stay = currentStay();
      const createdAt = now();
      const res = db
        .prepare(
          `INSERT INTO tickets (property_id, stay_id, category, description, urgency, status, created_at)
           VALUES (?, ?, ?, ?, ?, 'open', ?)`,
        )
        .run(propertyId, stay?.id ?? null, category, description, urgency, createdAt);
      const id = Number(res.lastInsertRowid);
      db.prepare(`INSERT INTO host_feed (property_id, kind, message, created_at) VALUES (?, 'ticket', ?, ?)`).run(
        propertyId,
        `#${id} ${urgency === "urgent" ? "URGENT " : ""}${category}: ${description}${stay ? ` (reported by ${stay.guest_name})` : ""}`,
        createdAt,
      );
      return text(
        `Logged as ticket ${id}${urgency === "urgent" ? " and flagged urgent" : ""}. The host has been told.`,
        { ticketId: id, category, urgency, status: "open", createdAt },
      );
    },
  );
};
