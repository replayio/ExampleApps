import { Bell, CirclePlus, PanelLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCommunities } from "@/queries/stories"
import { useUIStore } from "@/store/ui-store"
import type { FeedId } from "@/lib/types"

function DiggLogo() {
  return (
    <span className="block leading-none">
      <span className="block text-[33px] font-black tracking-[-0.02em] text-[#15151c]">
        digg
      </span>
      <span className="block pl-1 text-[8px] font-black tracking-[0.32em] text-[#1d63d8]">
        BETA
      </span>
    </span>
  )
}

function RailButton({
  image,
  label,
  active,
  onClick,
}: {
  image: string
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-12 items-center justify-center rounded-full bg-[#eef0f4] transition-all hover:scale-[1.03]",
        active && "ring-2 ring-[#17181f] ring-offset-2"
      )}
    >
      <img src={image} alt="" className="size-full rounded-full object-cover" />
    </button>
  )
}

export function Sidebar() {
  const feed = useUIStore((state) => state.feed)
  const setFeed = useUIStore((state) => state.setFeed)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const setNewPostOpen = useUIStore((state) => state.setNewPostOpen)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const { data: communities = [] } = useCommunities()
  const visibleCommunities = communities.slice(0, sidebarCollapsed ? 5 : 10)

  const go = (next: FeedId) => {
    if (next === "search") setSearchQuery("")
    setFeed(next)
  }

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col items-center border-r border-[#e6e6ec] bg-[#fbfbfc] py-10 sm:flex",
        sidebarCollapsed ? "w-[96px]" : "w-[264px]"
      )}
    >
      <div className="flex w-full justify-center">
        <button onClick={() => go("all")}>
          <DiggLogo />
        </button>
      </div>

      <div className="mt-11 flex flex-col items-center gap-4">
        {!sidebarCollapsed && (
          <div className="mb-1 text-[15px] font-black tracking-wide">DIGG</div>
        )}
        <button
          aria-label="Search"
          onClick={() => go("search")}
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-[#eef0f4] text-[#5e6070]",
            feed === "search" && "bg-[#17181f] text-white"
          )}
        >
          <Search className="size-5" />
        </button>
        {visibleCommunities.map((community) => (
          <RailButton
            key={community.id}
            image={community.iconUrl}
            label={community.name}
            active={feed === `community:${community.id}`}
            onClick={() => go(`community:${community.id}`)}
          />
        ))}
        <button
          aria-label="More communities"
          onClick={() => go("trending")}
          className="flex size-12 items-center justify-center rounded-full bg-[#eef0f4] text-[#5e6070] hover:text-[#17181f]"
        >
          <CirclePlus className="size-5" />
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4">
        <button
          aria-label="Create post"
          onClick={() => setNewPostOpen(true)}
          className="flex size-12 items-center justify-center rounded-full bg-[#17181f] text-white"
        >
          <CirclePlus className="size-5" />
        </button>
        <button
          aria-label="Notifications"
          className="flex size-12 items-center justify-center rounded-full bg-[#eef0f4] text-[#5e6070]"
        >
          <Bell className="size-5" />
        </button>
        <button
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="flex size-12 items-center justify-center rounded-full bg-[#eef0f4] text-[#5e6070]"
        >
          <PanelLeft className="size-5" />
        </button>
      </div>
    </aside>
  )
}
