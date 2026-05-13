export type LabApiPayload = {
  scenario: string;
  status: "ok" | "slow" | "failed";
  summary: string;
  generatedAt: string;
  metrics: {
    latencyMs: number;
    total: number;
    failed: number;
    cached: boolean;
  };
  items: Array<{
    id: string;
    label: string;
    value: number;
  }>;
};

const items = [
  { id: "ord-1001", label: "Checkout API", value: 128.4 },
  { id: "ord-1002", label: "Inventory API", value: 47.25 },
  { id: "ord-1003", label: "Profile API", value: 88.1 },
];

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getLabApiPayload(
  scenario: string,
  requestUrl = "http://localhost/api/lab/summary"
): Promise<LabApiPayload> {
  const url = new URL(requestUrl);
  const mode = url.searchParams.get("mode") ?? scenario;
  const latencyMs = mode.includes("slow") ? 450 : 24;

  if (mode.includes("slow")) {
    await delay(450);
  }

  const failed = mode.includes("fail") || mode.includes("query-fail");

  return {
    scenario,
    status: failed ? "failed" : mode.includes("slow") ? "slow" : "ok",
    summary: failed
      ? "Deterministic lab failure response"
      : `Deterministic lab response for ${scenario}`,
    generatedAt: new Date(0).toISOString(),
    metrics: {
      latencyMs,
      total: items.length,
      failed: failed ? 1 : 0,
      cached: mode.includes("cached"),
    },
    items,
  };
}

export async function createLabApiResponse(
  scenario: string,
  requestUrl = `http://localhost/api/lab/${scenario}`
): Promise<Response> {
  const payload = await getLabApiPayload(scenario, requestUrl);
  const status = payload.status === "failed" ? 503 : 200;

  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Replay-Mcp-Lab-Scenario": scenario,
    },
  });
}
