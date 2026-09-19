"use client";

import { useAlexaSession } from "@/hooks/use-alexa-session";
import EchoFrame from "./echo-parts/EchoFrame";
import Transcript from "./echo-parts/Transcript";
import LightBar from "./echo-parts/LightBar";
import Composer from "./echo-parts/Composer";
import SidePanel from "./echo-parts/SidePanel";

const EchoClient = () => {
  const session = useAlexaSession();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start">
      <EchoFrame status={session.status}>
        <Transcript turns={session.turns} />
        <LightBar status={session.status} />
        <Composer {...session} />
      </EchoFrame>
      <SidePanel {...session} />
    </main>
  );
};

export default EchoClient;
