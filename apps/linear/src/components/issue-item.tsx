import { cn } from "@/lib/utils"
import {
  PRIORITY_META,
  STATUS_META,
  type Issue,
} from "@/lib/types"
import { useUpdateIssue, useUsers } from "@/queries/issues"
import { useUIStore } from "@/store/ui-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function StatusIcon({ status }: { status: Issue["status"] }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border"
      style={{ borderColor: meta.color, backgroundColor: meta.bg }}
      title={meta.label}
    />
  )
}

function PriorityBars({ priority }: { priority: Issue["priority"] }) {
  if (priority === 0) return <span className="w-4" />
  const color = PRIORITY_META[priority].color
  return (
    <div className="flex w-4 flex-col gap-px" title={PRIORITY_META[priority].label}>
      {[4, 3, 2, 1].map((level) => (
        <span
          key={level}
          className="h-[3px] rounded-sm"
          style={{
            backgroundColor: level <= priority ? color : "#2a2a2c",
          }}
        />
      ))}
    </div>
  )
}

export function IssueItem({ issue }: { issue: Issue }) {
  const selectIssue = useUIStore((s) => s.selectIssue)
  const update = useUpdateIssue()
  const { data: users = [] } = useUsers()
  const assignee = users.find((u) => u.id === issue.assigneeId)
  const status = STATUS_META[issue.status]

  const cycleStatus = () => {
    const order: Issue["status"][] = [
      "backlog",
      "todo",
      "in_progress",
      "in_review",
      "done",
    ]
    const idx = order.indexOf(issue.status)
    const next = order[(idx + 1) % order.length]
    update.mutate({ id: issue.id, patch: { status: next } })
  }

  return (
    <div className="group flex items-center gap-3 border-b border-white/6 px-2 py-2 hover:bg-white/3">
      <button onClick={cycleStatus} className="shrink-0">
        <StatusIcon status={issue.status} />
      </button>

      <PriorityBars priority={issue.priority} />

      <button
        onClick={() => selectIssue(issue.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {issue.identifier}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px]",
            issue.status === "done" && "text-muted-foreground line-through"
          )}
        >
          {issue.title}
        </span>
        <span
          className="hidden shrink-0 rounded px-1.5 py-0.5 text-[11px] sm:inline"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {status.label}
        </span>
      </button>

      {assignee ? (
        <Avatar className="size-5 shrink-0">
          <AvatarFallback
            className="text-[9px] text-white"
            style={{ backgroundColor: assignee.color }}
          >
            {assignee.initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="size-5 shrink-0" />
      )}
    </div>
  )
}
