import { Sidebar } from "@/components/sidebar"
import { MainView } from "@/components/main-view"
import { AddIssueDialog } from "@/components/add-issue-dialog"
import { IssueDetailDialog } from "@/components/issue-detail"

export function App() {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-[#0d0d0d] text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <MainView />
      </main>
      <AddIssueDialog />
      <IssueDetailDialog />
    </div>
  )
}

export default App
