import {
  CircleDot,
  Inbox,
  LayoutGrid,
  PanelLeft,
  Plus,
  Search,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import { useIssues, useProjects, useTeams } from "@/queries/issues"
import { countInbox, countMyIssues } from "@/lib/issue-filters"
import type { ViewId } from "@/lib/types"

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
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
        active
          ? "bg-white/8 font-medium text-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
    >
      <span className="flex size-4 items-center justify-center">{icon}</span>
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
  const {
    view,
    setView,
    setAddIssueOpen,
    sidebarCollapsed,
    toggleSidebar,
    setSearchQuery,
  } = useUIStore()

  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()
  const { data: allIssues = [] } = useIssues("active")
  const inboxCount = countInbox(allIssues)
  const myCount = countMyIssues(allIssues)

  if (sidebarCollapsed) {
    return (
      <aside className="flex h-full w-12 flex-col items-center gap-3 border-r border-white/6 bg-[#161618] py-4">
        <button
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
        <button
          onClick={() => setAddIssueOpen(true)}
          className="rounded-md bg-[#5e6ad2] p-1.5 text-white hover:bg-[#4f5bc4]"
        >
          <Plus className="size-4" />
        </button>
      </aside>
    )
  }

  const go = (v: ViewId) => () => setView(v)

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-white/6 bg-[#161618]">
      <div className="flex items-center justify-between px-3 py-3">
        <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/5">
          <div className="flex size-6 items-center justify-center rounded-md bg-[#5e6ad2] text-[11px] font-bold text-white">
            L
          </div>
          <span className="text-sm font-medium">Linear</span>
        </button>
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>

      <div className="px-2">
        <button
          onClick={() => setAddIssueOpen(true)}
          className="mb-1 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <Plus className="size-4" />
          New issue
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
          icon={<Inbox className="size-4" />}
          label="Inbox"
          count={inboxCount}
          active={view === "inbox"}
          onClick={go("inbox")}
        />
        <NavRow
          icon={<User className="size-4" />}
          label="My issues"
          count={myCount}
          active={view === "my-issues"}
          onClick={go("my-issues")}
        />
        <NavRow
          icon={<LayoutGrid className="size-4" />}
          label="Active"
          active={view === "active"}
          onClick={go("active")}
        />
      </div>

      <div className="mt-4 px-2">
        <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Your teams
        </div>
        <div className="mt-1 space-y-0.5">
          {teams.map((team) => (
            <div key={team.id}>
              <button
                onClick={go(`team:${team.id}`)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                  view === `team:${team.id}`
                    ? "bg-white/8 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <CircleDot className="size-4" style={{ color: "#5e6ad2" }} />
                <span className="min-w-0 flex-1 truncate text-left">
                  {team.name}
                </span>
              </button>
              {projects
                .filter((p) => p.teamId === team.id)
                .map((project) => (
                  <button
                    key={project.id}
                    onClick={go(`project:${project.id}`)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md py-1 pl-7 pr-2 text-[13px] transition-colors",
                      view === `project:${project.id}`
                        ? "bg-white/8 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {project.icon ? (
                      <span className="text-xs">{project.icon}</span>
                    ) : (
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-left">
                      {project.name}
                    </span>
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
