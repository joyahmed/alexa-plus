import type { Turn } from "@/lib/types";
import type { AlexaSession } from "@/hooks/use-alexa-session";
import MediaCard from "./MediaCard";

type TranscriptProps = { turns: Turn[]; status: AlexaSession["status"]; onHome: () => void };

// What the Echo Show does when it answers: the guest's words small at the top, Alexa's reply
// large on the left, the card on the right — the real device's text-plus-media layout. Older
// exchanges recede into a quiet list above. Bottom padding clears the floating composer.
const Transcript = ({ turns, status, onHome }: TranscriptProps) => {
  const latest = turns.at(-1);
  const older = turns.slice(0, -1).slice(-4);
  const cards = latest?.cards ?? [];
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden p-[5%] pb-[13%]">
      <button type="button" onClick={onHome} aria-label="Home" className="absolute right-[4%] top-[5%] rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-2 backdrop-blur hover:bg-white">
        ⌂ Home
      </button>
      <ol className="flex flex-col gap-1 pr-24 text-ink-2">
        {older.map((t) => (
          <li key={t.id} className={`truncate text-[clamp(.75rem,1.2vw,.95rem)] ${t.role === "guest" ? "font-semibold" : ""}`}>
            {t.role === "guest" ? `“${t.text}”` : t.text}
          </li>
        ))}
      </ol>
      {latest && (
        <section key={latest.id} className={`rise mt-auto grid items-end gap-[4%] pt-4 ${cards.length ? "grid-cols-[1.1fr_1fr]" : ""}`}>
          {latest.role === "guest" ? (
            <p className="text-[clamp(1.3rem,2.8vw,2.3rem)] font-bold leading-tight">“{latest.text}”</p>
          ) : (
            <div>
              <p className="text-[clamp(1.1rem,2.4vw,2rem)] font-semibold leading-snug">{latest.text}</p>
              {status === "thinking" && <p className="mt-2 text-[clamp(.8rem,1.3vw,1rem)] text-ink-2">Asking the house…</p>}
            </div>
          )}
          {cards.length > 0 && (
            <div className="flex flex-col gap-3">
              {cards.map((c, i) => <MediaCard key={`${latest.id}-${i}`} card={c} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Transcript;
