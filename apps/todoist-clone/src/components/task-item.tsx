import { CalendarDays, Flag, MessageCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { PRIORITY_META, type Task } from "@/lib/types"
import { formatDueDate, isOverdue } from "@/lib/dates"
import { useUpdateTask } from "@/queries/tasks"
import { useUIStore } from "@/store/ui-store"

const LABEL_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  work: "#3b82f6",
  home: "#22c55e",
  waiting: "#eab308",
}

export function TaskItem({ task }: { task: Task }) {
  const selectTask = useUIStore((s) => s.selectTask)
  const update = useUpdateTask()
  const meta = PRIORITY_META[task.priority]
  const overdue = isOverdue(task.dueDate)

  return (
    <div className="group flex items-start gap-3 border-b py-2.5 pl-1 pr-2">
      <div className="mt-0.5">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() =>
            update.mutate({ id: task.id, patch: { completed: !task.completed } })
          }
          style={{ borderColor: meta.color }}
          aria-label="complete task"
        />
      </div>

      <button
        onClick={() => selectTask(task.id)}
        className="flex min-w-0 flex-1 flex-col items-start text-left"
      >
        <span
          className={cn(
            "text-sm leading-snug",
            task.completed && "text-muted-foreground line-through"
          )}
        >
          {task.content}
        </span>
        {task.description && (
          <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {task.description}
          </span>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                overdue ? "text-[#dc4c3e]" : "text-[#058527]"
              )}
            >
              <CalendarDays className="size-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {task.labels.map((label) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]"
              style={{
                backgroundColor: `${LABEL_COLORS[label] ?? "#888"}22`,
                color: LABEL_COLORS[label] ?? "#888",
              }}
            >
              {label}
            </span>
          ))}
          {task.priority < 4 && (
            <Flag className="size-3" style={{ color: meta.flag }} fill={meta.flag} />
          )}
        </div>
      </button>

      <MessageCircle className="mt-1 size-4 shrink-0 text-transparent group-hover:text-muted-foreground" />
    </div>
  )
}
