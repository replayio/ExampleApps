import { create } from "zustand"
import type { ViewId } from "@/lib/types"
import { EMPTY_ISSUE_FILTERS, type IssueFilters } from "@/lib/issue-filters"

interface UIState {
  view: ViewId
  selectedIssueId: string | null
  addIssueOpen: boolean
  sidebarCollapsed: boolean
  searchQuery: string
  filters: IssueFilters

  setView: (view: ViewId) => void
  selectIssue: (id: string | null) => void
  setAddIssueOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
  setFilters: (filters: IssueFilters) => void
  clearFilters: () => void
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
  filters: EMPTY_ISSUE_FILTERS,

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
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: EMPTY_ISSUE_FILTERS }),
}))
