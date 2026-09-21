import EchoClient from "@/components/EchoClient";

// Server page: nothing to fetch — the house is reached per turn through /api/agent.
// `?house=harbor` points this Echo at another of the host's properties (server default otherwise).
const Page = async ({ searchParams }: { searchParams: Promise<{ house?: string }> }) => {
  const { house } = await searchParams;
  return <EchoClient house={/^[a-z0-9-]{1,32}$/.test(house ?? "") ? house : undefined} />;
};

export default Page;
