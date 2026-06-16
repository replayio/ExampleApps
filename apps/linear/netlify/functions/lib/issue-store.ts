// Durable issue store shared across Netlify function instances.
//
// The previous implementation kept issues in a module-level array. That array
// is per-instance and non-persistent: Netlify scales functions out to multiple
// isolated instances, so an issue created (or deleted) on one instance is
// invisible to the next request routed to a different instance — producing
// intermittent 404s on PATCH/DELETE and status changes that never persist.
//
// Backing the collection with Netlify Blobs gives every instance one shared,
// durable view. A local Map fallback keeps `netlify dev` working when the Blobs
// backend is not configured.

import { getDeployStore, type Store } from "@netlify/blobs"
import {
  SEED_COUNTERS,
  SEED_ISSUES,
  makeIssue,
  type Issue,
} from "./data.ts"

interface IssuesState {
  issues: Issue[]
  counters: Record<string, number>
}

const STORE_NAME = "linear-issues"
const STATE_KEY = "state"

function seedState(): IssuesState {
  return {
    issues: SEED_ISSUES.map((issue) => ({ ...issue })),
    counters: { ...SEED_COUNTERS },
  }
}

let memoryState: IssuesState | null = null

function resolveStore(): Store | null {
  try {
    return getDeployStore({ name: STORE_NAME, consistency: "strong" })
  } catch {
    return null
  }
}

async function readState(store: Store | null): Promise<IssuesState> {
  if (!store) {
    if (!memoryState) memoryState = seedState()
    return memoryState
  }
  const stored = (await store.get(STATE_KEY, { type: "json" })) as
    | IssuesState
    | null
  if (stored) return stored
  const seeded = seedState()
  await store.setJSON(STATE_KEY, seeded)
  return seeded
}

async function writeState(
  store: Store | null,
  state: IssuesState
): Promise<void> {
  if (!store) {
    memoryState = state
    return
  }
  await store.setJSON(STATE_KEY, state)
}

export async function listIssues(filter?: {
  teamId?: string | null
  projectId?: string | null
}): Promise<Issue[]> {
  const { issues } = await readState(resolveStore())
  return issues.filter(
    (issue) =>
      (!filter?.teamId || issue.teamId === filter.teamId) &&
      (!filter?.projectId || issue.projectId === filter.projectId)
  )
}

export async function searchIssues(query: string): Promise<Issue[]> {
  const { issues } = await readState(resolveStore())
  return issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(query) ||
      issue.identifier.toLowerCase().includes(query)
  )
}

// Fields a client may set when creating an issue. Identity, identifier, and
// timestamps are owned by the store and never accepted from the caller.
export type NewIssueFields = Pick<
  Issue,
  "title" | "description" | "projectId" | "status" | "priority" | "assigneeId" | "labelIds"
>

export async function createIssue(
  teamKey: string,
  teamId: string,
  fields: NewIssueFields
): Promise<Issue> {
  const store = resolveStore()
  const state = await readState(store)
  const num = (state.counters[teamKey] ?? 0) + 1
  const created: Issue = { ...makeIssue(teamKey, teamId, num), ...fields }
  state.counters[teamKey] = num
  state.issues.push(created)
  await writeState(store, state)
  return created
}

export async function patchIssue(
  id: string,
  patch: Partial<Issue>
): Promise<Issue | null> {
  const store = resolveStore()
  const state = await readState(store)
  const idx = state.issues.findIndex((issue) => issue.id === id)
  if (idx === -1) return null
  const existing = state.issues[idx]
  const updated: Issue = {
    ...existing,
    ...patch,
    id: existing.id,
    identifier: existing.identifier,
    updatedAt: new Date().toISOString(),
  }
  state.issues[idx] = updated
  await writeState(store, state)
  return updated
}

export async function deleteIssue(id: string): Promise<Issue | null> {
  const store = resolveStore()
  const state = await readState(store)
  const idx = state.issues.findIndex((issue) => issue.id === id)
  if (idx === -1) return null
  const [removed] = state.issues.splice(idx, 1)
  await writeState(store, state)
  return removed
}

