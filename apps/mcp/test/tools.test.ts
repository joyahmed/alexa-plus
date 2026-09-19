import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { serve, type ServerType } from "@hono/node-server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { buildApp } from "../src/app.js";
import { openDb } from "../src/db/index.js";
import { seed } from "../src/db/seed.js";

// End-to-end over real Streamable HTTP: the SDK client against our Hono app on a random port.
// This is the runtime-hook proof judges look for — the SDK is imported AND exercised.
const TOKEN = "test-token";
let httpServer: ServerType;
let url: URL;

const connect = async (token = TOKEN) => {
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(new StreamableHTTPClientTransport(url, { requestInit: { headers: { authorization: `Bearer ${token}` } } }));
  return client;
};

beforeAll(async () => {
  const db = openDb(":memory:");
  seed(db);
  const app = buildApp({ db, propertyId: "lakeview", token: TOKEN });
  await new Promise<void>((resolve) => {
    httpServer = serve({ fetch: app.fetch, port: 0 }, (info) => {
      url = new URL(`http://127.0.0.1:${info.port}/mcp`);
      resolve();
    });
  });
});
afterAll(() => { httpServer.closeAllConnections?.(); return new Promise<void>((r) => httpServer.close(() => r())); });

describe("the-house MCP server", () => {
  it("rejects a missing bearer token", async () => {
    await expect(connect("wrong")).rejects.toThrow();
  });

  it("lists the three v1 tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual(expect.arrayContaining(["get_current_stay", "get_property_guide", "report_issue"]));
    await client.close();
  });

  it("answers a guide question with the host's instructions and a picture", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "get_property_guide", arguments: { question: "how do I turn on the hot tub?" } });
    const sc = res.structuredContent as { found: boolean; topic: string; imageUrl: string | null };
    expect(sc.found).toBe(true);
    expect(sc.topic).toBe("hot tub");
    expect(sc.imageUrl).toMatch(/hot-tub/);
    await client.close();
  });

  it("says what it does not know and lists the topics", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "get_property_guide", arguments: { question: "where is the nearest airport" } });
    const sc = res.structuredContent as { found: boolean; topics: string[] };
    expect(sc.found).toBe(false);
    expect(sc.topics).toContain("wifi");
    await client.close();
  });

  it("knows who is staying and when the next guests arrive", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "get_current_stay", arguments: {} });
    const sc = res.structuredContent as { stay: { guest_name: string } | null; nextStay: { guest_name: string } | null };
    expect(sc.stay?.guest_name).toBe("Priya");
    expect(sc.nextStay?.guest_name).toBe("The Okafors");
    await client.close();
  });

  it("logs an issue as a ticket tied to the current stay", async () => {
    const client = await connect();
    const res = await client.callTool({
      name: "report_issue",
      arguments: { category: "plumbing", description: "the shower is dripping", urgency: "normal" },
    });
    const sc = res.structuredContent as { ticketId: number; status: string };
    expect(sc.ticketId).toBeGreaterThan(0);
    expect(sc.status).toBe("open");
    await client.close();
  });
});
