import { ReplayMcpLabApp } from "@replayio/mcp-lab-core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LabRoute,
});

function LabRoute() {
  return (
    <ReplayMcpLabApp
      basePath={import.meta.env.BASE_URL}
      framework="tanstack-start"
      initialScenarioId="happy-path"
    />
  );
}
