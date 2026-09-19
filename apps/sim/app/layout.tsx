import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The house that explains itself — Alexa+ simulation",
  description: "A simulated Alexa+ Echo Show driving the house MCP server.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className="min-h-full antialiased">{children}</body>
  </html>
);

export default RootLayout;
