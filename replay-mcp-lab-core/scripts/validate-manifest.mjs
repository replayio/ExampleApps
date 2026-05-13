import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { replayMcpTools } from "./scenario-data.mjs";

const manifestPath = process.argv[2] ?? join(process.cwd(), "recordings.manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const covered = new Set((manifest.recordings ?? []).flatMap(entry => entry.toolsCovered ?? []));
const missing = replayMcpTools.filter(tool => !covered.has(tool));

if (missing.length) {
  console.error(`Manifest is missing tool coverage: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Manifest covers all ${replayMcpTools.length} Replay MCP tools.`);
