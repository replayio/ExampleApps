import {
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Filter,
  Hash,
  Inbox as InboxIcon,
  Lock,
  Plus,
  PanelLeft,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import { useProjects, useTasks } from "@/queries/tasks"
import { countInbox, countToday } from "@/lib/task-filters"
import type { ViewId } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function NavRow({
  icon,
  label,
  active,
  count,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <span className="flex size-5 items-center justify-center text-current">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {count != null && count > 0 && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </button>
  )
}

export function Sidebar() {
  // NOTE: subscribes to the entire store, so the whole sidebar re-renders on
  // every unrelated state change (e.g. each keystroke in search).
  const {
    view,
    setView,
    setAddTaskOpen,
    sidebarCollapsed,
    toggleSidebar,
    setSearchQuery,
  } = useUIStore()

  const { data: projects = [] } = useProjects()
  const { data: allTasks = [] } = useTasks("today") // fetches everything
  const todayCount = countToday(allTasks)
  const inboxCount = countInbox(allTasks)

  if (sidebarCollapsed) {
    return (
      <aside className="flex h-full w-12 flex-col items-center gap-3 border-r bg-muted/30 py-4">
        <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground">
          <PanelLeft className="size-5" />
        </button>
        <button
          onClick={() => setAddTaskOpen(true)}
          className="rounded-full bg-[#dc4c3e] p-1.5 text-white"
        >
          <Plus className="size-4" />
        </button>
      </aside>
    )
  }

  const go = (v: ViewId) => () => setView(v)

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted">
          <Avatar className="size-7">
            <AvatarFallback className="bg-[#dc4c3e] text-xs text-white">
              S
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">Samlee</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button className="relative rounded-md p-1.5 hover:bg-muted">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#dc4c3e]" />
          </button>
          <button onClick={toggleSidebar} className="rounded-md p-1.5 hover:bg-muted">
            <PanelLeft className="size-4" />
          </button>
        </div>
      </div>

      <div className="px-2">
        <button
          onClick={() => setAddTaskOpen(true)}
          className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-[#dc4c3e] hover:bg-muted"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-[#dc4c3e] text-white">
            <Plus className="size-3.5" />
          </span>
          Add task
        </button>

        <NavRow
          icon={<Search className="size-4" />}
          label="Search"
          active={view === "search"}
          onClick={() => {
            setSearchQuery("")
            setView("search")
          }}
        />
        <NavRow
          icon={<InboxIcon className="size-4" />}
          label="Inbox"
          count={inboxCount}
          active={view === "inbox"}
          onClick={go("inbox")}
        />
        <NavRow
          icon={<Calendar className="size-4 text-[#058527]" />}
          label="Today"
          count={todayCount}
          active={view === "today"}
          onClick={go("today")}
        />
        <NavRow
          icon={<CalendarDays className="size-4 text-[#692fc2]" />}
          label="Upcoming"
          active={view === "upcoming"}
          onClick={go("upcoming")}
        />
        <NavRow
          icon={<Filter className="size-4 text-[#eb8909]" />}
          label="Filters & Labels"
          active={view === "filters"}
          onClick={go("filters")}
        />
        <NavRow
          icon={<CheckCircle2 className="size-4 text-muted-foreground" />}
          label="Completed"
          active={view === "completed"}
          onClick={go("completed")}
        />
      </div>

      <div className="mt-4 px-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-medium text-muted-foreground">
            My Projects
          </span>
        </div>
        <div className="mt-1 space-y-0.5">
          {projects
            .filter((p) => p.id !== "inbox")
            .map((project) => (
              <button
                key={project.id}
                onClick={go(`project:${project.id}`)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                  view === `project:${project.id}`
                    ? "bg-primary/10 font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {project.emoji ? (
                  <span className="flex size-5 items-center justify-center text-xs">
                    {project.emoji}
                  </span>
                ) : (
                  <Hash className="size-4" style={{ color: project.color }} />
                )}
                <span className="min-w-0 flex-1 truncate text-left">
                  {project.name}
                </span>
                {!project.shared && project.id === "team-setup" && (
                  <Lock className="size-3 text-muted-foreground" />
                )}
              </button>
            ))}
        </div>
      </div>

      <div className="mt-auto px-3 py-3 text-xs text-muted-foreground">
        Help &amp; resources
      </div>
    </aside>
  )
}
