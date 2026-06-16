#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const toolDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(toolDir, "../..")
const { sites } = JSON.parse(readFileSync(path.join(toolDir, "sites.json"), "utf8"))
const orderedProjects = Object.keys(sites)

function parseArgs(argv) {
  const parsed = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith("--")) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith("--")) {
      parsed[key] = true
    } else {
      parsed[key] = next
      i += 1
    }
  }
  return parsed
}

const args = parseArgs(process.argv.slice(2))
const mode = args.mode ?? "production"
const base = args.base ?? process.env.NX_BASE ?? process.env.GITHUB_BASE_SHA
const head = args.head ?? process.env.NX_HEAD ?? process.env.GITHUB_SHA ?? "HEAD"
const prNumber = args.pr ?? process.env.PR_NUMBER
const dryRun = Boolean(args["dry-run"])
const forceAll = Boolean(args.all)

if (!["production", "preview"].includes(mode)) {
  throw new Error(`Unsupported mode: ${mode}`)
}

if (!dryRun && !process.env.NETLIFY_AUTH_TOKEN) {
  throw new Error("NETLIFY_AUTH_TOKEN is required to deploy")
}

function run(command, commandArgs, { capture = false, allowFailure = false, cwd = workspaceRoot } = {}) {
  const rendered = [command, ...commandArgs].join(" ")
  const relativeCwd = path.relative(workspaceRoot, cwd) || "."
  console.log(`$ ${relativeCwd === "." ? "" : `(${relativeCwd}) `}${rendered}`)
  const result = spawnSync(command, commandArgs, {
    cwd,
    env: process.env,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  })
  if (result.status !== 0 && !allowFailure) {
    if (capture) {
      if (result.stdout) process.stdout.write(result.stdout)
      if (result.stderr) process.stderr.write(result.stderr)
    }
    throw new Error(`Command failed: ${rendered}`)
  }
  return {
    ok: result.status === 0,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
  }
}

function parseJsonOutput(output) {
  const trimmed = output.trim()
  const objectStart = trimmed.indexOf("{")
  const arrayStart = trimmed.indexOf("[")
  let start = -1
  if (objectStart === -1) start = arrayStart
  else if (arrayStart === -1) start = objectStart
  else start = Math.min(objectStart, arrayStart)
  if (start === -1) throw new Error(`No JSON object found in output:\n${output}`)
  return JSON.parse(trimmed.slice(start))
}

function isZeroSha(value) {
  return Boolean(value) && /^0+$/.test(value)
}

function changedFiles() {
  if (!base || !head || isZeroSha(base)) return null
  const diff = run("git", ["diff", "--name-only", `${base}...${head}`], {
    capture: true,
    allowFailure: true,
  })
  if (!diff.ok) return null
  return diff.stdout.split("\n").map((line) => line.trim()).filter(Boolean)
}

function directlyChangedProjects(files) {
  const projectSet = new Set()
  for (const file of files) {
    const match = /^apps\/([^/]+)\//.exec(file)
    if (match && sites[match[1]]) projectSet.add(match[1])
  }
  return orderedProjects.filter((project) => projectSet.has(project))
}

function affectedProjects() {
  // Force a full fan-out only when explicitly requested (--all) or when we
  // cannot compute a reliable diff (first deploy, or a missing/zero base SHA).
  if (forceAll || !base || !head || isZeroSha(base)) return orderedProjects

  const files = changedFiles()
  // If the diff itself could not be computed, fall back to deploying everything
  // rather than silently skipping a real change.
  if (!files) return orderedProjects

  // Each app under apps/<name> is fully self-contained (its own build output and
  // Netlify functions, with no shared libs), so an app is "affected" only when a
  // file inside its own directory changes. Changes to root tooling, lockfiles,
  // or nx.json no longer force a redeploy + Replay QA run of every app.
  return directlyChangedProjects(files)
}

function buildProject(project) {
  if (dryRun) {
    console.log(`[dry-run] would build ${project}`)
    return
  }
  run("npx", ["nx", "run", `${project}:build`])
}

function deployProject(project) {
  const site = sites[project]
  const projectRoot = path.join(workspaceRoot, "apps", project)
  const publishDir = path.join(workspaceRoot, site.publish)
  const functionsDir = site.functions ? path.join(workspaceRoot, site.functions) : null
  const deployArgs = [
    "netlify",
    "deploy",
    "--no-build",
    "--json",
    "--site",
    site.siteId,
    "--dir",
    publishDir,
    "--message",
    `${mode === "production" ? "Production" : "Preview"} deploy ${project} from ${head}`,
  ]

  if (functionsDir && existsSync(functionsDir)) {
    deployArgs.push("--functions", functionsDir)
  }

  let previewAlias
  if (mode === "preview") {
    previewAlias = String(args.alias ?? (prNumber ? `deploy-preview-${prNumber}` : "deploy-preview-local"))
    deployArgs.push("--alias", previewAlias)
  }

  if (dryRun) {
    const url = mode === "production"
      ? site.url
      : `https://${previewAlias}--${site.name}.netlify.app`
    console.log(`[dry-run] would deploy ${project} to ${url}`)
    return {
      project,
      url,
      deployId: "dry-run",
      logs: "",
      siteName: site.name,
    }
  }

  const deploy = parseJsonOutput(run("npx", deployArgs, { capture: true, cwd: projectRoot }).stdout)

  if (mode === "production") {
    const restored = parseJsonOutput(
      run(
        "npx",
        [
          "netlify",
          "api",
          "restoreSiteDeploy",
          "--data",
          JSON.stringify({ site_id: site.siteId, deploy_id: deploy.deploy_id }),
        ],
        { capture: true }
      ).stdout
    )
    return {
      project,
      url: site.url,
      deployUrl: restored.deploy_ssl_url ?? deploy.deploy_url,
      deployId: deploy.deploy_id,
      logs: deploy.logs,
      siteName: site.name,
    }
  }

  return {
    project,
    url: deploy.deploy_url ?? `https://${previewAlias}--${site.name}.netlify.app`,
    deployId: deploy.deploy_id,
    logs: deploy.logs,
    siteName: site.name,
  }
}

function markdownFor(results, projects) {
  const title = mode === "production" ? "Netlify Production Deploys" : "Netlify PR Previews"
  const lines = [`## ${title}`, ""]
  if (dryRun) lines.push("Dry run only; no Netlify deploys were created.", "")
  if (base) lines.push(`Base: \`${base}\``)
  if (head) lines.push(`Head: \`${head}\``)
  if (mode === "preview" && prNumber) lines.push(`PR: #${prNumber}`)
  lines.push("")

  if (projects.length === 0) {
    lines.push("No app projects were affected.")
    return `${lines.join("\n")}\n`
  }

  lines.push("| Project | URL | Deploy |")
  lines.push("|---|---|---|")
  for (const result of results) {
    const deployLink = result.logs ? `[logs](${result.logs})` : result.deployId
    lines.push(`| \`${result.project}\` | [${result.siteName}](${result.url}) | ${deployLink} |`)
  }
  return `${lines.join("\n")}\n`
}

const projects = affectedProjects()
console.log(`Affected deploy projects: ${projects.length ? projects.join(", ") : "(none)"}`)

const results = []
for (const project of projects) {
  buildProject(project)
  results.push(deployProject(project))
}

const markdown = markdownFor(results, projects)
const json = {
  mode,
  base,
  head,
  prNumber,
  dryRun,
  createdAt: new Date().toISOString(),
  projects,
  results,
}
writeFileSync(path.join(workspaceRoot, "netlify-deployments.md"), markdown)
writeFileSync(path.join(workspaceRoot, "netlify-deployments.json"), `${JSON.stringify(json, null, 2)}\n`)
console.log(markdown)

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${markdown}\n`)
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, "markdown_path=netlify-deployments.md\n")
  appendFileSync(process.env.GITHUB_OUTPUT, "json_path=netlify-deployments.json\n")
}
