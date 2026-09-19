import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { now, type Db } from "../db/index.js";
import { orderFromSupplier } from "../supplier.js";

// Phase 2: the agentic tools — repairs against the booking calendar, restocking, host feed.
// Same voice-first descriptions as tools/index.ts; every reply carries structuredContent.

type Stay = { id: string; guest_name: string; guests: number; check_in: string; check_out: string };
type Ticket = {
  id: number; stay_id: string | null; category: string; description: string; urgency: string;
  status: string; created_at: string; scheduled_at: string | null; vendor_id: number | null;
};
type Vendor = { id: number; trade: string; name: string; phone: string };
type Supply = { id: number; item: string; location: string; quantity: number; reorder_at: number; sku: string };
type Feed = { id: number; kind: string; message: string; created_at: string };

const TRADE_FOR: Record<string, string> = {
  plumbing: "plumber", heating: "plumber", electrical: "electrician", appliance: "electrician",
  cleaning: "cleaner", other: "handyman",
};

const text = (t: string, structured?: Record<string, unknown>) => ({
  content: [{ type: "text" as const, text: t }],
  ...(structured ? { structuredContent: structured } : {}),
});

const day = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (from: string, n: number) => { const d = new Date(from + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return day(d); };
const spoken = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); const ampm = h >= 12 ? "pm" : "am"; const hr = h % 12 || 12; return m ? `${hr}:${String(m).padStart(2, "0")} ${ampm}` : `${hr} ${ampm}`; };
const weekday = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });

export const registerHouseTools = (server: McpServer, db: Db, propertyId: string) => {
  const today = () => day(new Date());
  const currentStay = () =>
    db.prepare(`SELECT id, guest_name, guests, check_in, check_out FROM stays WHERE property_id = ? AND check_in <= date('now') AND check_out >= date('now') ORDER BY check_in DESC LIMIT 1`).get(propertyId) as Stay | undefined;
  const property = () => db.prepare(`SELECT checkout_time FROM properties WHERE id = ?`).get(propertyId) as { checkout_time: string } | undefined;
  const stays = () => db.prepare(`SELECT id, guest_name, guests, check_in, check_out FROM stays WHERE property_id = ? ORDER BY check_in`).all(propertyId) as Stay[];
  const feed = (kind: string, message: string) =>
    db.prepare(`INSERT INTO host_feed (property_id, kind, message, created_at) VALUES (?, ?, ?, ?)`).run(propertyId, kind, message, now());

  // ---- get_todays_agenda ---------------------------------------------------------------
  server.registerTool(
    "get_todays_agenda",
    {
      title: "What is happening today",
      description:
        "What is happening at the house today and tomorrow: repairs booked, deliveries arriving, checkout or arrivals. Use for 'what's on today', 'is anyone coming', or the morning after a guest reported something.",
      inputSchema: {},
    },
    async () => {
      const t = today(); const tomorrow = addDays(t, 1);
      const stay = currentStay();
      const tickets = db.prepare(`SELECT t.*, v.name AS vendor_name FROM tickets t LEFT JOIN vendors v ON v.id = t.vendor_id WHERE t.property_id = ? AND (t.scheduled_at LIKE ? OR t.scheduled_at LIKE ?) ORDER BY t.scheduled_at`).all(propertyId, `${t}%`, `${tomorrow}%`) as (Ticket & { vendor_name: string | null })[];
      const orders = db.prepare(`SELECT s.item, o.quantity, o.eta FROM orders o JOIN supplies s ON s.sku = o.sku AND s.property_id = o.property_id WHERE o.property_id = ? AND o.eta IN (?, ?)`).all(propertyId, t, tomorrow) as { item: string; quantity: number; eta: string }[];
      const next = stays().find((s) => s.check_in > t);
      const when = (iso: string) => (iso.startsWith(t) ? "today" : "tomorrow");
      const lines: string[] = [];
      for (const k of tickets) lines.push(`${k.vendor_name ?? "A contractor"} is coming ${when(k.scheduled_at!)} at ${spoken(k.scheduled_at!.slice(11, 16))} for the ${k.category} issue you reported ("${k.description}").`);
      // One line per item, however many orders: "2 packs of coffee pods arrive tomorrow."
      const byItem = new Map<string, { item: string; quantity: number; eta: string }>();
      for (const o of orders) { const k = `${o.item}|${o.eta}`; const cur = byItem.get(k); byItem.set(k, cur ? { ...cur, quantity: cur.quantity + o.quantity } : { ...o }); }
      for (const o of byItem.values()) lines.push(`${o.quantity} ${o.quantity === 1 ? "pack" : "packs"} of ${o.item} arrive ${when(o.eta)}.`);
      if (stay?.check_out === t) lines.push(`Checkout is today at ${property()?.checkout_time ?? "11:00"}.`);
      else if (stay?.check_out === tomorrow) lines.push(`Checkout is tomorrow.`);
      if (next?.check_in === tomorrow) lines.push(`New guests arrive tomorrow.`);
      const summary = lines.length ? lines.join(" ") : "Nothing is scheduled at the house today or tomorrow.";
      return text(summary, { date: t, summary, repairs: tickets, deliveries: orders, stay: stay ?? null, nextStay: next ?? null });
    },
  );

  // ---- list_vendors --------------------------------------------------------------------
  server.registerTool(
    "list_vendors",
    {
      title: "The host's contractors",
      description: "The host's trusted contractors for this house (plumber, electrician, cleaner, handyman). Use before scheduling a repair or when the guest asks who to call.",
      inputSchema: { trade: z.string().optional().describe("Filter by trade, e.g. plumber") },
    },
    async ({ trade }) => {
      const rows = (trade
        ? db.prepare(`SELECT id, trade, name, phone FROM vendors WHERE property_id = ? AND trade = ?`).all(propertyId, trade.toLowerCase())
        : db.prepare(`SELECT id, trade, name, phone FROM vendors WHERE property_id = ? ORDER BY trade`).all(propertyId)) as Vendor[];
      return text(rows.length ? rows.map((v) => `${v.trade}: ${v.name}`).join("; ") : "No contractor is listed for that.", { vendors: rows });
    },
  );

  // ---- schedule_repair -----------------------------------------------------------------
  server.registerTool(
    "schedule_repair",
    {
      title: "Book a repair",
      description:
        "Book the host's contractor for an open ticket. Picks the right trade for the ticket, and the first slot that does not fall on a changeover day (a check-out or check-in) so the house is not double-booked. Confirm the slot with the guest before calling this; pass their preference.",
      inputSchema: {
        ticket_id: z.number().int().describe("From report_issue"),
        preference: z.enum(["morning", "afternoon", "any"]).default("any"),
      },
    },
    async ({ ticket_id, preference }) => {
      const ticket = db.prepare(`SELECT * FROM tickets WHERE id = ? AND property_id = ?`).get(ticket_id, propertyId) as Ticket | undefined;
      if (!ticket) return text(`I can't find ticket ${ticket_id}.`, { ok: false, reason: "not_found" });
      if (ticket.status === "scheduled") return text(`Ticket ${ticket_id} is already booked for ${ticket.scheduled_at}.`, { ok: false, reason: "already_scheduled", scheduledAt: ticket.scheduled_at });
      const trade = TRADE_FOR[ticket.category] ?? "handyman";
      const vendor = db.prepare(`SELECT id, trade, name, phone FROM vendors WHERE property_id = ? AND trade = ?`).get(propertyId, trade) as Vendor | undefined;
      if (!vendor) return text(`The host has no ${trade} listed. I've asked them to arrange one.`, { ok: false, reason: "no_vendor", trade });

      // Changeover days: any check-in or check-out. Urgent tickets get today; otherwise tomorrow onward.
      const busy = new Set(stays().flatMap((s) => [s.check_in, s.check_out]));
      let date = ticket.urgency === "urgent" ? today() : addDays(today(), 1);
      for (let i = 0; i < 14 && busy.has(date); i++) date = addDays(date, 1);
      const time = preference === "morning" ? "10:00" : "15:00";
      const scheduledAt = `${date}T${time}`;
      db.prepare(`UPDATE tickets SET status = 'scheduled', scheduled_at = ?, vendor_id = ? WHERE id = ?`).run(scheduledAt, vendor.id, ticket_id);
      feed("repair", `#${ticket_id} ${ticket.category}: ${vendor.name} booked ${weekday(date)} ${date} ${time}`);
      const stay = currentStay();
      const avoided = [...busy].filter((d) => d >= today() && d < date);
      const why = avoided.length ? ` I skipped ${avoided.map((d) => weekday(d)).join(" and ")} because that's a changeover day.` : "";
      return text(
        `${vendor.name} is booked for ${weekday(date)} at ${spoken(time)} for the ${ticket.category} issue.${why}${stay ? ` I've let ${stay.guest_name} and the host know.` : ""}`,
        { ok: true, ticketId: ticket_id, vendor, scheduledAt, scheduledSpoken: `${weekday(date)} ${spoken(time)}`, avoidedDays: avoided },
      );
    },
  );

  // ---- check_supplies ------------------------------------------------------------------
  server.registerTool(
    "check_supplies",
    {
      title: "Check the cupboards",
      description: "What consumables the house has (coffee pods, toilet paper, dishwasher tablets, firewood), where they are, and which are low. Use when a guest says something is out or asks where to find it.",
      inputSchema: { item: z.string().optional().describe("One item, or leave empty for everything") },
    },
    async ({ item }) => {
      const all = db.prepare(`SELECT id, item, location, quantity, reorder_at, sku FROM supplies WHERE property_id = ?`).all(propertyId) as Supply[];
      const rows = item ? all.filter((s) => s.item.includes(item.toLowerCase()) || item.toLowerCase().includes(s.item)) : all;
      if (!rows.length) return text(`The house doesn't stock ${item}.`, { found: false, items: all.map((s) => s.item) });
      const lines = rows.map((s) => `${s.item}: ${s.quantity} left, ${s.location}${s.quantity <= s.reorder_at ? " (low)" : ""}`);
      return text(lines.join(". "), { found: true, supplies: rows.map((s) => ({ ...s, low: s.quantity <= s.reorder_at })) });
    },
  );

  // ---- order_supply --------------------------------------------------------------------
  server.registerTool(
    "order_supply",
    {
      title: "Reorder something",
      description: "Order a consumable for the house from the host's supplier, delivered to the property. Use when a guest says something has run out. Returns the order number and arrival day. Tell the guest where the spare is meanwhile (check_supplies gives the location).",
      inputSchema: { item: z.string(), quantity: z.number().int().positive().optional().describe("Units; defaults to the item's usual pack") },
    },
    async ({ item, quantity }) => {
      const supply = (db.prepare(`SELECT id, item, location, quantity, reorder_at, sku FROM supplies WHERE property_id = ?`).all(propertyId) as Supply[])
        .find((s) => s.item.includes(item.toLowerCase()) || item.toLowerCase().includes(s.item));
      if (!supply) return text(`I don't have a supplier item for ${item}. I've told the host.`, { ok: false, reason: "unknown_item" });
      const qty = quantity ?? 1;
      const packs = `${qty} ${qty === 1 ? "pack" : "packs"} of ${supply.item}`;
      const result = await orderFromSupplier({ sku: supply.sku, quantity: qty, deliverTo: propertyId });
      const res = db.prepare(`INSERT INTO orders (property_id, sku, quantity, status, eta, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(propertyId, supply.sku, qty, result.status, result.eta, now());
      const orderId = Number(res.lastInsertRowid);
      feed("order", `Order #${orderId}: ${qty} × ${supply.item} (${supply.sku}), ${result.status}, arrives ${result.eta}`);
      return text(
        `Ordered ${packs}, arriving ${weekday(result.eta)}. Meanwhile: ${supply.location}. The host has been told.`,
        { ok: true, orderId, sku: supply.sku, item: supply.item, quantity: qty, status: result.status, eta: result.eta, etaSpoken: weekday(result.eta), meanwhile: supply.location, supplierRef: result.ref },
      );
    },
  );

  // ---- notify_host ---------------------------------------------------------------------
  server.registerTool(
    "notify_host",
    {
      title: "Tell the host",
      description: "Send the host a short message from the guest or from you (a question you couldn't answer, a compliment, a request like late checkout). Not for problems — use report_issue for those.",
      inputSchema: { message: z.string(), kind: z.enum(["question", "request", "note"]).default("note") },
    },
    async ({ message, kind }) => {
      const stay = currentStay();
      feed(kind, `${stay ? stay.guest_name + ": " : ""}${message}`);
      return text("Sent to the host.", { ok: true, kind });
    },
  );

  // ---- host_briefing -------------------------------------------------------------------
  server.registerTool(
    "host_briefing",
    {
      title: "Host briefing",
      description: "For the host: everything that happened at the house recently — repairs booked, orders placed, guest messages, open tickets, low supplies, and who arrives next. Use when the host asks 'what happened at the house' or for a morning briefing.",
      inputSchema: { days: z.number().int().positive().default(7) },
    },
    async ({ days }) => {
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const events = db.prepare(`SELECT id, kind, message, created_at FROM host_feed WHERE property_id = ? AND created_at >= ? ORDER BY created_at`).all(propertyId, since) as Feed[];
      const open = db.prepare(`SELECT * FROM tickets WHERE property_id = ? AND status = 'open'`).all(propertyId) as Ticket[];
      const low = (db.prepare(`SELECT id, item, location, quantity, reorder_at, sku FROM supplies WHERE property_id = ? AND quantity <= reorder_at`).all(propertyId)) as Supply[];
      const next = stays().find((s) => s.check_in > today());
      const stay = currentStay();
      const parts = [
        stay ? `${stay.guest_name} is in until ${stay.check_out}.` : "The house is empty.",
        events.length ? `${events.length} event${events.length === 1 ? "" : "s"}: ${events.map((e) => e.message).join("; ")}.` : "No events.",
        open.length ? `${open.length} open ticket${open.length === 1 ? "" : "s"} still need booking.` : "",
        low.length ? `Low: ${low.map((s) => s.item).join(", ")}.` : "",
        next ? `Next: ${next.guest_name} on ${next.check_in}.` : "",
      ].filter(Boolean);
      return text(parts.join(" "), { events, openTickets: open, lowSupplies: low, stay: stay ?? null, nextStay: next ?? null });
    },
  );

  // ---- resources -----------------------------------------------------------------------
  server.registerResource(
    "property-guide",
    `property://${propertyId}/guide`,
    { title: "House guide", description: "Everything the host wrote about how this house works.", mimeType: "text/markdown" },
    async (uri) => {
      const entries = db.prepare(`SELECT topic, answer FROM guide_entries WHERE property_id = ? ORDER BY topic`).all(propertyId) as { topic: string; answer: string }[];
      const md = entries.map((e) => `## ${e.topic}\n${e.answer}`).join("\n\n");
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: md }] };
    },
  );
  server.registerResource(
    "current-stay",
    "stay://current",
    { title: "Current stay", description: "The booking in the house right now, and the next one.", mimeType: "application/json" },
    async (uri) => {
      const stay = currentStay(); const next = stays().find((s) => s.check_in > today());
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify({ stay: stay ?? null, nextStay: next ?? null }) }] };
    },
  );

  // ---- prompt --------------------------------------------------------------------------
  server.registerPrompt(
    "host-morning-briefing",
    { title: "Host morning briefing", description: "Read the host what happened overnight and what is on today, in under 30 seconds of speech." },
    async () => ({
      messages: [{
        role: "user",
        content: { type: "text", text: "You are the house's assistant speaking to its host over Alexa. Call host_briefing with days=1 and get_todays_agenda, then read a spoken briefing: what guests reported, what you already handled (bookings, orders) and what still needs the host. Under 80 words, no lists, warm and plain." },
      }],
    }),
  );
};
