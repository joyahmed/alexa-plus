import type { AlexaSession } from "@/hooks/use-alexa-session";

type EchoFrameProps = { status: AlexaSession["status"]; children: React.ReactNode };

// The bezel of an Echo Show: a 16:10 dark slab with a soft edge. Purely decorative.
const EchoFrame = ({ status, children }: EchoFrameProps) => (
  <section
    aria-label="Echo Show"
    className="relative flex w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-echo-bg shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] lg:w-[720px] lg:min-h-[520px]"
    data-status={status}
  >
    <header className="flex items-center justify-between px-6 pt-5 text-xs text-echo-muted">
      <span>Lakeview Cabin</span>
      <span className="rounded-full bg-white/5 px-2 py-0.5">Alexa+ · simulated</span>
    </header>
    {children}
  </section>
);

export default EchoFrame;
