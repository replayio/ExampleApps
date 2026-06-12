import { useState } from "react"
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
import { useCreateIssue, useProjects, useTeams } from "@/queries/issues"
import { PRIORITY_META, type Priority } from "@/lib/types"

export function AddIssueDialog() {
  const open = useUIStore((s) => s.addIssueOpen)
  const setOpen = useUIStore((s) => s.setAddIssueOpen)
  const view = useUIStore((s) => s.view)
  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()
  const create = useCreateIssue()

  const defaultTeamId = view.startsWith("team:")
    ? view.slice("team:".length)
    : view.startsWith("project:")
      ? projects.find((p) => p.id === view.slice("project:".length))?.teamId ?? "eng"
      : "eng"

  const defaultProjectId = view.startsWith("project:")
    ? view.slice("project:".length)
    : ""

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>(0)
  const [teamId, setTeamId] = useState(defaultTeamId)
  const [projectId, setProjectId] = useState(defaultProjectId)

  const teamProjects = projects.filter((p) => p.teamId === teamId)

  const reset = () => {
    setTitle("")
    setDescription("")
    setPriority(0)
    setTeamId(defaultTeamId)
    setProjectId(defaultProjectId)
  }

  const submit = () => {
    if (!title.trim()) return
    create.mutate(
      {
        title,
        description: description || null,
        priority,
        teamId,
        projectId: projectId || null,
        labelIds: [],
      },
      {
        onSuccess: () => {
          toast.success("Issue created")
          reset()
          setOpen(false)
        },
        onError: () => toast.error("Could not create issue"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] max-w-2xl translate-y-0 gap-0 border-white/10 bg-[#161618] p-0">
        <div className="p-4">
          <DialogTitle className="sr-only">New issue</DialogTitle>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit()
            }}
            placeholder="Issue title"
            className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description…"
            rows={3}
            className="mt-2 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select value={teamId} onValueChange={(v) => { setTeamId(v); setProjectId("") }}>
              <SelectTrigger size="sm" className="h-7 text-xs">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
              <SelectTrigger size="sm" className="h-7 text-xs">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {teamProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(priority)}
              onValueChange={(v) => setPriority(Number(v) as Priority)}
            >
              <SelectTrigger size="sm" className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {([0, 1, 2, 3, 4] as Priority[]).map((p) => (
                  <SelectItem key={p} value={String(p)}>
                    {PRIORITY_META[p].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/6 px-4 py-3">
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#5e6ad2] hover:bg-[#4f5bc4]"
            onClick={submit}
            disabled={!title.trim() || create.isPending}
          >
            Create issue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
