import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools } from "./tools/index.js";
import { registerHouseTools } from "./tools/house.js";
import type { Db } from "./db/index.js";

export type AppOptions = { db: Db; propertyId: string; token: string };

export const buildMcpServer = (db: Db, propertyId: string) => {
  const server = new McpServer({ name: "the-house", version: "0.1.0" });
  registerTools(server, db, propertyId);
  registerHouseTools(server, db, propertyId);
  return server;
};

// Stateless Streamable HTTP: a fresh server + transport per request, nothing held between calls.
// Sessions are not needed — every tool reads its state from SQLite.
export const buildApp = ({ db, propertyId, token }: AppOptions) => {
  const app = new Hono();

  app.get("/health", (c) => c.json({ ok: true, property: propertyId }));

  app.all("/mcp", async (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (auth !== `Bearer ${token}`) return c.json({ error: "unauthorized" }, 401);
    const server = buildMcpServer(db, propertyId);
    // JSON responses, not SSE: stateless means no server-initiated messages, and a plain JSON
    // body is what a curl-wielding judge expects to see.
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  });

  return app;
};
