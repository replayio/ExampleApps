import { useState } from "react"
import {
  Bookmark,
  ExternalLink,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Triangle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import type { Story, VoteState } from "@/lib/types"
import { useToggleSaveStory, useVoteStory } from "@/queries/stories"
import { useUIStore } from "@/store/ui-store"
import { useSavedStore } from "@/store/saved-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function voteFor(current: VoteState, next: VoteState) {
  return current === next ? 0 : next
}

export function StoryCard({ story }: { story: Story }) {
  const [imageFailed, setImageFailed] = useState(false)
  const selectStory = useUIStore((state) => state.selectStory)
  const vote = useVoteStory()
  const save = useToggleSaveStory()
  // Saved state is tracked client-side (the serverless feed API is stateless),
  // so reflect the locally-persisted saved set rather than the server flag.
  const isSaved = useSavedStore((state) => Boolean(state.stories[story.id]))
  const hasImage = story.imageUrl && !imageFailed

  const copyLink = async () => {
    await navigator.clipboard.writeText(story.url)
    toast.success("Link copied")
  }

  return (
    <article className="group border-b border-[#e8e8ee] py-8">
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-[17px] font-semibold text-[#121219]">
            <img
              src={story.communityIcon}
              alt=""
              className="size-5 rounded-full object-cover"
            />
            <button
              className="hover:underline"
              onClick={() => selectStory(story.id)}
            >
              /{story.communityName}
            </button>
          </div>

          <button
            onClick={() => selectStory(story.id)}
            className="block text-left"
          >
            <h2 className="max-w-[620px] text-[25px] font-black leading-[1.13] tracking-normal text-[#101017] transition-colors group-hover:text-[#363642]">
              {story.title}
            </h2>
            <p className="mt-2 max-w-[680px] text-[18px] leading-7 text-[#5d5e69] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
              {story.summary}
            </p>
          </button>
        </div>

        <div className="flex w-10 shrink-0 justify-end pt-1 text-[16px] text-[#5d5e69]">
          {timeAgo(story.publishedAt)}
        </div>

        {hasImage && (
          <button
            onClick={() => selectStory(story.id)}
            className="relative mt-2 hidden h-[174px] w-[344px] shrink-0 overflow-hidden rounded-[18px] bg-[#ececf1] shadow-[0_20px_40px_rgba(20,20,24,0.12)] lg:block"
          >
            <img
              src={story.imageUrl ?? ""}
              alt={story.title}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-2 right-2 max-w-[80%] truncate rounded-md bg-[#1a1a20]/75 px-2 py-1 text-[15px] font-semibold text-white backdrop-blur">
              {story.domain}
            </span>
          </button>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-5 text-[18px] text-[#676878]">
          <button
            aria-label="Digg story"
            onClick={() =>
              vote.mutate({ story, vote: voteFor(story.userVote, 1) })
            }
            className={cn(
              "flex items-center gap-2 transition-colors hover:text-[#17181f]",
              story.userVote === 1 && "font-semibold text-[#17181f]"
            )}
          >
            <Triangle
              className="size-5"
              fill={story.userVote === 1 ? "currentColor" : "none"}
            />
            <span>{story.diggCount}</span>
          </button>
          <button
            aria-label="Bury story"
            onClick={() =>
              vote.mutate({ story, vote: voteFor(story.userVote, -1) })
            }
            className={cn(
              "transition-colors hover:text-[#17181f]",
              story.userVote === -1 && "text-[#17181f]"
            )}
          >
            <Triangle
              className="size-5 rotate-180"
              fill={story.userVote === -1 ? "currentColor" : "none"}
            />
          </button>
          <button
            aria-label="View comments"
            onClick={() => selectStory(story.id)}
            className="flex items-center gap-2 transition-colors hover:text-[#17181f]"
          >
            <MessageCircle className="size-5" />
            <span>{story.commentCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-[#676878]">
          <a
            href={story.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open source"
            className="transition-colors hover:text-[#17181f]"
          >
            <ExternalLink className="size-5" />
          </a>
          <button
            aria-label="Save story"
            onClick={() => save.mutate({ ...story, saved: isSaved })}
            className={cn(
              "transition-colors hover:text-[#17181f]",
              isSaved && "text-[#17181f]"
            )}
          >
            <Bookmark className="size-5" fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            aria-label="Share story"
            onClick={copyLink}
            className="transition-colors hover:text-[#17181f]"
          >
            <Share2 className="size-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="More"
              title="More"
              className="transition-colors hover:text-[#17181f]"
            >
              <MoreHorizontal className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => selectStory(story.id)}>
                View story
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>Copy link</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => save.mutate({ ...story, saved: isSaved })}
              >
                {isSaved ? "Remove from saved" : "Save story"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={story.url} target="_blank" rel="noreferrer">
                  Open source
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  )
}
