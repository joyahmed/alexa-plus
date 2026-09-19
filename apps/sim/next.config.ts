import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The verification build writes to .next-verify so a running `next dev` is never clobbered.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
};

export default nextConfig;
