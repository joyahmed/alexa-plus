import EchoClient from "@/components/EchoClient";
import { readHouseHeader, type HouseHeader } from "@/lib/mcp";

// Server page: the only thing fetched here is the idle header — which unit this Echo is pointed
// at — because the screen says it before the guest has said anything. Everything else is per turn
// through /api/agent. `?house=harbor` points this Echo at another of the host's properties.
const Page = async ({ searchParams }: { searchParams: Promise<{ house?: string }> }) => {
  const { house } = await searchParams;
  const id = /^[a-z0-9-]{1,32}$/.test(house ?? "") ? house : undefined;
  const header: HouseHeader | null = await readHouseHeader(id);
  return <EchoClient house={id} header={header} />;
};

export default Page;
