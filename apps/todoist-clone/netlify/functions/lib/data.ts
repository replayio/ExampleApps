// In-memory data store for the Todoist clone backend.
// Persists for the lifetime of the `netlify dev` process.

export type Priority = 1 | 2 | 3 | 4

export interface Task {
  id: string
  content: string
  description: string | null
  projectId: string
  priority: Priority
  dueDate: string | null // date-only "YYYY-MM-DD"
  completed: boolean
  labels: string[]
  order: number
  createdAt: string
}

export interface Project {
  id: string
  name: string
  color: string
  emoji?: string
  shared: boolean
  taskCount: number
}

export interface Label {
  id: string
  name: string
  color: string
}

export const projects: Project[] = [
  { id: "inbox", name: "Inbox", color: "#246fe0", shared: false, taskCount: 0 },
  { id: "slmobbin", name: "SLMobbin", color: "#14b8a6", emoji: "🟩", shared: true, taskCount: 0 },
  { id: "team-setup", name: "Team Setup Guide", color: "#a855f7", shared: false, taskCount: 0 },
  { id: "design-requests", name: "Design Requests", color: "#a855f7", shared: true, taskCount: 0 },
]

export const labels: Label[] = [
  { id: "urgent", name: "urgent", color: "#ef4444" },
  { id: "work", name: "work", color: "#3b82f6" },
  { id: "home", name: "home", color: "#22c55e" },
  { id: "waiting", name: "waiting", color: "#eab308" },
]

export const tasks: Task[] = [
  {
    id: "t1",
    content: "Make new visuals for social pages",
    description:
      "Design and produce new visuals for social media pages to support ongoing content needs, aligned with brand identity and platform-specific formats.",
    projectId: "slmobbin",
    priority: 1,
    dueDate: "2026-06-08",
    completed: false,
    labels: ["work"],
    order: 1,
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "t2",
    content: "Review Q2 analytics",
    description: "Pull together the Q2 dashboards and highlight notable trends.",
    projectId: "inbox",
    priority: 2,
    dueDate: "2026-06-08",
    completed: false,
    labels: [],
    order: 2,
    createdAt: "2026-06-02T10:00:00.000Z",
  },
  {
    id: "t3",
    content: "Reply to design feedback",
    description: "Respond to the latest round of comments on the homepage mocks.",
    projectId: "design-requests",
    priority: 3,
    dueDate: "2026-06-07",
    completed: false,
    labels: ["waiting"],
    order: 3,
    createdAt: "2026-05-30T10:00:00.000Z",
  },
  {
    id: "t4",
    content: "Plan team offsite",
    description: "Find a venue and draft an agenda for the summer offsite.",
    projectId: "slmobbin",
    priority: 4,
    dueDate: "2026-06-10",
    completed: false,
    labels: [],
    order: 4,
    createdAt: "2026-06-03T10:00:00.000Z",
  },
  {
    id: "t5",
    content: "Update onboarding docs",
    description: "Refresh the new-hire checklist with the latest tooling.",
    projectId: "team-setup",
    priority: 2,
    dueDate: "2026-06-12",
    completed: false,
    labels: ["work"],
    order: 5,
    createdAt: "2026-06-03T10:00:00.000Z",
  },
  {
    id: "t6",
    content: "Buy groceries",
    description: null,
    projectId: "inbox",
    priority: 4,
    dueDate: null,
    completed: false,
    labels: ["home"],
    order: 6,
    createdAt: "2026-06-04T10:00:00.000Z",
  },
  {
    id: "t7",
    content: "Finalize brand guidelines",
    description: "Lock the color and typography sections before handoff.",
    projectId: "design-requests",
    priority: 1,
    dueDate: "2026-06-09",
    completed: false,
    labels: ["urgent"],
    order: 7,
    createdAt: "2026-06-04T10:00:00.000Z",
  },
  {
    id: "t8",
    content: "Fix login bug",
    description: "Users on Safari intermittently get logged out. Investigate token refresh.",
    projectId: "inbox",
    priority: 1,
    dueDate: "2026-06-08",
    completed: false,
    labels: ["urgent"],
    order: 8,
    createdAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "t9",
    content: "Weekly 1:1 with Sam",
    description: "Prep talking points for the weekly sync.",
    projectId: "slmobbin",
    priority: 3,
    dueDate: "2026-06-08",
    completed: false,
    labels: [],
    order: 9,
    createdAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "t10",
    content: "Archive old assets",
    description: "Move last year's campaign files to cold storage.",
    projectId: "design-requests",
    priority: 4,
    dueDate: "2026-06-05",
    completed: true,
    labels: [],
    order: 10,
    createdAt: "2026-05-28T10:00:00.000Z",
  },
  {
    id: "t11",
    content: "Set up CI pipeline",
    description: "Add lint + test stages to the deploy workflow.",
    projectId: "team-setup",
    priority: 2,
    dueDate: "2026-06-15",
    completed: false,
    labels: ["work"],
    order: 11,
    createdAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "t12",
    content: "Write blog post",
    description: null,
    projectId: "inbox",
    priority: 3,
    dueDate: null,
    completed: false,
    labels: [],
    order: 12,
    createdAt: "2026-06-06T10:00:00.000Z",
  },
  {
    id: "t13",
    content: "Prepare investor update",
    description: "Draft the monthly metrics email for investors.",
    projectId: "slmobbin",
    priority: 1,
    dueDate: "2026-06-08",
    completed: false,
    labels: ["urgent"],
    order: 13,
    createdAt: "2026-06-06T10:00:00.000Z",
  },
  {
    id: "t14",
    content: "Refactor auth module",
    description: "Split the monolithic auth service into smaller units.",
    projectId: "inbox",
    priority: 2,
    dueDate: "2026-06-04",
    completed: true,
    labels: ["work"],
    order: 14,
    createdAt: "2026-05-29T10:00:00.000Z",
  },
  {
    id: "t15",
    content: "Schedule dentist",
    description: "Book the 6-month cleaning.",
    projectId: "inbox",
    priority: 4,
    dueDate: "2026-06-09",
    completed: false,
    labels: ["home"],
    order: 15,
    createdAt: "2026-06-07T10:00:00.000Z",
  },
]

let nextId = 16
export function makeId() {
  return `t${nextId++}`
}
