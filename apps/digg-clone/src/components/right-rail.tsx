import { useState } from "react"
import {
  CirclePlus,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Triangle,
} from "lucide-react"
import { formatDuration, truncate } from "@/lib/format"
import type { Community, Story } from "@/lib/types"
import {
  useCommunities,
  useDailyEpisode,
  useFeaturedStories,
} from "@/queries/stories"
import { useUIStore } from "@/store/ui-store"

function DailyPlayer() {
  const { data: episode } = useDailyEpisode()
  const [playing, setPlaying] = useState(false)
  const duration = episode?.durationSeconds ?? 277
  const progress = episode?.progressSeconds ?? 0

  return (
    <section className="pb-8">
      <div className="flex items-center gap-3">
        <img
          src={episode?.coverUrl}
          alt=""
          className="size-16 rounded-md object-cover"
        />
        <div>
          <h2 className="text-[22px] font-black leading-tight">
            {episode?.title ?? "Digg Daily"}
          </h2>
          <p className="mt-1 text-[18px] text-[#4f505c]">
            {episode?.date ?? "Jun 11, 2026"}
          </p>
        </div>
      </div>
      <div className="mt-6 h-1.5 rounded-full bg-[#e4e4e9]">
        <div
          className="h-full rounded-full bg-[#1c70df]"
          style={{ width: `${(progress / duration) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-[15px] font-bold">
        <span>{formatDuration(progress)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
      <div className="mt-1 flex items-center gap-3">
        <button className="flex h-9 w-14 items-center justify-center rounded-full border border-[#d9d9df] bg-white text-[#494a56]">
          <SkipBack className="size-5" />
        </button>
        <button
          onClick={() => setPlaying((value) => !value)}
          className="flex size-12 items-center justify-center rounded-full bg-[#1f74e0] text-white shadow-sm"
        >
          {playing ? <Pause className="size-6" /> : <Play className="size-6 fill-current" />}
        </button>
        <button className="flex h-9 w-14 items-center justify-center rounded-full border border-[#d9d9df] bg-white text-[#494a56]">
          <SkipForward className="size-5" />
        </button>
        <button className="ml-auto flex h-9 items-center gap-1.5 rounded-full border border-[#d9d9df] bg-white px-3 text-[15px] font-semibold text-[#494a56]">
          <ListMusic className="size-4" />
          Chapters
        </button>
      </div>
    </section>
  )
}

function CommunityRow({ community }: { community: Community }) {
  const setFeed = useUIStore((state) => state.setFeed)
  const [followed, setFollowed] = useState(community.followed)

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setFeed(`community:${community.id}`)}
        className="relative shrink-0"
      >
        <img
          src={community.iconUrl}
          alt=""
          className="size-12 rounded-full object-cover"
        />
        <span className="absolute -bottom-0.5 -right-1 flex size-6 items-center justify-center rounded-full bg-[#17181f] text-white">
          <CirclePlus className="size-4" />
        </span>
      </button>
      <button
        onClick={() => setFeed(`community:${community.id}`)}
        className="min-w-0 flex-1 text-left"
      >
        <h3 className="truncate text-[21px] font-black leading-tight">
          /{community.name}
        </h3>
        <p className="mt-1 text-[15px] text-[#595a67]">
          {community.members} members&nbsp;&nbsp; {community.posts} posts
        </p>
      </button>
      <button
        onClick={() => setFollowed((value) => !value)}
        className="rounded-full bg-[#f0f0f3] px-3 py-1 text-xs font-bold text-[#494a56] hover:bg-[#e5e5eb]"
      >
        {followed ? "Joined" : "Join"}
      </button>
    </div>
  )
}

function FeaturedPost({ story }: { story: Story }) {
  const selectStory = useUIStore((state) => state.selectStory)
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = !imageFailed && story.imageUrl ? story.imageUrl : undefined

  return (
    <button
      onClick={() => selectStory(story.id)}
      className="grid grid-cols-[1fr_82px] gap-3 text-left"
    >
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded bg-[#edeef0] px-1.5 py-0.5 text-[12px] font-black tracking-wide text-[#3a3b44]">
            TRENDING
          </span>
          <span className="text-[15px] text-[#777887]">1d</span>
        </div>
        <h3 className="text-[17px] font-black leading-snug text-[#17181f]">
          {truncate(story.title, 78)}
        </h3>
        <div className="mt-3 flex items-center gap-4 text-[14px] text-[#777887]">
          <span className="flex items-center gap-1">
            <Triangle className="size-4" />
            {story.diggCount}
          </span>
          <span>{story.commentCount}</span>
        </div>
      </div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          onError={() => setImageFailed(true)}
          className="mt-7 h-20 w-20 rounded-[14px] object-cover"
        />
      )}
    </button>
  )
}

export function RightRail() {
  const { data: communities = [] } = useCommunities()
  const { data: featured = [] } = useFeaturedStories()
  const discover = communities.slice(0, 3)

  return (
    <aside className="hidden w-[500px] shrink-0 px-8 py-8 2xl:block">
      <div className="h-full overflow-hidden rounded-[28px] border border-[#dedee4] bg-white px-8 py-8">
        <DailyPlayer />

        <section className="border-t border-[#ececf1] pt-8">
          <button className="flex items-center gap-2 text-[22px] font-black">
            Discover Communities
            <span className="text-[#777887]">›</span>
          </button>
          <div className="mt-6 space-y-7">
            {discover.map((community) => (
              <CommunityRow key={community.id} community={community} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[22px] font-black">Featured Posts</h2>
          <div className="mt-7 space-y-9">
            {featured.map((story) => (
              <FeaturedPost key={story.id} story={story} />
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}
