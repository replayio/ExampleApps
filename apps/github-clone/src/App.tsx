import { useState } from "react"

import { useRoute } from "@/lib/router"
import { AppHeader } from "@/components/app-header"
import { MirrorDialog } from "@/components/mirror-dialog"
import { Dashboard } from "@/pages/dashboard"
import { RepoPage } from "@/pages/repo"

export default function App() {
  const route = useRoute()
  const [mirrorOpen, setMirrorOpen] = useState(false)
  const openMirror = () => setMirrorOpen(true)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onMirror={openMirror} />
      {route.kind === "dashboard" ? (
        <Dashboard onMirror={openMirror} />
      ) : (
        <RepoPage
          key={`${route.owner}/${route.name}`}
          owner={route.owner}
          name={route.name}
          view={route.view}
          path={route.path}
        />
      )}
      <MirrorDialog open={mirrorOpen} onOpenChange={setMirrorOpen} />
    </div>
  )
}
