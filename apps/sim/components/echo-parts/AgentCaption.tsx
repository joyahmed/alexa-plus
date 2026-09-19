import { useCountdown } from "@/hooks/use-countdown";
import type { AlexaSession } from "@/hooks/use-alexa-session";

type AgentCaptionProps = Pick<AlexaSession, "agent" | "agentNote" | "cooldownUntil">;

// Under the answer: who answered. Silent while Gemini is answering; when the free tier is
// cooling down it says so, with the seconds left, and clears itself when Gemini is back.
const AgentCaption = ({ agent, agentNote, cooldownUntil }: AgentCaptionProps) => {
  const left = useCountdown(cooldownUntil);
  if (agent !== "scripted" || !agentNote) return null;
  return (
    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-[clamp(.7rem,1.1vw,.85rem)] font-medium text-amber-900">
      <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
      Answered from the house script · {agentNote}{left > 0 ? ` · Gemini back in ${left}s` : ""}
    </p>
  );
};

export default AgentCaption;
