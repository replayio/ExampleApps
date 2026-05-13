import { createLabApiResponse } from "@replayio/mcp-lab-core/api";

export async function GET(
  request: Request,
  context: { params: Promise<{ scenario: string }> }
) {
  const { scenario } = await context.params;
  return createLabApiResponse(scenario, request.url);
}
