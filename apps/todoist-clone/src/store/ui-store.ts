import { create } from "zustand"
import type { Priority, ViewId } from "@/lib/types"

type SortMode = "priority" | "date" | "name"

interface UIState {
  view: ViewId
  selectedTaskId: string | null
  addTaskOpen: boolean
  sidebarCollapsed: boolean
  searchQuery: string
  // Filters & Labels view
  activeLabels: string[]
  priorityFilter: Priority | null
  sortMode: SortMode

  setView: (view: ViewId) => void
  selectTask: (id: string | null) => void
  setAddTaskOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
  toggleLabel: (id: string) => void
  setPriorityFilter: (p: Priority | null) => void
  setSortMode: (mode: SortMode) => void
}

// Persisted sidebar state.
function readCollapsed(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sidebar.collapsed") || "false")
  } catch {
    return false
  }
}

export const useUIStore = create<UIState>((set) => ({
  view: "today",
  selectedTaskId: null,
  addTaskOpen: false,
  sidebarCollapsed: readCollapsed(),
  searchQuery: "",
  activeLabels: [],
  priorityFilter: null,
  sortMode: "priority",

  setView: (view) => set({ view, selectedTaskId: null }),
  selectTask: (id) => set({ selectedTaskId: id }),
  setAddTaskOpen: (open) => set({ addTaskOpen: open }),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      localStorage.setItem("sidebarCollapsed", String(next))
      return { sidebarCollapsed: next }
    }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleLabel: (id) =>
    set((state) => {
      const labels = state.activeLabels
      const next = labels.includes(id)
        ? labels.filter((l) => l !== id)
        : [...labels, id]
      return { activeLabels: next }
    }),

  setPriorityFilter: (p) => set({ priorityFilter: p }),
  setSortMode: (mode) => set({ sortMode: mode }),
}))
