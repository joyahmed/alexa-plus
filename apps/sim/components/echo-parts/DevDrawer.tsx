import { useState } from "react";
import type { AlexaSession } from "@/hooks/use-alexa-session";

type DevDrawerProps = Pick<AlexaSession, "turns" | "voiceOut" | "setVoiceOut" | "agent">;

// For judges: a drawer listing every MCP call the answers made. Off-screen by default so the
// device is the only thing in the room; one tap to open. Its open/closed state is the only
// reactivity here, so it stays local.
const DevDrawer = ({ turns, voiceOut, setVoiceOut, agent }: DevDrawerProps) => {
  const [open, setOpen] = useState(false);
  const calls = turns.flatMap((t) => t.tools ?? []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed right-4 top-4 z-20 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-lg"
      >
        MCP calls · {calls.length}
      </button>
      <aside className={`fixed inset-y-0 right-0 z-10 w-[min(100%,380px)] overflow-y-auto bg-white/95 p-5 text-sm shadow-2xl backdrop-blur transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <h2 className="mt-10 text-base font-bold">Under the hood</h2>
        <p className="mt-1 text-ink-2">
          Agent: <b>{agent ?? "—"}</b>. Every answer goes through the house MCP server over Streamable HTTP
          (spec 2025-11-25); the sim never touches the data directly.
        </p>
        <label className="mt-3 flex items-center gap-2 text-ink-2">
          <input type="checkbox" checked={voiceOut} onChange={(e) => setVoiceOut(e.target.checked)} /> speak replies
        </label>
        <ol className="mt-4 flex flex-col gap-2">
          {calls.length === 0 && <li className="text-ink-2">No calls yet.</li>}
          {calls.map((c, i) => (
            <li key={i} className="rounded-xl border border-line bg-paper p-3">
              <code className="font-semibold text-alexa-2">{c.name}</code>
              <pre className="mt-1 overflow-x-auto text-[11px] text-ink-2">{JSON.stringify(c.args)}</pre>
            </li>
          ))}
        </ol>
      </aside>
    </>
  );
};

export default DevDrawer;
