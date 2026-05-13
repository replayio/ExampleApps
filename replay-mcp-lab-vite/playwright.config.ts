import { defineConfig, devices } from "@playwright/test";
import { devices as replayDevices, replayReporter } from "@replayio/playwright";

const uploadReplayRecordings = ["1", "true"].includes(
  process.env.REPLAY_UPLOAD?.toLowerCase() ?? ""
);
const enableReplayReporter =
  uploadReplayRecordings || process.argv.some(arg => arg.includes("replay-chromium"));

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4310",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:4310",
  },
  reporter: [
    ...(enableReplayReporter
      ? [
          replayReporter({
            apiKey: process.env.REPLAY_API_KEY,
            runTitle: process.env.REPLAY_RUN_TITLE ?? "Replay MCP Lab Vite",
            upload: uploadReplayRecordings ? { statusThreshold: "all" } : false,
          }),
        ]
      : []),
    process.env.CI ? ["dot"] : ["list"],
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "replay-chromium",
      use: { ...replayDevices["Replay Chromium"] },
    },
  ],
});
