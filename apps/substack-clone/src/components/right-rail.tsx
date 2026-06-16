import { Bookmark, CheckCircle2, Search } from "lucide-react"
import { truncate } from "@/lib/format"
import type { FeedPost, Publication } from "@/lib/types"
import { useSubscribe } from "@/queries/substack"
import { useUIStore } from "@/store/ui-store"

function UpNextItem({ post }: { post: FeedPost }) {
  const selectPost = useUIStore((state) => state.selectPost)

  return (
    <button
      onClick={() => selectPost(post.id)}
      className="grid w-full grid-cols-[1fr_64px] gap-4 border-b border-[#e5e1dc] py-5 text-left last:border-b-0"
    >
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-[16px] text-[#777]">
          <img src={post.avatarUrl} alt="" className="size-5 rounded object-cover" />
          <span>{post.publicationName}</span>
        </div>
        <h3 className="text-[20px] font-medium leading-tight text-[#242424]">
          {post.title ?? truncate(post.body, 56)}
        </h3>
        <p className="mt-2 text-[16px] text-[#777]">
          {post.readMinutes}m read · {post.likes.toLocaleString()} likes
          {post.comments > 0 ? ` · ${post.comments} comments` : ""}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <Bookmark className="size-5 text-[#777]" />
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="size-16 rounded-lg object-cover"
          />
        )}
      </div>
    </button>
  )
}

function BestsellerRow({ publication }: { publication: Publication }) {
  const subscribe = useSubscribe()

  return (
    <div className="grid grid-cols-[22px_48px_1fr_auto] items-center gap-3">
      <div className="text-[16px] font-semibold">{publication.rank}</div>
      <img
        src={publication.avatarUrl}
        alt=""
        className="size-12 rounded-full object-cover"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <h3 className="truncate text-[18px] font-medium text-[#242424]">
            {publication.name}
          </h3>
          {publication.verified && (
            <CheckCircle2 className="size-5 shrink-0 text-[#ff6719]" />
          )}
        </div>
        <p className="truncate text-[16px] text-[#777]">{publication.subtitle}</p>
      </div>
      <button
        onClick={() => subscribe.mutate(publication.id)}
        className="rounded-lg bg-[#ffe0d0] px-3 py-2 text-[16px] font-bold text-[#9a3412]"
      >
        {publication.subscribed ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  )
}

export function RightRail({
  upNext,
  bestsellers,
}: {
  upNext: FeedPost[]
  bestsellers: Publication[]
}) {
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const setView = useUIStore((state) => state.setView)

  return (
    <aside className="hidden w-[500px] shrink-0 px-8 py-8 2xl:block">
      <button
        onClick={() => {
          setSearchQuery("")
          setView("explore")
        }}
        className="flex h-14 w-full items-center gap-3 rounded-2xl border border-[#ddd] px-4 text-[20px] text-[#777]"
      >
        <Search className="size-7 text-[#242424]" />
        Search Substack
      </button>

      <section className="mt-6 rounded-2xl border border-[#ddd] bg-white px-5 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[24px] font-bold">Up next</h2>
          <button className="text-[17px] font-medium text-[#777]">See all</button>
        </div>
        {upNext.map((post) => (
          <UpNextItem key={post.id} post={post} />
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[#ddd] bg-white px-5 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[24px] font-bold">New Bestsellers</h2>
          <button className="text-[17px] font-medium text-[#777]">See all</button>
        </div>
        <div className="space-y-5">
          {bestsellers.map((publication) => (
            <BestsellerRow key={publication.id} publication={publication} />
          ))}
        </div>
      </section>
    </aside>
  )
}
