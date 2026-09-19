import type { Card } from "@/lib/types";

const ACCENT: Record<Card["kind"], string> = {
  guide: "border-echo-ring/40", order: "border-emerald-400/40", repair: "border-amber-400/40", agenda: "border-violet-400/40", info: "border-white/20",
};

// What Alexa+ shows on the screen while it talks: the host's photo and steps, an order, a booking.
const MediaCard = ({ card }: { card: Card }) => (
  <article className={`w-full max-w-[85%] overflow-hidden rounded-2xl border bg-echo-panel ${ACCENT[card.kind]}`}>
    {card.imageUrl && (
      // eslint-disable-next-line @next/next/no-img-element -- demo images from /public, no optimisation needed
      <img src={card.imageUrl} alt={card.title} className="aspect-[16/9] w-full object-cover" />
    )}
    <div className="px-4 py-3">
      <h3 className="text-sm font-semibold capitalize">{card.title}</h3>
      {card.body && <p className="mt-1 text-sm text-echo-muted">{card.body}</p>}
    </div>
  </article>
);

export default MediaCard;
