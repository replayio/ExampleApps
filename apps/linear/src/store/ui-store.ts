import { create } from "zustand"
import type { ViewId } from "@/lib/types"

interface UIState {
  view: ViewId
  selectedIssueId: string | null
  addIssueOpen: boolean
  sidebarCollapsed: boolean
  searchQuery: string

  setView: (view: ViewId) => void
  selectIssue: (id: string | null) => void
  setAddIssueOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
}

function readCollapsed(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sidebar.collapsed") || "false")
  } catch {
    return false
  }
}

export const useUIStore = create<UIState>((set) => ({
  view: "active",
  selectedIssueId: null,
  addIssueOpen: false,
  sidebarCollapsed: readCollapsed(),
  searchQuery: "",

  setView: (view) => set({ view, selectedIssueId: null }),
  selectIssue: (id) => set({ selectedIssueId: id }),
  setAddIssueOpen: (open) => set({ addIssueOpen: open }),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem("sidebar.collapsed", JSON.stringify(next))
      return { sidebarCollapsed: next }
    }),

  setSearchQuery: (q) => set({ searchQuery: q }),
}))
