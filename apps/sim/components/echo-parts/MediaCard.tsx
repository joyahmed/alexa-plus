import type { Card } from "@/lib/types";

const LABEL: Record<Card["kind"], string> = { guide: "House guide", order: "Ordered", repair: "Booked", agenda: "Today", info: "For the host" };

// The card Alexa+ slides onto the screen next to what it says: the host's picture, an order, a booking.
const MediaCard = ({ card }: { card: Card }) => (
  <article className="w-full overflow-hidden rounded-2xl bg-white/85 shadow-[0_10px_30px_-12px_rgba(0,0,0,.35)] backdrop-blur">
    {card.imageUrl && (
      // eslint-disable-next-line @next/next/no-img-element -- demo images from /public
      <img src={card.imageUrl} alt={card.title} className="aspect-[16/9] w-full object-cover" />
    )}
    <div className="px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[.12em] text-ink-2">{LABEL[card.kind]}</p>
      <h3 className="mt-0.5 text-base font-bold capitalize">{card.title}</h3>
      {card.body && <p className="mt-1 text-sm text-ink-2">{card.body}</p>}
    </div>
  </article>
);

export default MediaCard;
