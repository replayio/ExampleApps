export type LogpointResult = {
  anchor: string;
  subtotal: number;
  riskScore: number;
  priority: "low" | "medium" | "high";
};

export function calculateDependencyScore(seed: number) {
  const normalized = normalizeSeed(seed);
  const weighted = applyWeight(normalized);
  return Math.round(weighted + deriveAdjustment(weighted));
}

function normalizeSeed(seed: number) {
  return Math.max(1, Math.min(seed, 500));
}

function applyWeight(value: number) {
  return value * 1.37;
}

function deriveAdjustment(value: number) {
  return value % 7;
}

export function mcpLogpointAnchor(orderTotal: number, riskScore: number): LogpointResult {
  const subtotal = Number((orderTotal * 0.82).toFixed(2));
  const priority = riskScore > 80 ? "high" : riskScore > 40 ? "medium" : "low";
  return { anchor: "mcpLogpointAnchor", subtotal, riskScore, priority };
}

export function runProfileWorkload(iterations = 8000) {
  let checksum = 0;

  for (let index = 0; index < iterations; index += 1) {
    checksum += profileBucket(index) * profileNoise(index);
  }

  return checksum;
}

function profileBucket(index: number) {
  return (index % 17) + Math.sqrt(index + 1);
}

function profileNoise(index: number) {
  return (index % 11) / 3 + Math.sin(index / 12);
}
