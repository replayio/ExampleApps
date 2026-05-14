import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoName = process.env.GITHUB_REPOSITORY?.split("/").pop() ?? "ExampleApps";
const repoBasePath = `/${repoName}`;
const outputDir = join(process.cwd(), "pages-dist");

const apps = [
  {
    basePath: `${repoBasePath}/replay-mcp-lab-vite/`,
    buildEnv: { PAGES_BASE_PATH: `${repoBasePath}/replay-mcp-lab-vite/` },
    dist: "replay-mcp-lab-vite/dist",
    href: "replay-mcp-lab-vite/",
    title: "Replay MCP Lab - Vite",
    workspace: "@replayio/mcp-lab-vite",
  },
  {
    basePath: `${repoBasePath}/replay-mcp-lab-next`,
    buildEnv: {
      NEXT_OUTPUT: "export",
      NEXT_PUBLIC_BASE_PATH: `${repoBasePath}/replay-mcp-lab-next`,
    },
    dist: "replay-mcp-lab-next/out",
    href: "replay-mcp-lab-next/",
    title: "Replay MCP Lab - Next.js",
    workspace: "@replayio/mcp-lab-next",
  },
  {
    basePath: `${repoBasePath}/replay-mcp-lab-tanstack-start/`,
    buildEnv: { PAGES_BASE_PATH: `${repoBasePath}/replay-mcp-lab-tanstack-start/` },
    dist: "replay-mcp-lab-tanstack-start/.output/public",
    href: "replay-mcp-lab-tanstack-start/",
    title: "Replay MCP Lab - TanStack Start",
    workspace: "@replayio/mcp-lab-tanstack-start",
  },
];

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });

for (const app of apps) {
  run("npm", ["run", "build", "-w", app.workspace], {
    ...app.buildEnv,
    SOURCE_MAPS: "true",
  });

  await cp(join(process.cwd(), app.dist), join(outputDir, app.href), {
    recursive: true,
  });
}

await writeFile(join(outputDir, ".nojekyll"), "");
await writeFile(join(outputDir, "index.html"), renderIndex(), "utf8");

function run(command, args, env) {
  const result = spawnSync(command, args, {
    env: { ...process.env, ...env },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function renderIndex() {
  const links = apps
    .map(
      app => `<li>
        <a href="${app.href}">${app.title}</a>
        <span>${app.basePath}</span>
      </li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Replay Example Apps</title>
    <style>
      :root {
        color: #172027;
        background: #f6f7f8;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        margin: 0;
      }
      main {
        margin: 0 auto;
        max-width: 960px;
        padding: 48px 24px;
      }
      h1 {
        font-size: 2rem;
        margin: 0 0 8px;
      }
      p {
        color: #526370;
        margin: 0 0 28px;
      }
      ul {
        display: grid;
        gap: 12px;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      li {
        background: #fff;
        border: 1px solid #d8e0e5;
        border-radius: 8px;
        display: grid;
        gap: 4px;
        padding: 16px;
      }
      a {
        color: #0b5f8a;
        font-size: 1.05rem;
        font-weight: 700;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      span {
        color: #6a7b86;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 0.85rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Replay Example Apps</h1>
      <p>Static GitHub Pages builds for the Replay MCP lab shells. Production source maps are included in each app artifact.</p>
      <ul>
        ${links}
      </ul>
    </main>
  </body>
</html>
`;
}
