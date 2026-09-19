import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "The house that explains itself — Alexa+ simulation",
  description: "Alexa+ as the resident agent of a short-term rental: a simulated Echo Show driving a self-hosted MCP server.",
  metadataBase: new URL("https://alexa.zettabyteincorp.com"),
  openGraph: {
    title: "The house that explains itself",
    description: "Alexa+ as the resident agent of a short-term rental. Ask the house how the hot tub works, tell it the coffee's out, report the dripping shower — it remembers tomorrow.",
    url: "https://alexa.zettabyteincorp.com",
    siteName: "The house that explains itself",
    type: "website",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={manrope.variable}>
    <body className="min-h-full font-sans antialiased">{children}</body>
  </html>
);

export default RootLayout;
