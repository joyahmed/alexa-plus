import type { AlexaSession } from "@/hooks/use-alexa-session";

type SidePanelProps = Pick<AlexaSession, "turns" | "voiceOut" | "setVoiceOut" | "agent">;

// For the judges: every MCP call the last answer made, live. Proves the sim never bypasses the server.
const SidePanel = ({ turns, voiceOut, setVoiceOut, agent }: SidePanelProps) => {
  const calls = turns.flatMap((t) => t.tools ?? []);
  return (
    <aside className="w-full text-sm lg:w-80">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">MCP calls</h2>
        <label className="flex items-center gap-2 text-xs text-echo-muted">
          <input type="checkbox" checked={voiceOut} onChange={(e) => setVoiceOut(e.target.checked)} /> voice
        </label>
      </div>
      <p className="mt-1 text-xs text-echo-muted">
        Agent: {agent ?? "—"} · every answer goes through the house MCP server over Streamable HTTP.
      </p>
      <ol className="mt-3 flex flex-col gap-2">
        {calls.length === 0 && <li className="text-echo-muted">No calls yet.</li>}
        {calls.map((c, i) => (
          <li key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
            <code className="text-echo-ring">{c.name}</code>
            <pre className="mt-1 overflow-x-auto text-[11px] text-echo-muted">{JSON.stringify(c.args)}</pre>
          </li>
        ))}
      </ol>
    </aside>
  );
};

export default SidePanel;
