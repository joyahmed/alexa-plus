import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { serve, type ServerType } from "@hono/node-server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { buildApp } from "../src/app.js";
import { openDb } from "../src/db/index.js";
import { seed, PROPERTIES } from "../src/db/seed.js";

// One server, three houses: `/mcp?property=<id>` picks the house, the default answers without it.
const TOKEN = "t";
let httpServer: ServerType;
let base: string;
const clients: Client[] = [];

const house = async (id?: string) => {
  const client = new Client({ name: "test", version: "0" });
  const url = new URL(`${base}/mcp${id ? `?property=${id}` : ""}`);
  await client.connect(new StreamableHTTPClientTransport(url, { requestInit: { headers: { authorization: `Bearer ${TOKEN}` } } }));
  clients.push(client);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-side view of structuredContent
  const call = async (name: string, args: Record<string, unknown> = {}) => (await client.callTool({ name, arguments: args })).structuredContent as Record<string, any>;
  return { client, call };
};

const plus = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

beforeAll(async () => {
  const db = openDb(":memory:");
  seed(db);
  const app = buildApp({ db, propertyId: "lakeview", token: TOKEN });
  await new Promise<void>((resolve) => {
    httpServer = serve({ fetch: app.fetch, port: 0 }, (info) => { base = `http://127.0.0.1:${info.port}`; resolve(); });
  });
});
afterAll(async () => { await Promise.all(clients.map((c) => c.close())); httpServer.closeAllConnections?.(); await new Promise<void>((r) => httpServer.close(() => r())); });

describe("three houses on one server", () => {
  it("/health names every seeded property", async () => {
    const res = await (await fetch(`${base}/health`)).json();
    expect(res.property).toBe("lakeview");
    expect(res.properties.map((p: { id: string }) => p.id)).toEqual(PROPERTIES.map((p) => p.id).sort());
  });

  it("each house has its own guide, guests and cupboards", async () => {
    const lake = await house();
    const loft = await house("harbor");
    const chalet = await house("pineridge");
    expect((await lake.call("get_property_guide", { question: "how does the hot tub work" })).topic).toBe("hot tub");
    expect((await loft.call("get_property_guide", { question: "what's the door code" })).topic).toBe("door");
    expect((await chalet.call("get_property_guide", { question: "how do I light the wood stove" })).topic).toBe("wood stove");
    expect((await loft.call("get_property_guide", { question: "hot tub?" })).found).toBe(false);
    expect((await loft.call("get_current_stay")).stay.guest_name).toBe("Marcus");
    expect((await chalet.call("get_current_stay")).stay.check_in).toBe(plus(0));
    expect((await loft.call("check_supplies", { item: "coffee" })).supplies[0].item).toBe("coffee beans");
    expect((await loft.client.listResources()).resources.map((r) => r.uri)).toContain("property://harbor/guide");
  });

  it("harbor: a repair reported today skips tomorrow's checkout AND the next day's check-in", async () => {
    const loft = await house("harbor");
    const t = await loft.call("report_issue", { category: "heating", description: "the bedroom radiator is cold" });
    const booked = await loft.call("schedule_repair", { ticket_id: t.ticketId, preference: "morning" });
    expect(booked.ok).toBe(true);
    expect(booked.avoidedDays).toEqual([plus(1), plus(2)]);
    expect(booked.scheduledAt).toBe(`${plus(3)}T10:00`);
    // The booking lives in the loft only: the cabin's agenda and tickets are untouched.
    const lake = await house();
    expect((await lake.call("schedule_repair", { ticket_id: t.ticketId })).reason).toBe("not_found");
  });

  it("pineridge has no electrician, so an electrical ticket asks the host instead", async () => {
    const chalet = await house("pineridge");
    const t = await chalet.call("report_issue", { category: "electrical", description: "the loft light flickers" });
    const booked = await chalet.call("schedule_repair", { ticket_id: t.ticketId });
    expect(booked).toMatchObject({ ok: false, reason: "no_vendor", trade: "electrician" });
  });

  it("an unknown property is a 404, not a silent default", async () => {
    const res = await fetch(`${base}/mcp?property=nowhere`, { method: "POST", headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" }, body: "{}" });
    expect(res.status).toBe(404);
    expect((await res.json()).properties).toContain("harbor");
  });
});
