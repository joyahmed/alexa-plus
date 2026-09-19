"use client";

import { useAlexaSession } from "@/hooks/use-alexa-session";
import Device from "./echo-parts/Device";
import Ambient from "./echo-parts/Ambient";
import Transcript from "./echo-parts/Transcript";
import LightBar from "./echo-parts/LightBar";
import Composer from "./echo-parts/Composer";
import DevDrawer from "./echo-parts/DevDrawer";
import AboutDrawer from "./echo-parts/AboutDrawer";

// The room, the device on the counter, the screen. The screen shows the ambient home until the
// first word, then the conversation. Everything reactive lives in useAlexaSession.
const EchoClient = () => {
  const session = useAlexaSession();

  return (
    <main className="room relative min-h-screen overflow-hidden">
      <p className="pointer-events-none absolute inset-x-0 top-5 z-0 text-center text-xs font-semibold tracking-wide text-ink-2">
        The house that explains itself · Alexa+ as the resident agent of a rental · simulated Echo Show
      </p>
      <AboutDrawer />
      <Device>
        {session.turns.length === 0 ? <Ambient onPick={session.ask} /> : <Transcript {...session} onHome={session.home} />}
        <Composer {...session} />
        <LightBar status={session.status} />
      </Device>
      <DevDrawer {...session} />
    </main>
  );
};

export default EchoClient;
