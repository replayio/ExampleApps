import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReplayMcpLabApp } from "@replayio/mcp-lab-core";
import "@replayio/mcp-lab-core/styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing root element");
}

createRoot(root).render(
  <StrictMode>
    <ReplayMcpLabApp basePath={import.meta.env.BASE_URL} framework="vite" />
  </StrictMode>
);
