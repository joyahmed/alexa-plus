import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "The house that explains itself — Alexa+ simulation",
  description: "A simulated Alexa+ Echo Show driving the house MCP server.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={manrope.variable}>
    <body className="min-h-full font-sans antialiased">{children}</body>
  </html>
);

export default RootLayout;
