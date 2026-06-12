import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { api } from "@/lib/api"
import { useUIStore } from "@/store/ui-store"
import type { Task } from "@/lib/types"
import { TaskList } from "@/components/task-list"

export function SearchView() {
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const [results, setResults] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setResults([])
      return
    }
    setLoading(true)
    api.search(q).then((res) => {
      setResults(res.results)
      setLoading(false)
    })
  }, [searchQuery])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-8 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-8 py-4">
        {!searchQuery.trim() ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Search for tasks by name.
          </p>
        ) : loading && results.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Searching…
          </p>
        ) : (
          <>
            <p className="mb-2 text-xs text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <TaskList tasks={results} />
          </>
        )}
      </div>
    </div>
  )
}
