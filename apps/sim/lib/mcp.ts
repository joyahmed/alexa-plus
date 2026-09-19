import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { Card, ToolTrace } from "./types";

// The ONLY way the sim reaches the house: the MCP server over Streamable HTTP. It never touches
// SQLite or the tools' code directly — that is the runtime-hook rule for the hackathon.

export const connectHouse = async () => {
  const MCP_URL = process.env.MCP_URL ?? "http://localhost:3101/mcp";
  const MCP_TOKEN = process.env.MCP_TOKEN ?? "demo";
  const client = new Client({ name: "alexa-plus-sim", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { authorization: `Bearer ${MCP_TOKEN}` } },
  });
  await client.connect(transport);
  const { tools } = await client.listTools();
  const call = async (name: string, args: Record<string, unknown>): Promise<ToolTrace> => {
    const res = await client.callTool({ name, arguments: args });
    const text = (res.content as { type: string; text?: string }[]).find((c) => c.type === "text")?.text ?? "";
    return { name, args, result: { text, ...(res.structuredContent as Record<string, unknown> | undefined) } };
  };
  return { tools: tools as Tool[], call, close: () => client.close() };
};

export type House = Awaited<ReturnType<typeof connectHouse>>;

// A tool result becomes an Echo Show card when it carries something worth looking at.
export const cardFromTool = ({ name, result }: ToolTrace): Card | null => {
  const r = result as Record<string, unknown>;
  switch (name) {
    case "get_property_guide":
      // The bubble already speaks the answer; the card is the picture and a one-line caption.
      return r.found ? { kind: "guide", title: String(r.topic), body: r.imageUrl ? "" : String(r.answer), imageUrl: (r.imageUrl as string | null) ?? null } : null;
    case "order_supply":
      return r.ok ? { kind: "order", title: `Order #${r.orderId} · ${String(r.item)}`, body: `${r.quantity} × ${String(r.sku)} · arrives ${String(r.etaSpoken ?? r.eta)}` } : null;
    case "schedule_repair":
      return r.ok
        ? { kind: "repair", title: `Ticket #${r.ticketId} booked`, body: `${(r.vendor as { name: string }).name} · ${String(r.scheduledSpoken ?? r.scheduledAt)}` }
        : null;
    case "get_todays_agenda":
      return { kind: "agenda", title: "Today and tomorrow", body: String(r.text) };
    case "host_briefing":
      return { kind: "info", title: "Host briefing", body: String(r.text) };
    default:
      return null;
  }
};
