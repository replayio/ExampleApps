import { ReplayMcpLabApp } from "@replayio/mcp-lab-core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$scenario")({
  component: LabRoute,
});

function LabRoute() {
  const { scenario } = Route.useParams();
  return (
    <ReplayMcpLabApp
      basePath={import.meta.env.BASE_URL}
      framework="tanstack-start"
      initialScenarioId={scenario}
    />
  );
}
