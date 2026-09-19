import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import type { AgentRequest } from "@/lib/types";

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  const body = (await req.json()) as Partial<AgentRequest>;
  if (!body.text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
  try {
    const res = await runAgent({ text: body.text, history: (body.history ?? []).slice(-10) });
    return NextResponse.json(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `The house isn't answering: ${message}` }, { status: 502 });
  }
};
