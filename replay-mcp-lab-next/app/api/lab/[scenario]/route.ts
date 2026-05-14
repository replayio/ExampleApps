import { createLabApiResponse } from "@replayio/mcp-lab-core/api";
import { labScenarios } from "@replayio/mcp-lab-core/metadata";

export const dynamic = "force-static";

export function generateStaticParams() {
  return labScenarios.map(scenario => ({ scenario: scenario.id }));
}

export async function GET(
  request: Request,
  context: { params: Promise<{ scenario: string }> }
) {
  const { scenario } = await context.params;
  return createLabApiResponse(scenario, request.url);
}
