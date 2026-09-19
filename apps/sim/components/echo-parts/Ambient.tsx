import { useClock } from "@/hooks/use-clock";

const HINTS = [
  "Alexa, how do I turn on the hot tub?",
  "Alexa, the coffee pods are out.",
  "Alexa, the shower is dripping.",
  "Alexa, what's happening today?",
];

type AmbientProps = { onPick: (text: string) => void };

// The Echo Show home screen: clock, the house, one rotating "Try…" hint, and tappable prompts.
const Ambient = ({ onPick }: AmbientProps) => {
  const { time, date } = useClock();
  return (
    <div className="rise flex flex-1 flex-col justify-between p-[5%] pb-[14%]">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[clamp(2.6rem,7vw,5.5rem)] font-extrabold leading-none tracking-tight tabular-nums">{time || " "}</p>
          <p className="mt-2 text-[clamp(.9rem,1.6vw,1.2rem)] font-medium text-ink-2">{date || " "}</p>
        </div>
        <div className="text-right">
          <p className="text-[clamp(1rem,1.8vw,1.35rem)] font-bold">Lakeview Cabin</p>
          <p className="text-[clamp(.8rem,1.3vw,1rem)] text-ink-2">Guest mode · checkout Tue 11 am</p>
        </div>
      </header>
      <div>
        <p className="hint text-[clamp(1.1rem,2.4vw,1.9rem)] font-semibold" key={HINTS[0]}>“{HINTS[0]}”</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {HINTS.slice(1).map((h) => (
            <li key={h}>
              <button type="button" onClick={() => onPick(h.replace(/^Alexa, /, ""))} className="rounded-full border border-line bg-white/60 px-4 py-2 text-[clamp(.8rem,1.3vw,1rem)] font-medium backdrop-blur hover:bg-white">
                {h}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Ambient;
