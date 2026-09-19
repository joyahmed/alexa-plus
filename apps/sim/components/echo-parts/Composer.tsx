import type { AlexaSession } from "@/hooks/use-alexa-session";

type ComposerProps = Pick<AlexaSession, "draft" | "setDraft" | "submitDraft" | "listen" | "canListen" | "status">;

// The mic (Web Speech API) and a typed fallback, floating over the bottom of the screen like a
// touch target on the real device.
const Composer = ({ draft, setDraft, submitDraft, listen, canListen, status }: ComposerProps) => (
  <form
    className="absolute inset-x-0 bottom-5 flex justify-center px-[5%]"
    onSubmit={(e) => { e.preventDefault(); submitDraft(); }}
  >
    <div className="flex w-full max-w-[640px] items-center gap-2 rounded-full bg-white/80 p-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,.4)] backdrop-blur">
      <button
        type="button"
        onClick={listen}
        disabled={!canListen || status !== "idle"}
        aria-label="Talk to Alexa"
        className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white disabled:opacity-30"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" /></svg>
      </button>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={canListen ? "Say it, or type it" : "Type to the house"}
        className="min-w-0 flex-1 bg-transparent px-2 text-[15px] outline-none placeholder:text-ink-2"
      />
      <button type="submit" disabled={status !== "idle" || !draft.trim()} className="rounded-full bg-ink/90 px-4 py-2 text-sm font-semibold text-white disabled:opacity-30">Ask</button>
    </div>
  </form>
);

export default Composer;
