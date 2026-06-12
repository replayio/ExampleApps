import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { api } from "@/lib/api"
import { useUIStore } from "@/store/ui-store"
import { StoryList } from "@/components/story-list"

export function SearchView() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const q = searchQuery.trim()
  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => api.search(q),
    enabled: q.length > 0,
    staleTime: 1000 * 60 * 3,
  })
  const results = q ? data?.results ?? [] : []

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="shrink-0 px-6 py-8 sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[980px] items-center gap-4 rounded-full bg-[#eceef3] px-6 py-4">
          <Search className="size-6 text-[#5e6070]" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Digg"
            className="min-w-0 flex-1 bg-transparent text-[20px] font-semibold outline-none placeholder:text-[#8a8b96]"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-16 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-[980px]">
          {!q ? (
            <div className="py-20 text-center text-sm font-medium text-[#777887]">
              Search stories, communities, and sources.
            </div>
          ) : (
            <StoryList stories={results} loading={isFetching && results.length === 0} />
          )}
        </div>
      </div>
    </section>
  )
}
