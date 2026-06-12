import { Search } from "lucide-react"
import { useSearch } from "@/queries/substack"
import { useUIStore } from "@/store/ui-store"
import { FeedList } from "@/components/feed-list"

export function SearchView() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const query = searchQuery.trim()
  const { data, isFetching } = useSearch(query)

  return (
    <section className="mx-auto w-full max-w-[760px] px-8 py-8">
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#ddd] px-4">
        <Search className="size-7 text-[#242424]" />
        <input
          autoFocus
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search Substack"
          className="min-w-0 flex-1 bg-transparent text-xl outline-none"
        />
      </div>
      {!query ? (
        <div className="py-16 text-center text-[#777]">
          Search posts and publications.
        </div>
      ) : (
        <FeedList
          posts={data?.results ?? []}
          loading={isFetching && !data?.results}
        />
      )}
    </section>
  )
}
