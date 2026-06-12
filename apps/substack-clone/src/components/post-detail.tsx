import { Heart, MessageCircle, Repeat2 } from "lucide-react"
import { compactNumber, relativeDate } from "@/lib/format"
import type { FeedPost } from "@/lib/types"
import { useDashboard, useLikePost, useRestackPost } from "@/queries/substack"
import { useUIStore } from "@/store/ui-store"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function PostDetailDialog() {
  const feedFilter = useUIStore((state) => state.feedFilter)
  const selectedPostId = useUIStore((state) => state.selectedPostId)
  const selectPost = useUIStore((state) => state.selectPost)
  const { data } = useDashboard(feedFilter)
  const like = useLikePost()
  const restack = useRestackPost()
  const allPosts: FeedPost[] = [...(data?.posts ?? []), ...(data?.upNext ?? [])]
  const post = allPosts.find((item) => item.id === selectedPostId)

  return (
    <Dialog
      open={selectedPostId != null}
      onOpenChange={(open) => !open && selectPost(null)}
    >
      <DialogContent className="max-h-[86svh] max-w-3xl overflow-y-auto rounded-2xl p-0">
        {post ? (
          <div className="p-7">
            <DialogTitle className="text-3xl font-semibold leading-tight">
              {post.title ?? post.publicationName}
            </DialogTitle>
            <div className="mt-4 flex items-center gap-3 text-[#777]">
              <img
                src={post.avatarUrl}
                alt=""
                className="size-11 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-[#242424]">{post.author}</div>
                <div>{relativeDate(post.publishedAt)} · {post.readMinutes}m read</div>
              </div>
            </div>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt=""
                className="mt-7 max-h-[520px] w-full rounded-xl object-cover"
              />
            )}
            <p className="mt-7 whitespace-pre-line text-xl leading-8 text-[#303030]">
              {post.body}
            </p>
            <div className="mt-8 flex gap-3">
              <Button variant="secondary" onClick={() => like.mutate(post)}>
                <Heart className="size-4" /> {compactNumber(post.likes)}
              </Button>
              <Button variant="secondary">
                <MessageCircle className="size-4" /> {post.comments}
              </Button>
              <Button variant="secondary" onClick={() => restack.mutate(post)}>
                <Repeat2 className="size-4" /> {post.restacks}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-7 text-[#777]">
            <DialogTitle>Post</DialogTitle>
            Post not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
