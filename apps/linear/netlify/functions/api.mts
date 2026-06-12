import type { Config, Context } from "@netlify/functions"
import {
  issues,
  teams,
  projects,
  labels,
  users,
  makeIssue,
  type Issue,
  type Priority,
  type IssueStatus,
} from "./lib/data.ts"

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, "") || "/"
  const method = req.method

  if (path === "/teams" && method === "GET") {
    return json(teams)
  }

  if (path === "/projects" && method === "GET") {
    const teamId = url.searchParams.get("teamId")
    const list = teamId
      ? projects.filter((p) => p.teamId === teamId)
      : projects
    return json(list)
  }

  if (path === "/labels" && method === "GET") {
    return json(labels)
  }

  if (path === "/users" && method === "GET") {
    return json(users)
  }

  if (path === "/search" && method === "GET") {
    const q = (url.searchParams.get("q") || "").trim().toLowerCase()
    const delay = Math.max(80, 700 - q.length * 90)
    await sleep(delay)
    const results = q
      ? issues.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.identifier.toLowerCase().includes(q)
        )
      : []
    return json({ query: q, results })
  }

  if (path === "/issues" && method === "GET") {
    const teamId = url.searchParams.get("teamId")
    const projectId = url.searchParams.get("projectId")
    let list = issues
    if (teamId) list = list.filter((i) => i.teamId === teamId)
    if (projectId) list = list.filter((i) => i.projectId === projectId)
    return json(list)
  }

  if (path === "/issues" && method === "POST") {
    const body = (await req.json()) as Partial<Issue> & { teamId: string }
    const team = teams.find((t) => t.id === body.teamId)
    if (!team) return json({ error: "team not found" }, 400)

    const issue = makeIssue(team.key, team.id)
    const created: Issue = {
      ...issue,
      title: (body.title || "").trim(),
      description: body.description ?? null,
      projectId: body.projectId ?? null,
      status: (body.status as IssueStatus) || "backlog",
      priority: (body.priority as Priority) ?? 0,
      assigneeId: body.assigneeId ?? null,
      labelIds: body.labelIds || [],
    }
    issues.push(created)
    return json(created, 201)
  }

  const issueMatch = path.match(/^\/issues\/([^/]+)$/)
  if (issueMatch) {
    const id = issueMatch[1]
    const idx = issues.findIndex((i) => i.id === id)
    if (idx === -1) return json({ error: "not found" }, 404)

    if (method === "PATCH") {
      const body = (await req.json()) as Partial<Issue>
      issues[idx] = {
        ...issues[idx],
        ...body,
        id: issues[idx].id,
        identifier: issues[idx].identifier,
        updatedAt: new Date().toISOString(),
      }
      return json(issues[idx])
    }

    if (method === "DELETE") {
      const [removed] = issues.splice(idx, 1)
      return json(removed)
    }
  }

  return json({ error: "not found", path }, 404)
}

export const config: Config = {
  path: "/api/*",
}
