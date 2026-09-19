#!/usr/bin/env node
// Minimal MCP client for agents that cannot speak MCP natively. Streamable HTTP, JSON responses.
//   node house.mjs tools
//   node house.mjs call <tool> '<json args>'
//   node house.mjs read <uri>
const url = process.env.MCP_URL ?? "http://localhost:3101/mcp";
const token = process.env.MCP_TOKEN ?? "demo";
let id = 0;
const rpc = async (method, params = {}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: `Bearer ${token}`, "mcp-protocol-version": "2025-11-25" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const body = await res.json();
  if (body.error) throw new Error(body.error.message);
  return body.result;
};
const [cmd, a, b] = process.argv.slice(2);
await rpc("initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "house.mjs", version: "0.1.0" } });
const out =
  cmd === "tools" ? (await rpc("tools/list")).tools.map((t) => `${t.name} — ${t.description}`).join("\n")
  : cmd === "call" ? JSON.stringify(await rpc("tools/call", { name: a, arguments: b ? JSON.parse(b) : {} }), null, 2)
  : cmd === "read" ? JSON.stringify(await rpc("resources/read", { uri: a }), null, 2)
  : "usage: house.mjs tools | call <tool> '<json>' | read <uri>";
console.log(out);
