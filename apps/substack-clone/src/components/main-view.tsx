import { ChevronDown } from "lucide-react"
import { useDashboard } from "@/queries/substack"
import { useUIStore } from "@/store/ui-store"
import { FeedList } from "@/components/feed-list"
import { RightRail } from "@/components/right-rail"
import { SearchView } from "@/components/search-view"
import { EditorView } from "@/components/editor-view"

function PlaceholderView({ title }: { title: string }) {
  return (
    <section className="mx-auto flex h-full w-full max-w-[760px] flex-col justify-center px-8 text-center">
      <h1 className="text-4xl font-semibold">{title}</h1>
      <p className="mt-3 text-lg text-[#777]">
        This clone keeps the surface available while the main feed and editor
        carry the primary interactions.
      </p>
    </section>
  )
}

export function MainView() {
  const view = useUIStore((state) => state.view)
  const feedFilter = useUIStore((state) => state.feedFilter)
  const setFeedFilter = useUIStore((state) => state.setFeedFilter)
  const setComposerOpen = useUIStore((state) => state.setComposerOpen)
  const { data, isLoading } = useDashboard(feedFilter)

  if (view === "editor") return <EditorView draft={data?.draft} />
  if (view === "explore") {
    return (
      <div className="flex min-h-0 flex-1">
        <SearchView />
        <RightRail
          upNext={data?.upNext ?? []}
          bestsellers={data?.bestsellers ?? []}
        />
      </div>
    )
  }
  if (view !== "home") {
    return <PlaceholderView title={view[0].toUpperCase() + view.slice(1)} />
  }

  return (
    <div className="flex min-h-0 flex-1">
      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[760px] px-8 pb-16 pt-8">
          <button
            onClick={() => setComposerOpen(true)}
            className="flex h-[90px] w-full items-center gap-5 rounded-xl border border-[#ddd] bg-white px-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            <span className="flex size-12 rounded-full bg-[#ffb31a] ring-2 ring-[#0f8d73] ring-offset-2" />
            <span className="text-[23px] text-[#777]">What's on your mind?</span>
          </button>

          <div className="mt-7 flex items-center gap-2 text-[18px] font-semibold text-[#777]">
            <button
              onClick={() =>
                setFeedFilter(feedFilter === "for-you" ? "following" : "for-you")
              }
              className="flex items-center gap-1"
            >
              {feedFilter === "for-you"
                ? "For you"
                : feedFilter === "following"
                  ? "Following"
                  : "Saved"}
              <ChevronDown className="size-5" />
            </button>
            <button
              onClick={() => setFeedFilter("saved")}
              className="ml-auto rounded-full bg-[#f4f4f4] px-3 py-1 text-sm text-[#595959]"
            >
              Saved
            </button>
          </div>

          <FeedList posts={data?.posts ?? []} loading={isLoading} />
        </div>
      </section>

      <RightRail
        upNext={data?.upNext ?? []}
        bestsellers={data?.bestsellers ?? []}
      />
    </div>
  )
}
