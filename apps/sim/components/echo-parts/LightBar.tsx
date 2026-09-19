import type { AlexaSession } from "@/hooks/use-alexa-session";

const LABEL: Record<AlexaSession["status"], string> = {
  idle: "", listening: "Listening…", thinking: "Asking the house…", speaking: "",
};

// The cyan light bar every Echo has: solid when listening, breathing when thinking.
const LightBar = ({ status }: { status: AlexaSession["status"] }) => (
  <div className="px-6">
    <div
      className={`h-1 rounded-full bg-echo-ring transition-opacity ${status === "idle" ? "opacity-15" : "opacity-100"} ${status === "thinking" ? "bar-thinking" : ""}`}
    />
    <p className="mt-2 h-4 text-xs text-echo-muted">{LABEL[status]}</p>
  </div>
);

export default LightBar;
