"use client";

import { useAlexaSession } from "@/hooks/use-alexa-session";
import Device from "./echo-parts/Device";
import Ambient from "./echo-parts/Ambient";
import Transcript from "./echo-parts/Transcript";
import LightBar from "./echo-parts/LightBar";
import Composer from "./echo-parts/Composer";
import DevDrawer from "./echo-parts/DevDrawer";

// The room, the device on the counter, the screen. The screen shows the ambient home until the
// first word, then the conversation. Everything reactive lives in useAlexaSession.
const EchoClient = () => {
  const session = useAlexaSession();

  return (
    <main className="room relative min-h-screen overflow-hidden">
      <Device>
        {session.turns.length === 0 ? <Ambient onPick={session.ask} /> : <Transcript turns={session.turns} status={session.status} />}
        <Composer {...session} />
        <LightBar status={session.status} />
      </Device>
      <DevDrawer {...session} />
    </main>
  );
};

export default EchoClient;
