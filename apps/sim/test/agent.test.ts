import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { serve, type ServerType } from "@hono/node-server";
import { buildApp } from "../../mcp/src/app.js";
import { openDb } from "../../mcp/src/db/index.js";
import { seed } from "../../mcp/src/db/seed.js";
import { runAgent } from "../lib/agent";

// The scripted agent, end to end: sim → MCP over Streamable HTTP → the seeded house.
let httpServer: ServerType;

beforeAll(async () => {
  const db = openDb(":memory:");
  seed(db);
  const app = buildApp({ db, propertyId: "lakeview", token: "t" });
  await new Promise<void>((resolve) => {
    httpServer = serve({ fetch: app.fetch, port: 0 }, (info) => {
      process.env.MCP_URL = `http://127.0.0.1:${info.port}/mcp`;
      process.env.MCP_TOKEN = "t";
      process.env.AGENT = "scripted";
      resolve();
    });
  });
});
afterAll(() => { (httpServer as unknown as { closeAllConnections?: () => void }).closeAllConnections?.(); return new Promise<void>((r) => httpServer.close(() => r())); });

describe("scripted agent through the MCP server", () => {
  it("hot tub → guide card with the host's photo", async () => {
    const res = await runAgent({ text: "How do I turn on the hot tub?", history: [] });
    expect(res.agent).toBe("scripted");
    expect(res.tools.map((t) => t.name)).toEqual(["get_property_guide"]);
    expect(res.cards[0]).toMatchObject({ kind: "guide", title: "hot tub", imageUrl: "/img/lakeview/hot-tub.svg" });
  });

  it("another house on the same server: the loft stocks beans, not pods", async () => {
    const res = await runAgent({ text: "We're out of coffee.", history: [], house: "harbor" });
    expect(res.tools.map((t) => t.name)).toEqual(["check_supplies", "order_supply"]);
    expect((res.tools[1].result as { item: string }).item).toBe("coffee beans");
    expect(res.text).toMatch(/grinder/);
  });

  it("coffee pods are out → check, order, say where the spare is", async () => {
    const res = await runAgent({ text: "The coffee pods are out.", history: [] });
    expect(res.tools.map((t) => t.name)).toEqual(["check_supplies", "order_supply"]);
    expect(res.text).toMatch(/hall cupboard/);
    expect(res.cards.some((c) => c.kind === "order")).toBe(true);
  });

  it("shower dripping → ticket, then 'yes' books the plumber from the history", async () => {
    const first = await runAgent({ text: "The shower is dripping.", history: [] });
    expect(first.tools[0].name).toBe("report_issue");
    expect(first.text).toMatch(/ticket \d+/);
    const second = await runAgent({
      text: "Yes please, afternoon is fine.",
      history: [{ role: "guest", text: "The shower is dripping." }, { role: "alexa", text: first.text }],
    });
    expect(second.tools[0].name).toBe("schedule_repair");
    expect(second.cards[0]).toMatchObject({ kind: "repair" });
    const agenda = await runAgent({ text: "What's happening today?", history: [] });
    expect(agenda.tools[0].name).toBe("get_todays_agenda");
  });
});
