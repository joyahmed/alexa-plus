import { useState } from "react";
import type { AlexaSession } from "@/hooks/use-alexa-session";

type DevDrawerProps = Pick<AlexaSession, "turns" | "voiceOut" | "setVoiceOut" | "agent" | "agentNote">;

// For judges: a drawer listing every MCP call the answers made. Off-screen by default so the
// device is the only thing in the room; one tap to open. Its open/closed state is the only
// reactivity here, so it stays local.
const DevDrawer = ({ turns, voiceOut, setVoiceOut, agent, agentNote }: DevDrawerProps) => {
  const [open, setOpen] = useState(false);
  const calls = turns.flatMap((t) => t.tools ?? []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="dev-drawer"
        className="fixed right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
      >
        {open ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          // A plug: the MCP connection.
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0V8ZM12 17v5" /></svg>
        )}
        {open ? "Close" : `MCP calls · ${calls.length}`}
      </button>
      <aside id="dev-drawer" className={`fixed inset-y-0 right-0 z-10 w-[min(100%,380px)] overflow-y-auto bg-white/95 p-5 text-sm shadow-2xl backdrop-blur transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <h2 className="mt-10 text-base font-bold">Under the hood</h2>
        <p className="mt-1 text-ink-2">
          Agent: <b>{agent ?? "—"}</b>{agentNote && <span className="text-amber-700"> ({agentNote})</span>}. Every answer goes through the house MCP server over Streamable HTTP
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
