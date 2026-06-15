import { create } from "zustand"
import type { FeedId } from "@/lib/types"

type FeedSort = "top" | "new"

interface UIState {
  feed: FeedId
  previousFeed: FeedId
  selectedStoryId: string | null
  newPostOpen: boolean
  sidebarCollapsed: boolean
  searchQuery: string
  feedSort: FeedSort

  setFeed: (feed: FeedId) => void
  toggleSearch: () => void
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
  previousFeed: "all",
  selectedStoryId: null,
  newPostOpen: false,
  sidebarCollapsed: readCollapsed(),
  searchQuery: "",
  feedSort: "top",

  setFeed: (feed) =>
    set((state) => ({
      feed,
      previousFeed: state.feed === "search" ? state.previousFeed : state.feed,
      selectedStoryId: null,
    })),
  toggleSearch: () =>
    set((state) =>
      state.feed === "search"
        ? { feed: state.previousFeed, selectedStoryId: null }
        : { feed: "search", previousFeed: state.feed, selectedStoryId: null }
    ),
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
