# Replay MCP Lab Examples

This workspace contains one shared Replay MCP diagnostic lab and three thin framework shells:

- `replay-mcp-lab-core`: shared scenarios, state stores, test runners, API fixtures, and manifest scripts.
- `replay-mcp-lab-vite`: Vite React shell.
- `replay-mcp-lab-next`: Next.js App Router shell.
- `replay-mcp-lab-tanstack-start`: TanStack Start shell.

Install from this directory:

```bash
npm install
```

Run one shell:

```bash
npm run dev -w @replayio/mcp-lab-vite
npm run dev -w @replayio/mcp-lab-next
npm run dev -w @replayio/mcp-lab-tanstack-start
```

Recordings are generated per shell with:

```bash
npm run record:all -w @replayio/mcp-lab-vite
npm run record:all -w @replayio/mcp-lab-next
npm run record:all -w @replayio/mcp-lab-tanstack-start
```

The CI workflow at `.github/workflows/replay-mcp-lab.yml` runs the normal
Chromium checks first, then runs each shell's Replay Chromium recording suite in
a matrix job. Configure either `SANDBOX_CI_REPLAY_API_KEY` or `REPLAY_API_KEY`
as a GitHub Actions secret. The recording jobs install the Replay browser with
`npx replayio install`, set `REPLAY_UPLOAD=1`, and upload through
`replayReporter({ apiKey: process.env.REPLAY_API_KEY, upload: { statusThreshold: "all" } })`.

Each shell owns a `recordings.manifest.json` file. The manifest starts with placeholder recording IDs and can be refreshed after upload with each shell's `upload:recordings` script.
