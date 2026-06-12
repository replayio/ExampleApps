export type IssueStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "canceled"

export type Priority = 0 | 1 | 2 | 3 | 4

export interface Team {
  id: string
  name: string
  key: string
}

export interface Project {
  id: string
  teamId: string
  name: string
  color: string
  icon?: string
}

export interface User {
  id: string
  name: string
  initials: string
  color: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Issue {
  id: string
  identifier: string
  title: string
  description: string | null
  teamId: string
  projectId: string | null
  status: IssueStatus
  priority: Priority
  assigneeId: string | null
  labelIds: string[]
  createdAt: string
  updatedAt: string
}

export type ViewId =
  | "inbox"
  | "my-issues"
  | "active"
  | "search"
  | `team:${string}`
  | `project:${string}`

export const STATUS_META: Record<
  IssueStatus,
  { label: string; color: string; bg: string }
> = {
  backlog: { label: "Backlog", color: "#95a2b3", bg: "#95a2b322" },
  todo: { label: "Todo", color: "#5e6ad2", bg: "#5e6ad222" },
  in_progress: { label: "In Progress", color: "#f2c94c", bg: "#f2c94c22" },
  in_review: { label: "In Review", color: "#bb6bd9", bg: "#bb6bd922" },
  done: { label: "Done", color: "#4cb782", bg: "#4cb78222" },
  canceled: { label: "Canceled", color: "#95a2b3", bg: "#95a2b322" },
}

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string }
> = {
  0: { label: "No priority", color: "#3a3a3c" },
  1: { label: "Urgent", color: "#eb5757" },
  2: { label: "High", color: "#f2994a" },
  3: { label: "Medium", color: "#f2c94c" },
  4: { label: "Low", color: "#95a2b3" },
}

export const CURRENT_USER_ID = "u1"
