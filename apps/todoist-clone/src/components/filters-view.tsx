import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLabels } from "@/queries/tasks"
import { useUIStore } from "@/store/ui-store"
import { PRIORITY_META, type Priority, type Task } from "@/lib/types"
import { TaskList } from "@/components/task-list"

const PRIORITIES: Priority[] = [1, 2, 3, 4]

export function FiltersView({ tasks }: { tasks: Task[] }) {
  const { data: labels = [] } = useLabels()
  const activeLabels = useUIStore((s) => s.activeLabels)
  const toggleLabel = useUIStore((s) => s.toggleLabel)
  const priorityFilter = useUIStore((s) => s.priorityFilter)
  const setPriorityFilter = useUIStore((s) => s.setPriorityFilter)

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
            Labels
          </p>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => {
              const active = activeLabels.includes(label.id)
              return (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-transparent text-white"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  style={active ? { backgroundColor: label.color } : undefined}
                >
                  {label.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
            Priority
          </p>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() =>
                  setPriorityFilter(priorityFilter === p ? null : p)
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                  priorityFilter === p
                    ? "border-transparent bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Flag
                  className="size-3"
                  style={{ color: PRIORITY_META[p].flag }}
                  fill={PRIORITY_META[p].flag}
                />
                P{p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TaskList tasks={tasks} />
    </div>
  )
}
