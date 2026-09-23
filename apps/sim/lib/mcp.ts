import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { Card, ToolTrace } from "./types";

// The ONLY way the sim reaches the house: the MCP server over Streamable HTTP. It never touches
// SQLite or the tools' code directly — that is the runtime-hook rule for the hackathon.

export const connectHouse = async (house?: string) => {
  const MCP_URL = process.env.MCP_URL ?? "http://localhost:3101/mcp";
  const MCP_TOKEN = process.env.MCP_TOKEN ?? "demo";
  const url = new URL(MCP_URL);
  if (house) url.searchParams.set("property", house);
  const client = new Client({ name: "alexa-plus-sim", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(url, {
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

// ---- idle header ------------------------------------------------------------------------
// The Echo Show's idle screen names the unit it is pointed at. That name is the house's, so it
// comes over MCP like everything else — never a constant in the sim (it used to be, and every
// `?house=` showed "Lakeview Cabin").
export type HouseHeader = { name: string; checkout: string | null };

const spokenCheckout = (date: string, time: string) => {
  const day = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${day} ${hour}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "pm" : "am"}`;
};

export const readHouseHeader = async (house?: string): Promise<HouseHeader | null> => {
  const MCP_URL = process.env.MCP_URL ?? "http://localhost:3101/mcp";
  const MCP_TOKEN = process.env.MCP_TOKEN ?? "demo";
  const url = new URL(MCP_URL);
  if (house) url.searchParams.set("property", house);
  const client = new Client({ name: "alexa-plus-sim", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: { headers: { authorization: `Bearer ${MCP_TOKEN}` } },
  });
  try {
    await client.connect(transport);
    const res = await client.readResource({ uri: "stay://current" });
    const text = (res.contents as { text?: string }[])[0]?.text ?? "{}";
    const { stay, property } = JSON.parse(text) as {
      stay: { check_out: string } | null;
      property: { id: string; name: string; checkoutTime: string } | null;
    };
    if (!property) return null;
    return { name: property.name, checkout: stay ? spokenCheckout(stay.check_out, property.checkoutTime) : null };
  } catch {
    // An unreachable house must not print a wrong name — the header just goes quiet.
    return null;
  } finally {
    await client.close().catch(() => {});
  }
};
