import { Plus, Settings, UserPlus } from "lucide-react"
import { useUIStore } from "@/store/ui-store"
import { useProjects, useTasks } from "@/queries/tasks"
import { filterTasksForView } from "@/lib/task-filters"
import { TaskList } from "@/components/task-list"
import { FiltersView } from "@/components/filters-view"
import { SearchView } from "@/components/search-view"
import { Button } from "@/components/ui/button"

function useViewTitle() {
  const view = useUIStore((s) => s.view)
  const { data: projects = [] } = useProjects()

  if (view.startsWith("project:")) {
    const id = view.slice("project:".length)
    const project = projects.find((p) => p.id === id)
    return { title: project?.name ?? "Project", emoji: project?.emoji }
  }
  const titles: Record<string, string> = {
    inbox: "Inbox",
    today: "Today",
    upcoming: "Upcoming",
    completed: "Completed",
    filters: "Filters & Labels",
    search: "Search",
  }
  return { title: titles[view] ?? "Tasks", emoji: undefined }
}

export function MainView() {
  const view = useUIStore((s) => s.view)
  const activeLabels = useUIStore((s) => s.activeLabels)
  const priorityFilter = useUIStore((s) => s.priorityFilter)
  const sortMode = useUIStore((s) => s.sortMode)
  const setAddTaskOpen = useUIStore((s) => s.setAddTaskOpen)
  const { title, emoji } = useViewTitle()

  const { data: tasks = [], isLoading } = useTasks(view)

  if (view === "search") {
    return <SearchView />
  }

  const filtered = filterTasksForView(tasks, view, {
    activeLabels,
    priorityFilter,
    sortMode,
  })

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <UserPlus className="size-4" /> Invite members
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <Settings className="size-4" /> Settings
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-8 pb-16">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            {emoji && <span>{emoji}</span>}
            {title}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setAddTaskOpen(true)}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>

        {view === "filters" ? (
          <FiltersView tasks={filtered} />
        ) : isLoading ? (
          <p className="py-10 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <button
              onClick={() => setAddTaskOpen(true)}
              className="mb-2 flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-[#dc4c3e]"
            >
              <Plus className="size-4 text-[#dc4c3e]" /> Add task
            </button>
            <TaskList tasks={filtered} />
          </>
        )}
      </div>
    </div>
  )
}
