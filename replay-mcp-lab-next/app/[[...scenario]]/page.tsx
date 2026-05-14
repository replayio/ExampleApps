import { LabClient } from "../lab-client";
import { labScenarios } from "@replayio/mcp-lab-core/metadata";

export function generateStaticParams() {
  return [
    { scenario: [] },
    ...labScenarios.map(scenario => ({ scenario: [scenario.id] })),
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ scenario?: string[] }>;
}) {
  const { scenario = [] } = await params;
  return <LabClient initialScenarioId={scenario[0] ?? "happy-path"} />;
}
