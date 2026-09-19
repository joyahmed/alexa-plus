import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { serve, type ServerType } from "@hono/node-server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { buildApp } from "../src/app.js";
import { openDb } from "../src/db/index.js";
import { seed } from "../src/db/seed.js";

// The three video interactions, end to end over Streamable HTTP, against the seeded house.
const TOKEN = "t";
let httpServer: ServerType;
let url: URL;
let client: Client;
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const res = await client.callTool({ name, arguments: args });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-side view of structuredContent
  return res.structuredContent as Record<string, any>;
};

beforeAll(async () => {
  const db = openDb(":memory:");
  seed(db);
  const app = buildApp({ db, propertyId: "lakeview", token: TOKEN });
  await new Promise<void>((resolve) => {
    httpServer = serve({ fetch: app.fetch, port: 0 }, (info) => { url = new URL(`http://127.0.0.1:${info.port}/mcp`); resolve(); });
  });
  client = new Client({ name: "test", version: "0" });
  await client.connect(new StreamableHTTPClientTransport(url, { requestInit: { headers: { authorization: `Bearer ${TOKEN}` } } }));
});
afterAll(async () => { await client.close(); httpServer.closeAllConnections?.(); await new Promise<void>((r) => httpServer.close(() => r())); });

describe("the house, phase 2", () => {
  it("exposes ten tools, two resources and one prompt", async () => {
    expect((await client.listTools()).tools).toHaveLength(10);
    expect((await client.listResources()).resources.map((r) => r.uri).sort()).toEqual(["property://lakeview/guide", "stay://current"]);
    expect((await client.listPrompts()).prompts.map((p) => p.name)).toEqual(["host-morning-briefing"]);
  });

  it("the coffee pods are out → checks, orders, says where the spare is, tells the host", async () => {
    const before = await call("check_supplies", { item: "coffee pods" });
    expect(before.supplies[0].low).toBe(true);
    const order = await call("order_supply", { item: "coffee pods", quantity: 2 });
    expect(order.ok).toBe(true);
    expect(order.status).toBe("ordered");
    expect(order.meanwhile).toMatch(/hall cupboard/);
    const brief = await call("host_briefing", { days: 1 });
    expect(brief.events.some((e: { kind: string }) => e.kind === "order")).toBe(true);
  });

  it("the shower is dripping → ticket → plumber booked off a changeover day → shows on the agenda", async () => {
    const t = await call("report_issue", { category: "plumbing", description: "the shower is dripping" });
    const booked = await call("schedule_repair", { ticket_id: t.ticketId, preference: "afternoon" });
    expect(booked.ok).toBe(true);
    expect(booked.vendor.trade).toBe("plumber");
    expect(booked.scheduledAt).toMatch(/T15:00$/);
    // Seed: current stay checks out at today+3, next checks in today+4 — never book on those.
    const date = booked.scheduledAt.slice(0, 10);
    const stay = await call("get_current_stay");
    expect([stay.stay.check_out, stay.nextStay.check_in]).not.toContain(date);
    const agenda = await call("get_todays_agenda");
    expect(agenda.summary).toMatch(/tomorrow at 3 pm .*shower is dripping/);
    const again = await call("schedule_repair", { ticket_id: t.ticketId });
    expect(again.ok).toBe(false);
    expect(again.reason).toBe("already_scheduled");
  });

  it("an urgent ticket is booked today unless today is a changeover day", async () => {
    const t = await call("report_issue", { category: "electrical", description: "sparks from the socket", urgency: "urgent" });
    const booked = await call("schedule_repair", { ticket_id: t.ticketId, preference: "morning" });
    expect(booked.vendor.trade).toBe("electrician");
    const today = new Date().toISOString().slice(0, 10);
    expect(booked.scheduledAt.slice(0, 10) >= today).toBe(true);
  });

  it("notify_host lands in the briefing with the guest's name", async () => {
    await call("notify_host", { message: "could we check out at noon?", kind: "request" });
    const brief = await call("host_briefing", { days: 1 });
    expect(brief.events.some((e: { message: string }) => e.message.startsWith("Priya:"))).toBe(true);
  });

  it("resources read back the guide and the stay", async () => {
    const guide = await client.readResource({ uri: "property://lakeview/guide" });
    expect(guide.contents[0].text).toContain("## hot tub");
    const stay = await client.readResource({ uri: "stay://current" });
    expect(JSON.parse(stay.contents[0].text as string).stay.guest_name).toBe("Priya");
  });

  it("the prompt tells the model which tools to call", async () => {
    const p = await client.getPrompt({ name: "host-morning-briefing" });
    expect((p.messages[0].content as { text: string }).text).toContain("host_briefing");
  });
});
