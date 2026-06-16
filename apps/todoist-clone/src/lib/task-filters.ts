import type { Priority, Task, ViewId } from "./types"
import { isOverdue, isToday, isUpcoming } from "./dates"

interface FilterOpts {
  activeLabels: string[]
  priorityFilter: Priority | null
  sortMode: "priority" | "date" | "name"
}

function matchesView(task: Task, view: ViewId): boolean {
  if (view === "completed") {
    // Completed view shows only completed tasks.
    return task.completed
  }

  if (task.completed) return false

  if (view === "inbox") return task.projectId === "inbox"
  if (view === "today") return isToday(task.dueDate) || isOverdue(task.dueDate)
  if (view === "upcoming") return isUpcoming(task.dueDate)
  if (view === "filters") return true
  if (view.startsWith("project:")) {
    return task.projectId === view.slice("project:".length)
  }
  return true
}

function sortTasks(tasks: Task[], mode: FilterOpts["sortMode"]): Task[] {
  const sorted = [...tasks]
  if (mode === "priority") {
    sorted.sort((a, b) => b.priority - a.priority)
  } else if (mode === "date") {
    sorted.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  } else if (mode === "name") {
    sorted.sort((a, b) => a.content.localeCompare(b.content))
  }
  return sorted
}

export function filterTasksForView(
  tasks: Task[],
  view: ViewId,
  opts: FilterOpts
): Task[] {
  let result = tasks.filter((t) => matchesView(t, view))

  if (view === "filters") {
    if (opts.activeLabels.length > 0) {
      result = result.filter((t) =>
        t.labels.some((l) => opts.activeLabels.includes(l))
      )
    }
    if (opts.priorityFilter != null) {
      result = result.filter((t) => t.priority === opts.priorityFilter)
    }
  }

  return sortTasks(result, opts.sortMode)
}

export function countToday(tasks: Task[]): number {
  return tasks.filter(
    (t) => !t.completed && (isToday(t.dueDate) || isOverdue(t.dueDate))
  ).length
}

export function countInbox(tasks: Task[]): number {
  return tasks.filter((t) => !t.completed && t.projectId === "inbox").length
}
