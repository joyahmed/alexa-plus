import { GoogleGenAI, type Content, type FunctionDeclaration } from "@google/genai";
import { cardFromTool, connectHouse, type House } from "./mcp";
import type { AgentRequest, AgentResponse, Card, ToolTrace } from "./types";

// Two agents behind one function. Gemini (free tier, function calling) when GEMINI_API_KEY is
// set; otherwise a scripted agent that walks the same MCP tools by keyword, so the demo never
// depends on a model being reachable. Both go through the MCP server and nothing else.

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
    const item = /coffee|pod/.test(q) ? "coffee pods" : /toilet|paper/.test(q) ? "toilet paper" : /dishwasher|tablet/.test(q) ? "dishwasher tablets" : /wood|fire/.test(q) ? "firewood" : null;
    if (item) {
      tools.push(await house.call("check_supplies", { item }));
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
  const house = await connectHouse();
  try {
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
