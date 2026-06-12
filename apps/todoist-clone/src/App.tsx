import { Sidebar } from "@/components/sidebar"
import { MainView } from "@/components/main-view"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { TaskDetailDialog } from "@/components/task-detail"

export function App() {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <MainView />
      </main>
      <AddTaskDialog />
      <TaskDetailDialog />
    </div>
  )
}

export default App
