import { ReplayMcpLabApp } from "@replayio/mcp-lab-core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$scenario")({
  component: LabRoute,
});

function LabRoute() {
  const { scenario } = Route.useParams();
  return <ReplayMcpLabApp framework="tanstack-start" initialScenarioId={scenario} />;
}
