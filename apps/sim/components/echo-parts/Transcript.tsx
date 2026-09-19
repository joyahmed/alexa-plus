import type { Turn } from "@/lib/types";
import MediaCard from "./MediaCard";

const PROMPTS = [
  "How do I turn on the hot tub?",
  "The coffee pods are out.",
  "The shower is dripping.",
  "What's happening today?",
];

// Guest bubbles right, Alexa left, cards under Alexa's line. Empty state shows the three prompts.
const Transcript = ({ turns }: { turns: Turn[] }) => (
  <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
    {turns.length === 0 && (
      <div className="my-auto text-center">
        <p className="text-2xl font-medium">Hi, I&apos;m the house.</p>
        <p className="mt-1 text-sm text-echo-muted">Try one of these, or press the mic.</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {PROMPTS.map((p) => (
            <li key={p} className="rounded-full border border-white/10 px-3 py-1 text-sm text-echo-muted">“{p}”</li>
          ))}
        </ul>
      </div>
    )}
    {turns.map((t) => (
      <div key={t.id} className={`flex flex-col gap-2 ${t.role === "guest" ? "items-end" : "items-start"}`}>
        <p className={`max-w-[85%] rounded-2xl px-4 py-2 text-[15px] leading-snug ${t.role === "guest" ? "bg-white/10" : "bg-echo-panel"}`}>{t.text}</p>
        {t.cards?.map((c, i) => <MediaCard key={`${t.id}-${i}`} card={c} />)}
      </div>
    ))}
  </div>
);

export default Transcript;
