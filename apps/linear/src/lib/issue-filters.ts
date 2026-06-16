import type { Issue, IssueStatus, Priority, ViewId } from "./types"
import { CURRENT_USER_ID } from "./types"

export interface IssueFilters {
  statuses: IssueStatus[]
  priorities: Priority[]
  assigneeIds: string[]
}

export const EMPTY_ISSUE_FILTERS: IssueFilters = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
}

const ACTIVE_STATUSES = new Set<Issue["status"]>([
  "backlog",
  "todo",
  "in_progress",
  "in_review",
])

function matchesView(issue: Issue, view: ViewId): boolean {
  if (view === "inbox") {
    return issue.status === "backlog" && issue.assigneeId === null
  }
  if (view === "my-issues") {
    return issue.assigneeId === CURRENT_USER_ID && issue.status !== "done" && issue.status !== "canceled"
  }
  if (view === "active") {
    return ACTIVE_STATUSES.has(issue.status)
  }
  if (view.startsWith("team:")) {
    return issue.teamId === view.slice("team:".length)
  }
  if (view.startsWith("project:")) {
    return issue.projectId === view.slice("project:".length)
  }
  return true
}

export function filterIssuesForView(issues: Issue[], view: ViewId): Issue[] {
  return issues
    .filter((i) => matchesView(i, view))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function matchesFilters(issue: Issue, filters: IssueFilters): boolean {
  const statusOk =
    filters.statuses.length === 0 || filters.statuses.includes(issue.status)
  const priorityOk =
    filters.priorities.length === 0 ||
    filters.priorities.includes(issue.priority)
  const assigneeOk =
    filters.assigneeIds.length === 0 ||
    (issue.assigneeId !== null &&
      filters.assigneeIds.includes(issue.assigneeId))
  return statusOk && priorityOk && assigneeOk
}

export function applyIssueFilters(
  issues: Issue[],
  view: ViewId,
  filters: IssueFilters
): Issue[] {
  return filterIssuesForView(issues, view).filter((i) =>
    matchesFilters(i, filters)
  )
}

export function countActiveFilters(filters: IssueFilters): number {
  return (
    filters.statuses.length +
    filters.priorities.length +
    filters.assigneeIds.length
  )
}

export function countInbox(issues: Issue[]): number {
  return issues.filter(
    (i) => i.status === "backlog" && i.assigneeId === null
  ).length
}

export function countMyIssues(issues: Issue[]): number {
  return issues.filter(
    (i) =>
      i.assigneeId === CURRENT_USER_ID &&
      i.status !== "done" &&
      i.status !== "canceled"
  ).length
}
