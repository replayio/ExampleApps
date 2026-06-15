import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { compactNumber, relativeDate } from "@/lib/format"
import type { FeedPost } from "@/lib/types"
import {
  useLikePost,
  useRestackPost,
  useSavePost,
  useSubscribe,
} from "@/queries/substack"
import { useUIStore } from "@/store/ui-store"

export function PostCard({ post }: { post: FeedPost }) {
  const like = useLikePost()
  const restack = useRestackPost()
  const save = useSavePost()
  const subscribe = useSubscribe()
  const selectPost = useUIStore((state) => state.selectPost)

  return (
    <article className="grid grid-cols-[48px_1fr] gap-4 border-b border-[#e5e1dc] py-7">
      <img
        src={post.avatarUrl}
        alt=""
        className="size-12 rounded-full object-cover"
      />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[17px]">
              <span className="font-semibold text-[#2b2b2b]">{post.author}</span>
              <span className="text-[#777]">{relativeDate(post.publishedAt)}</span>
            </div>
            {post.title && (
              <button
                onClick={() => selectPost(post.id)}
                className="mt-1 block text-left text-[22px] font-semibold leading-tight text-[#242424]"
              >
                {post.title}
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!post.subscribed && (
              <button
                onClick={() => subscribe.mutate(post.publicationId)}
                className="text-[16px] font-bold text-[#c2410c]"
              >
                Subscribe
              </button>
            )}
            <button className="text-[#8a8a8a]" aria-label="More">
              <MoreHorizontal className="size-5" />
            </button>
          </div>
        </div>

        <button
          onClick={() => selectPost(post.id)}
          className="mt-1 block w-full text-left"
        >
          <p className="whitespace-pre-line text-[20px] leading-7 text-[#303030]">
            {post.body}
          </p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              width={470}
              height={313}
              className="mt-6 aspect-[470/313] max-h-[620px] w-full max-w-[470px] rounded-lg object-cover"
            />
          )}
        </button>

        <div className="mt-5 flex items-center gap-7 text-[#777]">
          <button
            onClick={() => like.mutate(post)}
            className={cn(
              "flex items-center gap-2 hover:text-[#ff6719]",
              post.liked && "text-[#ff6719]"
            )}
            aria-label="Like post"
          >
            <Heart className="size-6" fill={post.liked ? "currentColor" : "none"} />
            <span>{compactNumber(post.likes)}</span>
          </button>
          <button
            onClick={() => selectPost(post.id)}
            className="flex items-center gap-2 hover:text-[#242424]"
            aria-label="Comments"
          >
            <MessageCircle className="size-6" />
            <span>{post.comments}</span>
          </button>
          <button
            onClick={() => restack.mutate(post)}
            className="flex items-center gap-2 hover:text-[#242424]"
            aria-label="Restack post"
          >
            <Repeat2 className="size-6" />
            <span>{post.restacks}</span>
          </button>
          <button
            onClick={() => save.mutate(post)}
            className={cn("hover:text-[#242424]", post.saved && "text-[#242424]")}
            aria-label="Save post"
          >
            <Share className="size-6" />
          </button>
        </div>
      </div>
    </article>
  )
}
