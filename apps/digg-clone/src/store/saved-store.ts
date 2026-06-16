import { create } from "zustand"
import type { Story } from "@/lib/types"

const STORAGE_KEY = "digg.saved.stories"

interface SavedState {
  /** Saved stories keyed by id, persisted to localStorage. */
  stories: Record<string, Story>
  isSaved: (id: string) => boolean
  /** Reconcile a story's saved flag with the server response. */
  sync: (story: Story) => void
  list: () => Story[]
}

function read(): Record<string, Story> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Story>) : {}
  } catch {
    return {}
  }
}

function persist(stories: Record<string, Story>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories))
  } catch {
    // ignore quota / unavailable storage
  }
}

export const useSavedStore = create<SavedState>((set, get) => ({
  stories: read(),

  isSaved: (id) => Boolean(get().stories[id]),

  sync: (story) =>
    set((state) => {
      const next = { ...state.stories }
      if (story.saved) {
        next[story.id] = { ...story, saved: true }
      } else {
        delete next[story.id]
      }
      persist(next)
      return { stories: next }
    }),

  list: () =>
    Object.values(get().stories).sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ),
}))
