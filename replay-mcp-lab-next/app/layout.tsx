import type { Metadata } from "next";
import "@replayio/mcp-lab-core/styles.css";

export const metadata: Metadata = {
  title: "Replay MCP Lab Next.js",
  description: "Replay MCP lab scenarios mounted in a Next.js App Router shell.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
