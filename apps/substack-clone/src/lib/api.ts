import type {
  DashboardResponse,
  Draft,
  FeedFilter,
  FeedPost,
  NewNoteInput,
  Publication,
} from "./types"

const BASE = "/api"

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  getDashboard: (filter: FeedFilter = "for-you") =>
    http<DashboardResponse>(`/dashboard?filter=${encodeURIComponent(filter)}`),
  search: (query: string) =>
    http<{ query: string; results: FeedPost[] }>(
      `/search?q=${encodeURIComponent(query)}`
    ),
  getPublications: () => http<Publication[]>("/publications"),
  createNote: (input: NewNoteInput) =>
    http<FeedPost>("/posts", { method: "POST", body: JSON.stringify(input) }),
  likePost: (post: FeedPost) =>
    http<FeedPost>(`/posts/${post.id}/like`, {
      method: "PATCH",
      body: JSON.stringify({ post }),
    }),
  restackPost: (post: FeedPost) =>
    http<FeedPost>(`/posts/${post.id}/restack`, {
      method: "PATCH",
      body: JSON.stringify({ post }),
    }),
  savePost: (post: FeedPost) =>
    http<FeedPost>(`/posts/${post.id}/save`, {
      method: "PATCH",
      body: JSON.stringify({ post }),
    }),
  subscribe: (publicationId: string) =>
    http<Publication>(`/publications/${publicationId}/subscribe`, {
      method: "PATCH",
    }),
  saveDraft: (draft: Draft) =>
    http<Draft>("/draft", { method: "PATCH", body: JSON.stringify(draft) }),
  publishDraft: (draft: Draft) =>
    http<FeedPost>("/draft/publish", {
      method: "POST",
      body: JSON.stringify(draft),
    }),
}
