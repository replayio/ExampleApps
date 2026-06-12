import { create } from "zustand"
import type { FeedFilter, ViewId } from "@/lib/types"

interface UIState {
  view: ViewId
  feedFilter: FeedFilter
  searchQuery: string
  selectedPostId: string | null
  composerOpen: boolean

  setView: (view: ViewId) => void
  setFeedFilter: (filter: FeedFilter) => void
  setSearchQuery: (query: string) => void
  selectPost: (id: string | null) => void
  setComposerOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  view: "home",
  feedFilter: "for-you",
  searchQuery: "",
  selectedPostId: null,
  composerOpen: false,

  setView: (view) => set({ view, selectedPostId: null }),
  setFeedFilter: (feedFilter) => set({ feedFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectPost: (selectedPostId) => set({ selectedPostId }),
  setComposerOpen: (composerOpen) => set({ composerOpen }),
}))
