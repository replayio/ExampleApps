import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { api } from "@/lib/api"
import { useUIStore } from "@/store/ui-store"
import type { Issue } from "@/lib/types"
import { IssueList } from "@/components/issue-list"

export function SearchView() {
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const [results, setResults] = useState<Issue[]>([])
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
    <div className="flex h-full flex-col bg-[#0d0d0d]">
      <div className="border-b border-white/6 px-6 py-4">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#161618] px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues by title or ID…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!searchQuery.trim() ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Search for issues by title or identifier.
          </p>
        ) : loading && results.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Searching…
          </p>
        ) : (
          <>
            <p className="mb-2 px-2 text-xs text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <IssueList issues={results} />
          </>
        )}
      </div>
    </div>
  )
}
