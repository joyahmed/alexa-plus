import type { AlexaSession } from "@/hooks/use-alexa-session";

// The Alexa+ light bar along the bottom edge of the screen: faint at rest, breathing when
// listening, flowing while it thinks or speaks.
const LightBar = ({ status }: { status: AlexaSession["status"] }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2">
    <div data-status={status} className={`lightbar h-1.5 w-[40%] rounded-full transition-opacity ${status === "idle" ? "opacity-30" : "opacity-100"}`} />
  </div>
);

export default LightBar;
