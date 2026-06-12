import { Sidebar } from "@/components/sidebar"
import { MainView } from "@/components/main-view"
import { NewPostDialog } from "@/components/new-post-dialog"
import { StoryDetailDialog } from "@/components/story-detail"

export function App() {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-[#f8f8fa] text-[#121219]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <MainView />
      </main>
      <NewPostDialog />
      <StoryDetailDialog />
    </div>
  )
}

export default App
