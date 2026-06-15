import { useMemo } from "react"
import { CirclePlus, Search } from "lucide-react"
import { useCommunities, useStories } from "@/queries/stories"
import { useUIStore } from "@/store/ui-store"
import type { FeedId, Story } from "@/lib/types"
import { SearchView } from "@/components/search-view"
import { StoryList } from "@/components/story-list"
import { RightRail } from "@/components/right-rail"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

function feedSelectValue(feed: FeedId) {
  if (feed === "all" || feed === "trending" || feed === "saved") return feed
  if (feed.startsWith("community:")) return feed
  return "all"
}

function sortStories(stories: Story[], mode: "top" | "new") {
  const sorted = [...stories]
  if (mode === "top") {
    return sorted.sort(
      (a, b) => b.diggCount + b.commentCount - (a.diggCount + a.commentCount)
    )
  }
  return sorted.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function MainView() {
  const feed = useUIStore((state) => state.feed)
  const setFeed = useUIStore((state) => state.setFeed)
  const feedSort = useUIStore((state) => state.feedSort)
  const setFeedSort = useUIStore((state) => state.setFeedSort)
  const setNewPostOpen = useUIStore((state) => state.setNewPostOpen)
  const toggleSearch = useUIStore((state) => state.toggleSearch)
  const { data: communities = [] } = useCommunities()
  const { data, isLoading } = useStories(feed === "search" ? "all" : feed)

  const stories = useMemo(
    () => sortStories(data?.stories ?? [], feedSort),
    [data?.stories, feedSort]
  )

  const chooseFeed = (value: string) => {
    setFeed(value as FeedId)
  }

  if (feed === "search") {
    return (
      <div className="flex h-full min-w-0">
        <SearchView />
        <RightRail />
      </div>
    )
  }

  return (
    <div className="flex h-full min-w-0">
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 px-6 pt-8 sm:px-10 lg:px-12">
          <div className="mx-auto flex max-w-[980px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center rounded-full bg-[#eceef3] p-1">
              <button
                onClick={() => setFeed("my-feed")}
                className={`h-12 rounded-full px-7 text-[17px] font-black ${
                  feed === "my-feed"
                    ? "bg-white text-[#15151c] shadow-sm"
                    : "text-[#5e6070]"
                }`}
              >
                My Feed
              </button>
              <Select value={feedSelectValue(feed)} onValueChange={chooseFeed}>
                <SelectTrigger className="h-12 min-w-[142px] rounded-full border-0 bg-white px-6 text-[17px] font-black shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Digg</SelectItem>
                  <SelectItem value="trending">Top Digg</SelectItem>
                  <SelectItem value="saved">Saved</SelectItem>
                  {communities.slice(0, 7).map((community) => (
                    <SelectItem
                      key={community.id}
                      value={`community:${community.id}`}
                    >
                      /{community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-5">
              <button
                aria-label="Search"
                title="Search"
                onClick={toggleSearch}
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#eceef3] text-[#3e404b]"
              >
                <Search className="size-6" />
              </button>
              <Button
                onClick={() => setNewPostOpen(true)}
                className="hidden h-14 rounded-full bg-[#111119] px-7 text-[17px] font-black text-white hover:bg-[#242431] sm:inline-flex"
              >
                <CirclePlus className="size-5" />
                New post
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-[980px] items-center gap-2">
            <button
              onClick={() => setFeedSort("top")}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                feedSort === "top"
                  ? "bg-[#17181f] text-white"
                  : "bg-[#eceef3] text-[#5e6070]"
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setFeedSort("new")}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                feedSort === "new"
                  ? "bg-[#17181f] text-white"
                  : "bg-[#eceef3] text-[#5e6070]"
              }`}
            >
              New
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-16 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-[980px]">
            <StoryList stories={stories} loading={isLoading} />
          </div>
        </div>
      </section>
      <RightRail />
    </div>
  )
}
