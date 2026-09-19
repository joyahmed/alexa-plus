import { serve } from "@hono/node-server";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { buildApp } from "./app.js";
import { openDb } from "./db/index.js";
import { seed } from "./db/seed.js";

const port = Number(process.env.PORT ?? 3101);
const propertyId = process.env.PROPERTY_ID ?? "lakeview";
const token = process.env.MCP_TOKEN;
if (!token) {
  console.error("MCP_TOKEN is required (the bearer token Alexa+ / the sim presents)");
  process.exit(1);
}
const dbPath = process.env.DB_PATH ?? "data/house.sqlite";
mkdirSync(dirname(dbPath), { recursive: true });
const db = openDb(dbPath);
if (process.env.SEED === "1") seed(db);

serve({ fetch: buildApp({ db, propertyId, token }).fetch, port }, (info) => {
  console.log(`the-house MCP server on http://localhost:${info.port}/mcp (property ${propertyId})`);
});
