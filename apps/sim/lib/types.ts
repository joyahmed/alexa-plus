// Shared shapes between the agent route and the Echo UI.

export type Card = {
  title: string;
  body: string;
  imageUrl?: string | null;
  kind: "guide" | "order" | "repair" | "agenda" | "info";
};

export type ToolTrace = { name: string; args: Record<string, unknown>; result: unknown };

export type Turn = {
  id: string;
  role: "guest" | "alexa";
  text: string;
  cards?: Card[];
  tools?: ToolTrace[];
  at: number;
};

export type HistoryTurn = Pick<Turn, "role" | "text"> & { actions?: string[] };
// `house` picks the property on a multi-house server (`/mcp?property=`); empty = the server default.
export type AgentRequest = { text: string; history: HistoryTurn[]; house?: string };
export type AgentResponse = { text: string; cards: Card[]; tools: ToolTrace[]; agent: "gemini" | "scripted"; note?: string; cooldownSec?: number };
