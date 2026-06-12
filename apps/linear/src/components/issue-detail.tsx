import { Trash2 } from "lucide-react"
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
import {
  useDeleteIssue,
  useIssues,
  useLabels,
  useProjects,
  useTeams,
  useUpdateIssue,
  useUsers,
} from "@/queries/issues"
import {
  PRIORITY_META,
  STATUS_META,
  type Issue,
  type IssueStatus,
  type Priority,
} from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function DetailBody({ issue }: { issue: Issue }) {
  const { data: teams = [] } = useTeams()
  const { data: projects = [] } = useProjects()
  const { data: users = [] } = useUsers()
  const { data: labels = [] } = useLabels()
  const update = useUpdateIssue()
  const remove = useDeleteIssue()
  const selectIssue = useUIStore((s) => s.selectIssue)

  const team = teams.find((t) => t.id === issue.teamId)
  const project = projects.find((p) => p.id === issue.projectId)
  const assignee = users.find((u) => u.id === issue.assigneeId)
  const status = STATUS_META[issue.status]

  return (
    <div className="flex flex-col gap-4 p-5">
      <DialogTitle className="sr-only">{issue.title}</DialogTitle>

      <div className="flex items-start gap-3">
        <span className="font-mono text-sm text-muted-foreground">
          {issue.identifier}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-xs"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {status.label}
        </span>
      </div>

      <h2 className="text-lg font-semibold">{issue.title}</h2>
      <p className="text-sm text-muted-foreground">
        {issue.description || "No description"}
      </p>

      <div className="grid grid-cols-[100px_1fr] gap-y-3 border-t border-white/6 pt-4 text-sm">
        <span className="text-muted-foreground">Status</span>
        <Select
          value={issue.status}
          onValueChange={(v) =>
            update.mutate({ id: issue.id, patch: { status: v as IssueStatus } })
          }
        >
          <SelectTrigger size="sm" className="h-7 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <SelectItem key={key} value={key}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">Priority</span>
        <Select
          value={String(issue.priority)}
          onValueChange={(v) =>
            update.mutate({
              id: issue.id,
              patch: { priority: Number(v) as Priority },
            })
          }
        >
          <SelectTrigger size="sm" className="h-7 w-40">
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

        <span className="text-muted-foreground">Team</span>
        <span>{team?.name ?? "—"}</span>

        <span className="text-muted-foreground">Project</span>
        <span>{project?.name ?? "No project"}</span>

        <span className="text-muted-foreground">Assignee</span>
        <Select
          value={issue.assigneeId ?? "none"}
          onValueChange={(v) =>
            update.mutate({
              id: issue.id,
              patch: { assigneeId: v === "none" ? null : v },
            })
          }
        >
          <SelectTrigger size="sm" className="h-7 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">Labels</span>
        <span className="flex flex-wrap gap-1.5">
          {issue.labelIds.length > 0
            ? issue.labelIds.map((id) => {
                const label = labels.find((l) => l.id === id)
                return label ? (
                  <span
                    key={id}
                    className="rounded px-1.5 py-0.5 text-xs"
                    style={{
                      color: label.color,
                      backgroundColor: `${label.color}22`,
                    }}
                  >
                    {label.name}
                  </span>
                ) : null
              })
            : "—"}
        </span>
      </div>

      {assignee && (
        <div className="flex items-center gap-2 border-t border-white/6 pt-3 text-sm">
          <Avatar className="size-6">
            <AvatarFallback
              className="text-[10px] text-white"
              style={{ backgroundColor: assignee.color }}
            >
              {assignee.initials}
            </AvatarFallback>
          </Avatar>
          <span>{assignee.name}</span>
        </div>
      )}

      <div className="flex justify-end border-t border-white/6 pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-[#eb5757]"
          onClick={() =>
            remove.mutate(issue.id, { onSuccess: () => selectIssue(null) })
          }
        >
          <Trash2 className="size-4" /> Delete
        </Button>
      </div>
    </div>
  )
}

export function IssueDetailDialog() {
  const selectedIssueId = useUIStore((s) => s.selectedIssueId)
  const selectIssue = useUIStore((s) => s.selectIssue)
  const { data: issues = [] } = useIssues("active")
  const issue = issues.find((i) => i.id === selectedIssueId)

  return (
    <Dialog
      open={selectedIssueId != null}
      onOpenChange={(open) => !open && selectIssue(null)}
    >
      <DialogContent className="max-w-xl gap-0 border-white/10 bg-[#161618] p-0">
        {issue ? (
          <DetailBody issue={issue} />
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            <DialogTitle className="sr-only">Issue</DialogTitle>
            Issue not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
