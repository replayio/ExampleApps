import { Filter } from "lucide-react"
import {
  PRIORITY_META,
  STATUS_META,
  type IssueStatus,
  type Priority,
  type User,
} from "@/lib/types"
import {
  countActiveFilters,
  type IssueFilters,
} from "@/lib/issue-filters"
import { useUIStore } from "@/store/ui-store"
import { useUsers } from "@/queries/issues"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getContrastTextColor } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const STATUS_OPTIONS = Object.keys(STATUS_META) as IssueStatus[]
const PRIORITY_OPTIONS = [1, 2, 3, 4, 0] as Priority[]

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value]
}

function FilterRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/5">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <span className="flex min-w-0 flex-1 items-center gap-2 text-[13px]">
        {children}
      </span>
    </label>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      {children}
    </div>
  )
}

export function IssueFilterPopover() {
  const filters = useUIStore((s) => s.filters)
  const setFilters = useUIStore((s) => s.setFilters)
  const clearFilters = useUIStore((s) => s.clearFilters)
  const { data: users = [], isLoading: usersLoading } = useUsers()

  const activeCount = countActiveFilters(filters)

  const update = (patch: Partial<IssueFilters>) =>
    setFilters({ ...filters, ...patch })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
        >
          <Filter className="size-3.5" /> Filter
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5e6ad2] px-1 text-[10px] font-medium text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium">Filter issues</p>
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <FilterSection title="Status">
          {STATUS_OPTIONS.map((status) => (
            <FilterRow
              key={status}
              checked={filters.statuses.includes(status)}
              onToggle={() =>
                update({ statuses: toggle(filters.statuses, status) })
              }
            >
              <span
                className="size-3 shrink-0 rounded-full border"
                style={{
                  borderColor: STATUS_META[status].color,
                  backgroundColor: STATUS_META[status].bg,
                }}
              />
              {STATUS_META[status].label}
            </FilterRow>
          ))}
        </FilterSection>

        <Separator />

        <FilterSection title="Priority">
          {PRIORITY_OPTIONS.map((priority) => (
            <FilterRow
              key={priority}
              checked={filters.priorities.includes(priority)}
              onToggle={() =>
                update({ priorities: toggle(filters.priorities, priority) })
              }
            >
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: PRIORITY_META[priority].color }}
              />
              {PRIORITY_META[priority].label}
            </FilterRow>
          ))}
        </FilterSection>

        <Separator />

        <FilterSection title="Assignee">
          {usersLoading ? (
            <p className="px-1.5 py-1 text-xs text-muted-foreground">
              Loading assignees…
            </p>
          ) : users.length === 0 ? (
            <p className="px-1.5 py-1 text-xs text-muted-foreground">
              No assignees available.
            </p>
          ) : (
            users.map((user: User) => (
              <FilterRow
                key={user.id}
                checked={filters.assigneeIds.includes(user.id)}
                onToggle={() =>
                  update({ assigneeIds: toggle(filters.assigneeIds, user.id) })
                }
              >
                <Avatar className="size-4 shrink-0">
                  <AvatarFallback
                    className="text-[8px]"
                    style={{
                      backgroundColor: user.color,
                      color: getContrastTextColor(user.color),
                    }}
                  >
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user.name}</span>
              </FilterRow>
            ))
          )}
        </FilterSection>
      </PopoverContent>
    </Popover>
  )
}

