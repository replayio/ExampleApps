import {
  Bell,
  ChevronDown,
  Compass,
  Home,
  Inbox,
  Menu,
  MessageSquare,
  Search,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewId } from "@/lib/types"
import { useUIStore } from "@/store/ui-store"
import { SubstackLogo } from "@/components/substack-logo"

const navItems: Array<{
  id: ViewId
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}> = [
  { id: "home", label: "Home", icon: Home },
  { id: "subscriptions", label: "Subscriptions", icon: Inbox },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: Bell, badge: "1" },
  { id: "explore", label: "Explore", icon: Search },
  { id: "profile", label: "Profile", icon: UserRound },
]

export function Sidebar() {
  const view = useUIStore((state) => state.view)
  const setView = useUIStore((state) => state.setView)
  const setComposerOpen = useUIStore((state) => state.setComposerOpen)

  return (
    <aside className="hidden h-svh w-[300px] shrink-0 flex-col border-r border-transparent bg-white px-6 py-8 lg:flex">
      <button onClick={() => setView("home")} className="mb-12 w-fit">
        <SubstackLogo compact />
      </button>

      <nav className="space-y-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "relative flex w-full items-center gap-5 text-left text-[20px] font-medium text-[#777]",
                active && "font-bold text-[#242424]"
              )}
            >
              <span className="relative flex size-8 items-center justify-center">
                <Icon className="size-7" />
                {item.badge && (
                  <span className="absolute -right-1 -top-2 flex size-6 items-center justify-center rounded-full bg-[#ff6719] text-sm font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <button
        onClick={() => setComposerOpen(true)}
        className="mt-9 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#ff6719] text-[18px] font-bold text-white shadow-sm hover:bg-[#ec5a10]"
      >
        Create
        <ChevronDown className="size-5" />
      </button>

      <button
        onClick={() => setView("editor")}
        className="mt-4 rounded-lg border border-[#eee] py-3 text-base font-semibold text-[#555] hover:bg-[#fafafa]"
      >
        Open editor
      </button>

      <div className="mt-auto space-y-5">
        <button className="flex items-center gap-5 text-[20px] font-medium text-[#777]">
          <Menu className="size-7" />
          More
        </button>
        <button className="flex items-center gap-5 text-[20px] font-medium text-[#777]">
          <Compass className="size-7" />
          Get app
        </button>
      </div>
    </aside>
  )
}
