import { IssueItem } from "@/components/issue-item"
import type { Issue } from "@/lib/types"

export function IssueList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-sm text-muted-foreground">
        <p>No issues here.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {issues.map((issue) => (
        <IssueItem key={issue.id} issue={issue} />
      ))}
    </div>
  )
}
