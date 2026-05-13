import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { labScenarios } from "./scenario-data.mjs";

const framework = readFlag("--framework") ?? "unknown";
const manifestPath = join(process.cwd(), "recordings.manifest.json");
const recordingMap = parseRecordingMap();
const previousManifest = await readPreviousManifest(manifestPath);

const previousByScenario = new Map(
  (previousManifest.recordings ?? []).map(entry => [entry.scenario, entry])
);

const recordings = labScenarios.map(scenario => {
  const previous = previousByScenario.get(scenario.id) ?? {};
  const mapped = recordingMap[scenario.id];
  const recordingId = mapped?.recordingId ?? previous.recordingId ?? `replace-with-${scenario.id}`;

  return {
    scenario: scenario.id,
    recordingId,
    replayUrl:
      mapped?.replayUrl ??
      previous.replayUrl ??
      (recordingId.startsWith("replace-with-")
        ? ""
        : `https://app.replay.io/recording/${recordingId}`),
    framework,
    testFile: scenario.testFile,
    toolsCovered: scenario.toolsCovered,
    generatedAt: new Date().toISOString(),
  };
});

const manifest = {
  schemaVersion: 1,
  framework,
  recordings,
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Updated ${manifestPath}`);

function readFlag(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function parseRecordingMap() {
  const raw = process.env.REPLAY_RECORDING_MAP;
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("REPLAY_RECORDING_MAP must be valid JSON.");
    throw error;
  }
}

async function readPreviousManifest(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return { recordings: [] };
  }
}
