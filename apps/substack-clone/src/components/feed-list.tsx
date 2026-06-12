import type { FeedPost } from "@/lib/types"
import { PostCard } from "@/components/post-card"

export function FeedList({
  posts,
  loading,
}: {
  posts: FeedPost[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="py-16 text-center text-sm font-medium text-[#777]">
        Loading posts...
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-sm font-medium text-[#777]">
        No posts here yet.
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
