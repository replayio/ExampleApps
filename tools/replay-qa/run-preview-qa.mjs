#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const toolDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(toolDir, "../..")
const defaultApiBase = "https://qa.replay.io/api/v1"

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
const apiBase = String(process.env.REPLAY_QA_API_BASE_URL ?? args.apiBase ?? defaultApiBase).replace(/\/$/, "")
const token = process.env.REPLAY_QA_API_TOKEN
const deploymentsPath = path.resolve(workspaceRoot, args.deployments ?? "netlify-deployments.json")
const prNumber = args.pr ?? process.env.PR_NUMBER
const maxWaitMs = Number(process.env.REPLAY_QA_MAX_WAIT_MS ?? args["max-wait-ms"] ?? 20 * 60 * 1000)
const pollIntervalMs = Number(process.env.REPLAY_QA_POLL_INTERVAL_MS ?? args["poll-interval-ms"] ?? 15 * 1000)
const failOnOpenBugs = String(process.env.REPLAY_QA_FAIL_ON_OPEN_BUGS ?? "true") !== "false"
const targetProjects = new Set(
  String(args.projects ?? process.env.REPLAY_QA_PROJECTS ?? "")
    .split(",")
    .map((project) => project.trim())
    .filter(Boolean)
)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function compact(value, max = 600) {
  const text = typeof value === "string" ? value : JSON.stringify(value)
  if (!text) return ""
  return text.length > max ? `${text.slice(0, max)}...` : text
}

async function request(method, apiPath, body) {
  const response = await fetch(`${apiBase}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  const data = text ? safeJson(text) : null
  if (!response.ok) {
    throw new Error(`${method} ${apiPath} failed with ${response.status}: ${compact(data ?? text)}`)
  }
  return data
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function extractItems(value, keys) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return []
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key]
  }
  for (const key of ["items", "data", "results"]) {
    if (Array.isArray(value[key])) return value[key]
  }
  return []
}

function projectIdFrom(value) {
  return value?.project_id ?? value?.id ?? value?.project?.project_id ?? value?.project?.id ?? value?.data?.project_id ?? value?.data?.id
}

function projectUrlFrom(value, id) {
  return value?.url ?? value?.project_url ?? value?.project?.url ?? value?.data?.url ?? (id ? `${apiBase.replace("/api/v1", "")}/projects/${id}` : "")
}

function bugIdFrom(value) {
  return value?.bug_id ?? value?.id
}

function bugUrlFrom(value) {
  return value?.url ?? value?.callback_url ?? value?.web_url ?? value?.referrer ?? ""
}

function flatten(value, prefix = "", output = []) {
  if (!value || typeof value !== "object") return output
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, next, output)
    } else {
      output.push([next, child])
    }
  }
  return output
}

function statusSummary(status) {
  if (!status || typeof status !== "object") return "unknown"
  const entries = flatten(status)
  const parts = []
  for (const key of ["status", "state", "phase", "reverse_proxy_status"]) {
    const match = entries.find(([entryKey]) => entryKey === key || entryKey.endsWith(`.${key}`))
    if (match) parts.push(`${key}: ${match[1]}`)
  }
  for (const [key, value] of entries) {
    if (
      typeof value === "number" &&
      /(queued|pending|running|in_?progress|active|bug|journey|exploration|test)/i.test(key)
    ) {
      parts.push(`${key}: ${value}`)
    }
  }
  return parts.slice(0, 8).join(", ") || compact(status, 160)
}

function qaIsFinished(status) {
  if (!status || typeof status !== "object") return false
  const entries = flatten(status)
  const terminalString = entries.some(([key, value]) =>
    /(status|state|phase)$/i.test(key) &&
    typeof value === "string" &&
    /^(finished|complete|completed|idle|done)$/i.test(value)
  )
  if (terminalString) return true

  const activeString = entries.some(([key, value]) =>
    /(status|state|phase)$/i.test(key) &&
    typeof value === "string" &&
    /(queued|pending|running|in[_-]?progress|processing|active)/i.test(value)
  )
  if (activeString) return false

  const busyNumbers = entries.filter(([key, value]) =>
    typeof value === "number" &&
    /(queued|pending|running|in_?progress|processing|active)/i.test(key)
  )
  if (busyNumbers.length > 0) {
    return busyNumbers.every(([, value]) => value === 0)
  }

  const busyBooleans = entries.filter(([key, value]) =>
    typeof value === "boolean" &&
    /(queued|pending|running|in_?progress|processing|active)/i.test(key)
  )
  if (busyBooleans.some(([, value]) => value === true)) return false
  if (busyBooleans.length > 0) return true

  return false
}

function appDesignDocument(project, targetUrl) {
  const readme = path.join(workspaceRoot, "apps", project, "README.md")
  const appReadme = existsSync(readme) ? readFileSync(readme, "utf8").slice(0, 6000) : ""
  return [
    `# ${project}`,
    "",
    `Target URL: ${targetUrl}`,
    "",
    "This is a Netlify PR preview for one app inside the Replay ExampleApps Nx monorepo.",
    appReadme ? "\n## App README\n" : "",
    appReadme,
  ].join("\n").trim()
}

function appInstructions(project) {
  const hints = {
    "acctual": "Focus on invoices, contacts, bills, payments, and drawer/dialog workflows.",
    "blamy-notes": "Focus on navigation, document rendering, editor behavior, and auth-gated UI fallbacks.",
    "digg-clone": "Focus on story browsing, post details, search, voting, and posting flows.",
    "github-clone": "Focus on repository navigation, dashboard/repo pages, file views, and auth-gated UI fallbacks.",
    "linear": "Focus on issue lists, search, issue details, creation, and status/priority changes.",
    "pampam-clone": "Focus on landing, map interactions, profile/spot views, and responsive layout.",
    "substack-clone": "Focus on feed browsing, post details, composer/editor behavior, search, and dashboard flows.",
    "todoist-clone": "Focus on task creation, completion, filters, search, task details, projects, and deletion.",
  }
  return [
    `Explore the deployed PR preview for ${project}.`,
    hints[project] ?? "Test the main navigation and primary interactive flows.",
    "Report functional regressions, crashes, broken network behavior, or severe UI issues that block the core flow.",
  ].join(" ")
}

async function createQaProject(deployment) {
  const body = {
    name: `ExampleApps PR #${prNumber ?? "local"} - ${deployment.project}`,
    target_url: deployment.url,
    instructions: appInstructions(deployment.project),
    design_document: appDesignDocument(deployment.project, deployment.url),
    enabled_polish_passes: [
      "network-performance",
      "layout-shift",
      "glitches",
      "user-experience",
      "ui-details",
    ],
  }
  const created = await request("POST", "/projects", body)
  const id = projectIdFrom(created)
  if (!id) {
    throw new Error(`Replay QA createProject did not return a project id: ${compact(created)}`)
  }
  return {
    project: deployment.project,
    targetUrl: deployment.url,
    netlifyLogs: deployment.logs,
    qaProjectId: id,
    qaProjectUrl: projectUrlFrom(created, id),
    createResponse: created,
    status: null,
    statusSummary: "created",
    openBugs: [],
    timedOut: false,
    error: null,
  }
}

async function waitForQa(result) {
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    const status = await request("GET", `/projects/${encodeURIComponent(result.qaProjectId)}/status`)
    result.status = status
    result.statusSummary = statusSummary(status)
    console.log(`[${result.project}] ${result.statusSummary}`)
    if (qaIsFinished(status)) return result
    await sleep(pollIntervalMs)
  }
  result.timedOut = true
  return result
}

async function loadOpenBugs(result) {
  const listed = await request(
    "GET",
    `/projects/${encodeURIComponent(result.qaProjectId)}/bugs?status=open&page_size=100`
  )
  const bugs = extractItems(listed, ["bugs"])
  const detailed = []
  for (const bug of bugs) {
    const id = bugIdFrom(bug)
    if (!id) {
      detailed.push(bug)
      continue
    }
    try {
      detailed.push(await request("GET", `/bugs/${encodeURIComponent(id)}`))
    } catch {
      detailed.push(bug)
    }
  }
  result.openBugs = detailed
  return result
}

function markdownFor(results, topLevelError = null) {
  const lines = ["## Replay QA", ""]
  if (topLevelError) {
    lines.push("Replay QA did not complete.", "")
    lines.push(`Error: \`${topLevelError.message}\``)
    return `${lines.join("\n")}\n`
  }

  if (results.length === 0) {
    lines.push("No deployed preview URLs were available for Replay QA.")
    return `${lines.join("\n")}\n`
  }

  lines.push("| Project | Preview | QA Project | Result | Open Bugs |")
  lines.push("|---|---|---|---|---|")
  for (const result of results) {
    const preview = `[preview](${result.targetUrl})`
    const qaProject = result.qaProjectUrl ? `[project](${result.qaProjectUrl})` : result.qaProjectId
    const status = result.error
      ? `failed: ${result.error}`
      : result.timedOut
        ? "timed out"
        : result.openBugs.length > 0
          ? "open bugs found"
          : "passed"
    lines.push(
      `| \`${result.project}\` | ${preview} | ${qaProject} | ${status} | ${result.openBugs.length} |`
    )
  }

  const projectsWithBugs = results.filter((result) => result.openBugs.length > 0)
  if (projectsWithBugs.length > 0) {
    lines.push("", "### Open Bugs", "")
    for (const result of projectsWithBugs) {
      lines.push(`#### \`${result.project}\``, "")
      for (const bug of result.openBugs.slice(0, 10)) {
        const id = bugIdFrom(bug)
        const title = bug.title ?? bug.name ?? id ?? "Untitled bug"
        const severity = bug.severity ? ` (${bug.severity})` : ""
        const url = bugUrlFrom(bug)
        const link = url ? `[${title}](${url})` : title
        lines.push(`- ${link}${severity}`)
      }
      if (result.openBugs.length > 10) {
        lines.push(`- ${result.openBugs.length - 10} more open bugs`)
      }
      lines.push("")
    }
  }

  return `${lines.join("\n").trimEnd()}\n`
}

function writeOutputs(results, error = null) {
  const markdown = markdownFor(results, error)
  const payload = {
    apiBase,
    prNumber,
    createdAt: new Date().toISOString(),
    maxWaitMs,
    pollIntervalMs,
    results,
    error: error ? { message: error.message } : null,
  }
  writeFileSync(path.join(workspaceRoot, "replay-qa-results.md"), markdown)
  writeFileSync(path.join(workspaceRoot, "replay-qa-results.json"), `${JSON.stringify(payload, null, 2)}\n`)
  console.log(markdown)

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${markdown}\n`)
  }
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, "markdown_path=replay-qa-results.md\n")
    appendFileSync(process.env.GITHUB_OUTPUT, "json_path=replay-qa-results.json\n")
  }
}

async function main() {
  if (!token) {
    throw new Error("REPLAY_QA_API_TOKEN is required to run Replay QA")
  }
  if (!token.startsWith("lqa_")) {
    throw new Error("REPLAY_QA_API_TOKEN must be a Replay QA API token that starts with lqa_")
  }
  if (!existsSync(deploymentsPath)) {
    throw new Error(`Deployments file not found: ${deploymentsPath}`)
  }

  const deployments = JSON.parse(readFileSync(deploymentsPath, "utf8"))
  const deployResults = (deployments.results ?? [])
    .filter((deployment) => deployment.url && deployment.project)
    .filter((deployment) => targetProjects.size === 0 || targetProjects.has(deployment.project))

  if (deployResults.length === 0) {
    writeOutputs([])
    return
  }

  const results = []
  for (const deployment of deployResults) {
    try {
      const result = await createQaProject(deployment)
      results.push(result)
      console.log(`[${result.project}] created Replay QA project ${result.qaProjectId}`)
    } catch (error) {
      results.push({
        project: deployment.project,
        targetUrl: deployment.url,
        netlifyLogs: deployment.logs,
        qaProjectId: "",
        qaProjectUrl: "",
        status: null,
        statusSummary: "failed to create",
        openBugs: [],
        timedOut: false,
        error: error.message,
      })
    }
  }

  await Promise.all(
    results
      .filter((result) => result.qaProjectId && !result.error)
      .map(async (result) => {
        try {
          await waitForQa(result)
          await loadOpenBugs(result)
        } catch (error) {
          result.error = error.message
        }
      })
  )

  writeOutputs(results)

  const failed = results.some((result) => result.error || result.timedOut)
  const hasOpenBugs = results.some((result) => result.openBugs.length > 0)
  if (failed || (failOnOpenBugs && hasOpenBugs)) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  writeOutputs([], error)
  process.exitCode = 1
})
