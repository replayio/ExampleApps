import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { replayMcpTools } from "./scenario-data.mjs";

const manifestPath = process.argv[2] ?? join(process.cwd(), "recordings.manifest.json");
const live = process.argv.includes("--live");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const recordings = manifest.recordings ?? [];
const uploaded = recordings.filter(
  entry => entry.recordingId && !entry.recordingId.startsWith("replace-with-")
);
const covered = new Set(recordings.flatMap(entry => entry.toolsCovered ?? []));
const missing = replayMcpTools.filter(tool => !covered.has(tool));

if (missing.length) {
  console.error(`Manifest is missing tool coverage: ${missing.join(", ")}`);
  process.exit(1);
}

if (!live) {
  console.log("Manifest smoke passed. Add --live after uploading recordings to call Replay MCP.");
  process.exit(0);
}

if (!uploaded.length) {
  console.error("No uploaded recording IDs found in manifest.");
  process.exit(1);
}

const recordingId = uploaded[0].recordingId;
const client = new Client({ name: "replay-mcp-lab-smoke", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "replayio", "mcp"],
});

await client.connect(transport);

const calls = [
  ["RecordingOverview", { recordingId }],
  ["ConsoleMessages", { recordingId, mode: "summary", level: "all", showNodeModules: false, limit: 25, offset: 0 }],
  ["NetworkRequest", { recordingId, mode: "summary", limit: 25, offset: 0, slowThresholdMs: 2000 }],
  ["LocalStorage", { recordingId, mode: "summary", limit: 25, offset: 0 }],
  ["UserInteractions", { recordingId, mode: "summary", limit: 25, offset: 0, type: "all" }],
  ["ReactRenders", { recordingId, mode: "summary", limit: 25, offset: 0 }],
  ["ReduxActions", { recordingId, mode: "summary", limit: 25, offset: 0 }],
  ["ZustandStores", { recordingId, mode: "summary", limit: 25, offset: 0 }],
  ["TanStackQueries", { recordingId, mode: "summary", limit: 25, offset: 0 }],
  ["ListSources", { recordingId }],
  ["Screenshot", { recordingId }],
  ["PlaywrightSteps", { recordingId, mode: "summary", collapseRetries: true, limit: 25, offset: 0 }],
];

try {
  for (const [name, args] of calls) {
    console.log(`Calling ${name}`);
    await client.callTool({ name, arguments: args });
  }
} finally {
  await client.close();
}

console.log("Live MCP smoke calls completed.");
