// In-memory data store for the Linear clone backend.

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

export const CURRENT_USER_ID = "u1"

export const teams: Team[] = [
  { id: "eng", name: "Engineering", key: "ENG" },
  { id: "des", name: "Design", key: "DES" },
  { id: "ops", name: "Operations", key: "OPS" },
]

export const users: User[] = [
  { id: "u1", name: "Brett Lamy", initials: "BL", color: "#5e6ad2" },
  { id: "u2", name: "Sam Lee", initials: "SL", color: "#26b5ce" },
  { id: "u3", name: "Alex Chen", initials: "AC", color: "#f2994a" },
]

export const projects: Project[] = [
  { id: "platform", teamId: "eng", name: "Platform", color: "#5e6ad2", icon: "⚡" },
  { id: "mobile", teamId: "eng", name: "Mobile App", color: "#26b5ce", icon: "📱" },
  { id: "design-system", teamId: "des", name: "Design System", color: "#f2994a", icon: "🎨" },
  { id: "onboarding", teamId: "ops", name: "Onboarding", color: "#95a2b3", icon: "🚀" },
]

export const labels: Label[] = [
  { id: "bug", name: "Bug", color: "#eb5757" },
  { id: "feature", name: "Feature", color: "#5e6ad2" },
  { id: "improvement", name: "Improvement", color: "#26b5ce" },
  { id: "docs", name: "Documentation", color: "#95a2b3" },
]

export const SEED_ISSUES: Issue[] = [
  {
    id: "i1",
    identifier: "ENG-142",
    title: "Fix Safari token refresh loop",
    description:
      "Users on Safari intermittently get logged out. Investigate token refresh timing and cookie SameSite settings.",
    teamId: "eng",
    projectId: "platform",
    status: "in_progress",
    priority: 1,
    assigneeId: "u1",
    labelIds: ["bug"],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-08T14:00:00.000Z",
  },
  {
    id: "i2",
    identifier: "ENG-138",
    title: "Add WebSocket reconnection backoff",
    description: "Implement exponential backoff for realtime channel reconnects.",
    teamId: "eng",
    projectId: "platform",
    status: "todo",
    priority: 2,
    assigneeId: "u2",
    labelIds: ["improvement"],
    createdAt: "2026-06-02T10:00:00.000Z",
    updatedAt: "2026-06-07T10:00:00.000Z",
  },
  {
    id: "i3",
    identifier: "DES-24",
    title: "Refresh sidebar navigation icons",
    description: "Update icon set to match the new brand guidelines.",
    teamId: "des",
    projectId: "design-system",
    status: "in_review",
    priority: 3,
    assigneeId: "u3",
    labelIds: ["feature"],
    createdAt: "2026-06-03T10:00:00.000Z",
    updatedAt: "2026-06-08T09:00:00.000Z",
  },
  {
    id: "i4",
    identifier: "ENG-145",
    title: "Ship push notification opt-in",
    description: null,
    teamId: "eng",
    projectId: "mobile",
    status: "backlog",
    priority: 4,
    assigneeId: null,
    labelIds: ["feature"],
    createdAt: "2026-06-04T10:00:00.000Z",
    updatedAt: "2026-06-04T10:00:00.000Z",
  },
  {
    id: "i5",
    identifier: "OPS-8",
    title: "Update new-hire checklist",
    description: "Refresh onboarding docs with latest tooling and access requests.",
    teamId: "ops",
    projectId: "onboarding",
    status: "todo",
    priority: 2,
    assigneeId: "u1",
    labelIds: ["docs"],
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-06-06T10:00:00.000Z",
  },
  {
    id: "i6",
    identifier: "ENG-140",
    title: "Migrate auth module to smaller services",
    description: "Split the monolithic auth service into token, session, and identity units.",
    teamId: "eng",
    projectId: "platform",
    status: "done",
    priority: 2,
    assigneeId: "u2",
    labelIds: ["improvement"],
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "i7",
    identifier: "DES-19",
    title: "Finalize color tokens for dark mode",
    description: "Lock semantic color tokens before handoff to engineering.",
    teamId: "des",
    projectId: "design-system",
    status: "in_progress",
    priority: 1,
    assigneeId: "u3",
    labelIds: ["feature"],
    createdAt: "2026-06-06T10:00:00.000Z",
    updatedAt: "2026-06-08T11:00:00.000Z",
  },
  {
    id: "i8",
    identifier: "ENG-147",
    title: "Investor metrics dashboard",
    description: "Draft the monthly metrics view for the investor update.",
    teamId: "eng",
    projectId: "platform",
    status: "todo",
    priority: 1,
    assigneeId: "u1",
    labelIds: ["feature"],
    createdAt: "2026-06-07T10:00:00.000Z",
    updatedAt: "2026-06-08T08:00:00.000Z",
  },
]

export const SEED_COUNTERS: Record<string, number> = {
  ENG: 147,
  DES: 24,
  OPS: 8,
}

export function makeIssue(teamKey: string, teamId: string, num: number): Issue {
  const id = `i${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  return {
    id,
    identifier: `${teamKey}-${num}`,
    title: "",
    description: null,
    teamId,
    projectId: null,
    status: "backlog",
    priority: 0,
    assigneeId: null,
    labelIds: [],
    createdAt: now,
    updatedAt: now,
  }
}
