import { Sidebar } from "@/components/sidebar"
import { MainView } from "@/components/main-view"
import { ComposerDialog } from "@/components/composer-dialog"
import { PostDetailDialog } from "@/components/post-detail"
import { useUIStore } from "@/store/ui-store"

export function App() {
  const view = useUIStore((state) => state.view)
  const editor = view === "editor"

  return (
    <div className="flex h-svh w-full overflow-hidden bg-white text-[#242424]">
      {!editor && <Sidebar />}
      <main className="flex min-w-0 flex-1 flex-col">
        <MainView />
      </main>
      <ComposerDialog />
      <PostDetailDialog />
    </div>
  )
}

export default App
