import {
  Bookmark,
  ExternalLink,
  MessageCircle,
  Share2,
  Triangle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import type { Story, VoteState } from "@/lib/types"
import {
  useFeaturedStories,
  useStories,
  useToggleSaveStory,
  useVoteStory,
} from "@/queries/stories"
import { useUIStore } from "@/store/ui-store"
import { useSavedStore } from "@/store/saved-store"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function nextVote(current: VoteState, vote: VoteState) {
  return current === vote ? 0 : vote
}

function DetailBody({ story }: { story: Story }) {
  const vote = useVoteStory()
  const save = useToggleSaveStory()
  const isSaved = useSavedStore((state) => Boolean(state.stories[story.id]))

  const copyLink = async () => {
    await navigator.clipboard.writeText(story.url)
    toast.success("Link copied")
  }

  return (
    <div className="grid max-h-[84svh] overflow-hidden md:grid-cols-[1fr_340px]">
      <div className="min-h-0 overflow-y-auto p-6">
        <DialogTitle className="text-3xl font-black leading-tight">
          {story.title}
        </DialogTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#777887]">
          <img
            src={story.communityIcon}
            alt=""
            className="size-6 rounded-full object-cover"
          />
          <span>/{story.communityName}</span>
          <span>{timeAgo(story.publishedAt)}</span>
          <span>{story.domain}</span>
        </div>

        {story.imageUrl && (
          <img
            src={story.imageUrl}
            alt=""
            className="mt-6 aspect-[16/10] w-full rounded-[20px] object-cover"
          />
        )}

        <p className="mt-6 text-lg leading-8 text-[#555663]">{story.summary}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="rounded-full bg-[#111119] px-5 hover:bg-[#242431]"
          >
            <a href={story.url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Read source
            </a>
          </Button>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={copyLink}
          >
            <Share2 className="size-4" />
            Share
          </Button>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => save.mutate({ ...story, saved: isSaved })}
          >
            <Bookmark
              className="size-4"
              fill={isSaved ? "currentColor" : "none"}
            />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <aside className="border-t border-[#ececf1] bg-[#f8f8fa] p-6 md:border-l md:border-t-0">
        <div className="rounded-[20px] bg-white p-5">
          <div className="text-sm font-black uppercase tracking-wide text-[#777887]">
            Story Stats
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                vote.mutate({ story, vote: nextVote(story.userVote, 1) })
              }
              className={cn(
                "rounded-2xl border border-[#e4e4ea] p-4 text-left",
                story.userVote === 1 && "border-[#17181f]"
              )}
            >
              <Triangle
                className="size-5"
                fill={story.userVote === 1 ? "currentColor" : "none"}
              />
              <div className="mt-3 text-2xl font-black">{story.diggCount}</div>
              <div className="text-sm text-[#777887]">diggs</div>
            </button>
            <div className="rounded-2xl border border-[#e4e4ea] p-4">
              <MessageCircle className="size-5" />
              <div className="mt-3 text-2xl font-black">{story.commentCount}</div>
              <div className="text-sm text-[#777887]">comments</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#eef0f4] px-3 py-1 text-sm font-semibold text-[#555663]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

export function StoryDetailDialog() {
  const feed = useUIStore((state) => state.feed)
  const searchQuery = useUIStore((state) => state.searchQuery)
  const selectedStoryId = useUIStore((state) => state.selectedStoryId)
  const selectStory = useUIStore((state) => state.selectStory)
  const { data } = useStories(feed === "search" ? "search" : feed, searchQuery)
  const { data: featured = [] } = useFeaturedStories()
  const story =
    data?.stories.find((item) => item.id === selectedStoryId) ??
    featured.find((item) => item.id === selectedStoryId)

  return (
    <Dialog
      open={selectedStoryId != null}
      onOpenChange={(open) => !open && selectStory(null)}
    >
      <DialogContent className="max-w-5xl gap-0 overflow-hidden rounded-[28px] p-0">
        {story ? (
          <DetailBody story={story} />
        ) : (
          <div className="p-6 text-sm text-[#777887]">
            <DialogTitle>Story</DialogTitle>
            Story not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
