"use client";

import { ReplayMcpLabApp } from "@replayio/mcp-lab-core";

export function LabClient({ initialScenarioId }: { initialScenarioId: string }) {
  return (
    <ReplayMcpLabApp
      basePath={process.env.NEXT_PUBLIC_BASE_PATH}
      framework="next"
      initialScenarioId={initialScenarioId}
    />
  );
}
