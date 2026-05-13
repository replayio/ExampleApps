"use client";

import { ReplayMcpLabApp } from "@replayio/mcp-lab-core";

export function LabClient({ initialScenarioId }: { initialScenarioId: string }) {
  return <ReplayMcpLabApp framework="next" initialScenarioId={initialScenarioId} />;
}
