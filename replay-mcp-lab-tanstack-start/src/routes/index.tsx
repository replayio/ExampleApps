import { ReplayMcpLabApp } from "@replayio/mcp-lab-core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LabRoute,
});

function LabRoute() {
  return <ReplayMcpLabApp framework="tanstack-start" initialScenarioId="happy-path" />;
}
