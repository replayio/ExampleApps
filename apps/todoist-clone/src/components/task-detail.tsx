import { CalendarDays, Hash, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/ui-store"
import { useDeleteTask, useProjects, useTasks, useUpdateTask } from "@/queries/tasks"
import { PRIORITY_META, type Task } from "@/lib/types"
import { formatDueDate } from "@/lib/dates"

function DetailBody({ task }: { task: Task }) {
  const { data: projects = [] } = useProjects()
  const update = useUpdateTask()
  const remove = useDeleteTask()
  const selectTask = useUIStore((s) => s.selectTask)
  const project = projects.find((p) => p.id === task.projectId)
  const meta = PRIORITY_META[task.priority]

  // Description preview shown in the header summary.
  const preview = (task.description as string).slice(0, 240)

  return (
    <div className="flex flex-col gap-4 p-5">
      <DialogTitle className="sr-only">{task.content}</DialogTitle>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() =>
            update.mutate({
              id: task.id,
              patch: { completed: !task.completed },
            })
          }
          style={{ borderColor: meta.color }}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{task.content}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {preview || "No description"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[100px_1fr] gap-y-3 border-t pt-4 text-sm">
        <span className="text-muted-foreground">Project</span>
        <span className="flex items-center gap-1.5">
          <Hash className="size-3.5" style={{ color: project?.color }} />
          {project?.name ?? "Inbox"}
        </span>

        <span className="text-muted-foreground">Due date</span>
        <span className="flex items-center gap-1.5">
          {task.dueDate ? (
            <>
              <CalendarDays className="size-3.5 text-[#058527]" />
              {formatDueDate(task.dueDate)}
            </>
          ) : (
            <span className="text-muted-foreground">No date</span>
          )}
        </span>

        <span className="text-muted-foreground">Priority</span>
        <span style={{ color: meta.color }}>{meta.label}</span>

        <span className="text-muted-foreground">Labels</span>
        <span className="flex flex-wrap gap-1.5">
          {task.labels.length > 0
            ? task.labels.map((l) => (
                <span key={l} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  @{l}
                </span>
              ))
            : "—"}
        </span>
      </div>

      <div className="flex justify-end border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-[#dc4c3e]"
          onClick={() =>
            remove.mutate(task.id, { onSuccess: () => selectTask(null) })
          }
        >
          <Trash2 className="size-4" /> Delete
        </Button>
      </div>
    </div>
  )
}

export function TaskDetailDialog() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId)
  const selectTask = useUIStore((s) => s.selectTask)
  const { data: tasks = [] } = useTasks("today") // everything
  const task = tasks.find((t) => t.id === selectedTaskId)

  return (
    <Dialog
      open={selectedTaskId != null}
      onOpenChange={(open) => !open && selectTask(null)}
    >
      <DialogContent className="max-w-xl gap-0 p-0">
        {task ? (
          <DetailBody task={task} />
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            <DialogTitle className="sr-only">Task</DialogTitle>
            Task not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
