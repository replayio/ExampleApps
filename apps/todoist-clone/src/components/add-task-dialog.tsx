import { useState } from "react"
import { CalendarDays, Flag, Inbox } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUIStore } from "@/store/ui-store"
import { useCreateTask, useProjects } from "@/queries/tasks"
import { PRIORITY_META, type Priority } from "@/lib/types"

export function AddTaskDialog() {
  const open = useUIStore((s) => s.addTaskOpen)
  const setOpen = useUIStore((s) => s.setAddTaskOpen)
  const view = useUIStore((s) => s.view)
  const { data: projects = [] } = useProjects()
  const create = useCreateTask()

  const [content, setContent] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>(4)
  const [dueDate, setDueDate] = useState("")
  const [projectId, setProjectId] = useState(
    view.startsWith("project:") ? view.slice("project:".length) : "inbox"
  )

  const reset = () => {
    setContent("")
    setDescription("")
    setPriority(4)
    setDueDate("")
  }

  const submit = () => {
    if (!content.trim()) return
    create.mutate(
      {
        content,
        description: description || null,
        priority,
        dueDate: dueDate || null,
        projectId,
        labels: [],
      },
      {
        onSuccess: () => {
          toast.success("Task added")
          reset()
          setOpen(false)
        },
        onError: () => toast.error("Could not add task"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-2xl translate-y-0 gap-0 p-0">
        <div className="p-4">
          <DialogTitle className="sr-only">Add task</DialogTitle>
          <input
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit()
            }}
            placeholder="Task name"
            className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="mt-2 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent outline-none"
              />
            </label>

            <Select
              value={String(priority)}
              onValueChange={(v) => setPriority(Number(v) as Priority)}
            >
              <SelectTrigger size="sm" className="h-7 text-xs">
                <Flag
                  className="size-3.5"
                  style={{ color: PRIORITY_META[priority].flag }}
                  fill={PRIORITY_META[priority].flag}
                />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {([1, 2, 3, 4] as Priority[]).map((p) => (
                  <SelectItem key={p} value={String(p)}>
                    Priority {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger size="sm" className="h-8 text-sm">
              <Inbox className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#dc4c3e] hover:bg-[#c43d30]"
              onClick={submit}
              disabled={!content.trim() || create.isPending}
            >
              Add task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
