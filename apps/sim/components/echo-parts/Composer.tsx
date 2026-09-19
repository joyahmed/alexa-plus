import type { AlexaSession } from "@/hooks/use-alexa-session";

type ComposerProps = Pick<AlexaSession, "draft" | "setDraft" | "submitDraft" | "listen" | "canListen" | "status">;

// Mic button (Web Speech API) plus a text fallback for browsers without it, and for the video.
const Composer = ({ draft, setDraft, submitDraft, listen, canListen, status }: ComposerProps) => (
  <form
    className="flex items-center gap-3 px-6 pb-6 pt-3"
    onSubmit={(e) => { e.preventDefault(); submitDraft(); }}
  >
    <button
      type="button"
      onClick={listen}
      disabled={!canListen || status !== "idle"}
      aria-label="Talk to Alexa"
      className={`grid size-12 shrink-0 place-items-center rounded-full bg-echo-ring/90 text-echo-bg disabled:opacity-40 ${status === "listening" ? "ring-listening" : ""}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" /></svg>
    </button>
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={canListen ? "…or type" : "Type to the house"}
      className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[15px] outline-none placeholder:text-echo-muted focus:border-echo-ring/60"
    />
    <button type="submit" disabled={status !== "idle" || !draft.trim()} className="rounded-full bg-white/10 px-4 py-2.5 text-sm disabled:opacity-40">Ask</button>
  </form>
);

export default Composer;
