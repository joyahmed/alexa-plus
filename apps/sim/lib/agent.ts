import { GoogleGenAI, type Content, type FunctionDeclaration } from "@google/genai";
import { cardFromTool, connectHouse, type House } from "./mcp";
import type { AgentRequest, AgentResponse, Card, ToolTrace } from "./types";

// Three agents behind one function, tried in order: Groq (GROQ_API_KEY), then Gemini
// (GEMINI_API_KEY), then a scripted agent that walks the same MCP tools by keyword. Groq leads
// because Gemini's free tier is capped per DAY - the public demo spent it by evening and every
// answer fell to the script. All three reach the house through the MCP server and nothing else,
// and the drawer always names which one answered.

const SYSTEM = `You are Alexa+ in a short-term rental, speaking to the guest in the house. Be brief and warm - one or two spoken sentences. Use the house tools for anything about the house: how things work, what's in stock, problems, what's happening today. When a guest reports a problem, log it with report_issue, then offer to book the repair and call schedule_repair when they agree. When something has run out, check_supplies then order_supply, and tell them where the spare is. Never invent facts about the house; if the tools don't know, say so. Earlier turns in this conversation may carry an "Actions:" line listing tools already called and their results (ticket numbers, order numbers) - reuse those ids; never log the same issue or order the same item twice.`;

const MAX_STEPS = 6;

const toDeclarations = (house: House): FunctionDeclaration[] =>
  house.tools.map((t) => ({ name: t.name, description: t.description, parametersJsonSchema: t.inputSchema }));

const runGemini = async (req: AgentRequest, house: House, apiKey: string): Promise<Omit<AgentResponse, "agent">> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
  const contents: Content[] = [
    ...req.history.map((h) => ({
      role: h.role === "guest" ? "user" : "model",
      parts: [{ text: h.actions?.length ? `${h.text}\n(Actions: ${h.actions.join("; ")})` : h.text }],
    })),
    { role: "user", parts: [{ text: req.text }] },
  ];
  const tools: ToolTrace[] = [];
  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await ai.models.generateContent({
      model,
      contents,
      config: { systemInstruction: SYSTEM, tools: [{ functionDeclarations: toDeclarations(house) }] },
    });
    const calls = res.functionCalls ?? [];
    if (calls.length === 0) {
      return { text: res.text ?? "Sorry, I didn't catch that.", cards: cardsOf(tools), tools };
    }
    // Echo the model's own turn back verbatim: Gemini 3 signs function-call parts
    // (thoughtSignature) and rejects a rebuilt turn that lost them.
    const modelTurn = res.candidates?.[0]?.content;
    contents.push(modelTurn ?? { role: "model", parts: calls.map((fc) => ({ functionCall: fc })) });
    const responses = [];
    for (const fc of calls) {
      const trace = await house.call(fc.name ?? "", (fc.args ?? {}) as Record<string, unknown>);
      tools.push(trace);
      responses.push({ functionResponse: { name: fc.name, id: fc.id, response: trace.result as Record<string, unknown> } });
    }
    contents.push({ role: "user", parts: responses });
  }
  return { text: "I've done what I can for now.", cards: cardsOf(tools), tools };
};

// Groq speaks the OpenAI chat-completions shape, so this is a plain fetch rather than another
// SDK - one less dependency in a public repo, and the whole surface we need is tools + messages.
// It is tried BEFORE Gemini because Gemini's free tier is capped per DAY, not per minute: the
// public demo exhausted it by evening and every answer fell to the script, which is what this
// exists to stop.
type GroqToolCall = { id: string; function: { name: string; arguments: string } };
type GroqMessage = { role: string; content?: string | null; tool_calls?: GroqToolCall[]; tool_call_id?: string; name?: string };

const runGroq = async (req: AgentRequest, house: House, apiKey: string): Promise<Omit<AgentResponse, "agent">> => {
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
  const messages: GroqMessage[] = [
    { role: "system", content: SYSTEM },
    ...req.history.map((h) => ({
      role: h.role === "guest" ? "user" : "assistant",
      content: h.actions?.length ? `${h.text}\n(Actions: ${h.actions.join("; ")})` : h.text,
    })),
    { role: "user", content: req.text },
  ];
  const tools = house.tools.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.inputSchema },
  }));
  const traces: ToolTrace[] = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, messages, tools, tool_choice: "auto", temperature: 0.3 }),
    });
    if (!res.ok) throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const msg = (await res.json()).choices?.[0]?.message as GroqMessage | undefined;
    const calls = msg?.tool_calls ?? [];
    if (!calls.length) {
      return { text: msg?.content?.trim() || "Sorry, I didn't catch that.", cards: cardsOf(traces), tools: traces };
    }
    messages.push(msg as GroqMessage);
    for (const c of calls) {
      // A model may emit malformed JSON arguments; an empty object is better than a dead turn.
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(c.function.arguments || "{}"); } catch { /* keep {} */ }
      const trace = await house.call(c.function.name, args);
      traces.push(trace);
      messages.push({ role: "tool", tool_call_id: c.id, name: c.function.name, content: JSON.stringify(trace.result) });
    }
  }
  return { text: "I've done what I can for now.", cards: cardsOf(traces), tools: traces };
};

// The scripted agent: the three video interactions and a few obvious extras, by keyword.
const runScripted = async (req: AgentRequest, house: House): Promise<Omit<AgentResponse, "agent">> => {
  const q = req.text.toLowerCase();
  const tools: ToolTrace[] = [];
  const say = (text: string) => ({ text, cards: cardsOf(tools), tools });
  const last = (name: string) => tools.filter((t) => t.name === name).at(-1)?.result as Record<string, unknown> | undefined;

  if (/\b(yes|yeah|ok|okay|sure|please do|go ahead|book it)\b/.test(q)) {
    const prior = req.history.filter((h) => h.role === "alexa").at(-1)?.text ?? "";
    const m = prior.match(/ticket #?(\d+)/i);
    if (m) {
      tools.push(await house.call("schedule_repair", { ticket_id: Number(m[1]), preference: /morning/.test(q) ? "morning" : "afternoon" }));
      return say(String(last("schedule_repair")?.text));
    }
  }
  if (/\b(out|run out|ran out|empty|no more|low on)\b/.test(q)) {
    // Whatever this house stocks: the item whose name shares a word with what the guest said.
    tools.push(await house.call("check_supplies", {}));
    const stocked = (last("check_supplies")?.supplies ?? []) as { item: string }[];
    const said = q.split(/\W+/).filter((w) => w.length > 3);
    const item = stocked.find((s) => s.item.split(/\s+/).some((w) => w.length > 2 && q.includes(w.replace(/s$/, ""))) || said.some((w) => s.item.includes(w)))?.item;
    if (item) {
      tools.push(await house.call("order_supply", { item }));
      return say(String(last("order_supply")?.text));
    }
  }
  if (/\b(leak|drip|broken|not working|doesn't work|no hot water|cold|smell|spark|flicker|stuck|blocked)/.test(q)) {
    const category = /shower|tap|sink|toilet|leak|drip|water/.test(q) ? "plumbing" : /light|socket|spark|power|flicker/.test(q) ? "electrical" : /heat|cold|radiator|thermostat/.test(q) ? "heating" : /oven|fridge|washer|dishwasher|machine/.test(q) ? "appliance" : "other";
    tools.push(await house.call("report_issue", { category, description: req.text, urgency: /spark|flood|gas|smell/.test(q) ? "urgent" : "normal" }));
    const r = last("report_issue")!;
    return say(`Sorry about that. I've logged it as ticket ${r.ticketId} and told the host. Shall I book the ${category === "plumbing" ? "plumber" : "repair"} for tomorrow afternoon?`);
  }
  if (/\b(today|tomorrow|happening|agenda|coming|schedule|plan)\b/.test(q)) {
    tools.push(await house.call("get_todays_agenda", {}));
    return say(String(last("get_todays_agenda")?.text));
  }
  if (/\b(who|checkout|check out|check-out|when do (we|i) leave|booking)\b/.test(q)) {
    tools.push(await house.call("get_current_stay", {}));
    return say(String(last("get_current_stay")?.text));
  }
  if (/\b(host|briefing|what happened|summary)\b/.test(q)) {
    tools.push(await house.call("host_briefing", {}));
    return say(String(last("host_briefing")?.text));
  }
  tools.push(await house.call("get_property_guide", { question: req.text }));
  return say(String(last("get_property_guide")?.text));
};

const cardsOf = (tools: ToolTrace[]): Card[] => tools.map(cardFromTool).filter((c): c is Card => c !== null);

export const runAgent = async (req: AgentRequest): Promise<AgentResponse> => {
  const house = await connectHouse(req.house);
  try {
    // Three tiers, cheapest failure first: Groq, then Gemini, then the script. Each step down
    // is announced in the drawer rather than hidden, and the guest still gets an answer walking
    // the same MCP tools either way.
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && process.env.AGENT !== "scripted" && process.env.AGENT !== "gemini") {
      try {
        return { ...(await runGroq(req, house, groqKey)), agent: "groq" };
      } catch (err) {
        console.warn("groq failed, trying gemini:", err instanceof Error ? err.message : String(err));
      }
    }
    const key = process.env.GEMINI_API_KEY;
    if (key && process.env.AGENT !== "scripted") {
      try {
        return { ...(await runGemini(req, house, key)), agent: "gemini" };
      } catch (err) {
        // Free-tier quota (429), a dead key or a model rename must never break the demo:
        // degrade to the scripted agent and say why in the drawer.
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("gemini failed, falling back to scripted:", msg);
        const quota = /RESOURCE_EXHAUSTED|429/.test(msg);
        // Google says how long: "retryDelay":"20s" / "Please retry in 20.6s".
        const retry = msg.match(/retryDelay"?:?\s*"?(\d+(?:\.\d+)?)s/)?.[1] ?? msg.match(/retry in (\d+(?:\.\d+)?)s/)?.[1];
        const cooldownSec = quota ? Math.ceil(Number(retry ?? 20)) : undefined;
        return {
          ...(await runScripted(req, house)),
          agent: "scripted",
          note: quota ? "Gemini free tier: 5 requests/min" : "Gemini error",
          cooldownSec,
        };
      }
    }
    return { ...(await runScripted(req, house)), agent: "scripted" };
  } finally {
    await house.close();
  }
};
