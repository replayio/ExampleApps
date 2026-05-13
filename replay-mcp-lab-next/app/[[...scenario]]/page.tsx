import { LabClient } from "../lab-client";

export default async function Page({
  params,
}: {
  params: Promise<{ scenario?: string[] }>;
}) {
  const { scenario = [] } = await params;
  return <LabClient initialScenarioId={scenario[0] ?? "happy-path"} />;
}
