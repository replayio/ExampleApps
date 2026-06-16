import type { Config, Context } from "@netlify/functions"
import {
  teams,
  projects,
  labels,
  users,
  type Priority,
  type IssueStatus,
} from "./lib/data.ts"
import {
  createIssue,
  deleteIssue,
  listIssues,
  patchIssue,
  searchIssues,
  type NewIssueFields,
} from "./lib/issue-store.ts"

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
    const results = q ? await searchIssues(q) : []
    return json({ query: q, results })
  }

  if (path === "/issues" && method === "GET") {
    const list = await listIssues({
      teamId: url.searchParams.get("teamId"),
      projectId: url.searchParams.get("projectId"),
    })
    return json(list)
  }

  if (path === "/issues" && method === "POST") {
    const body = (await req.json()) as Partial<NewIssueFields> & {
      teamId: string
    }
    const team = teams.find((t) => t.id === body.teamId)
    if (!team) return json({ error: "team not found" }, 400)

    const created = await createIssue(team.key, team.id, {
      title: (body.title || "").trim(),
      description: body.description ?? null,
      projectId: body.projectId ?? null,
      status: (body.status as IssueStatus) || "backlog",
      priority: (body.priority as Priority) ?? 0,
      assigneeId: body.assigneeId ?? null,
      labelIds: body.labelIds || [],
    })
    return json(created, 201)
  }

  const issueMatch = path.match(/^\/issues\/([^/]+)\/?$/)
  if (issueMatch) {
    const id = issueMatch[1]

    if (method === "PATCH") {
      const body = (await req.json()) as Partial<NewIssueFields>
      const updated = await patchIssue(id, body)
      if (!updated) return json({ error: "not found" }, 404)
      return json(updated)
    }

    if (method === "DELETE") {
      const removed = await deleteIssue(id)
      if (!removed) return json({ error: "not found" }, 404)
      return json(removed)
    }
  }

  return json({ error: "not found", path }, 404)
}

export const config: Config = {
  path: "/api/*",
}
