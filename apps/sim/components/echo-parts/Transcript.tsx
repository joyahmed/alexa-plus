import type { Turn } from "@/lib/types";
import type { AlexaSession } from "@/hooks/use-alexa-session";
import MediaCard from "./MediaCard";

type TranscriptProps = { turns: Turn[]; status: AlexaSession["status"] };

// What the Echo Show does when it answers: the guest's words small at the top, Alexa's reply
// large, cards beneath. Only the latest exchange is big; older ones recede above it.
const Transcript = ({ turns, status }: TranscriptProps) => {
  const latest = turns.at(-1);
  const older = turns.slice(0, -1);
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-[5%] pb-[14%]">
      <ol className="flex flex-col gap-2 text-ink-2">
        {older.map((t) => (
          <li key={t.id} className={`text-[clamp(.8rem,1.3vw,1rem)] ${t.role === "guest" ? "font-semibold" : ""}`}>
            {t.role === "guest" ? `“${t.text}”` : t.text}
          </li>
        ))}
      </ol>
      {latest && (
        <section key={latest.id} className="rise mt-auto flex flex-col gap-4 pt-6">
          {latest.role === "guest" ? (
            <p className="text-[clamp(1.4rem,3vw,2.4rem)] font-bold leading-tight">“{latest.text}”</p>
          ) : (
            <p className="max-w-[26ch] text-[clamp(1.3rem,2.7vw,2.2rem)] font-semibold leading-snug">{latest.text}</p>
          )}
          {latest.cards && latest.cards.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-1">
              {latest.cards.map((c, i) => <MediaCard key={`${latest.id}-${i}`} card={c} />)}
            </div>
          )}
          {status === "thinking" && <p className="text-[clamp(.8rem,1.3vw,1rem)] text-ink-2">Asking the house…</p>}
        </section>
      )}
    </div>
  );
};

export default Transcript;
