import { create } from "zustand"
import type { FeedId } from "@/lib/types"

type FeedSort = "top" | "new"

interface UIState {
  feed: FeedId
  selectedStoryId: string | null
  newPostOpen: boolean
  sidebarCollapsed: boolean
  searchQuery: string
  feedSort: FeedSort

  setFeed: (feed: FeedId) => void
  selectStory: (id: string | null) => void
  setNewPostOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
  setFeedSort: (mode: FeedSort) => void
}

function readCollapsed(): boolean {
  try {
    return JSON.parse(localStorage.getItem("digg.sidebar.collapsed") || "false")
  } catch {
    return false
  }
}

export const useUIStore = create<UIState>((set) => ({
  feed: "all",
  selectedStoryId: null,
  newPostOpen: false,
  sidebarCollapsed: readCollapsed(),
  searchQuery: "",
  feedSort: "top",

  setFeed: (feed) => set({ feed, selectedStoryId: null }),
  selectStory: (id) => set({ selectedStoryId: id }),
  setNewPostOpen: (open) => set({ newPostOpen: open }),
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem("digg.sidebar.collapsed", String(next))
      return { sidebarCollapsed: next }
    }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFeedSort: (mode) => set({ feedSort: mode }),
}))
