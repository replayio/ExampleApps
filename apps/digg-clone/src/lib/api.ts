import type {
  Community,
  DailyEpisode,
  FeedId,
  FeedResponse,
  NewStoryInput,
  Story,
  VoteState,
} from "./types"

const BASE = "/api"

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  getCommunities: () => http<Community[]>("/communities"),
  getDailyEpisode: () => http<DailyEpisode>("/daily"),
  getFeed: (feed: FeedId, q = "") =>
    http<FeedResponse>(
      `/feed?feed=${encodeURIComponent(feed)}${
        q ? `&q=${encodeURIComponent(q)}` : ""
      }`
    ),
  getFeatured: () => http<Story[]>("/featured"),
  search: (q: string) =>
    http<{ query: string; results: Story[] }>(
      `/search?q=${encodeURIComponent(q)}`
    ),
  createStory: (input: NewStoryInput) =>
    http<Story>("/stories", { method: "POST", body: JSON.stringify(input) }),
  voteStory: (story: Story, vote: VoteState) =>
    http<Story>(`/stories/${story.id}/vote`, {
      method: "PATCH",
      body: JSON.stringify({ vote, story }),
    }),
  toggleSave: (story: Story) =>
    http<Story>(`/stories/${story.id}/save`, {
      method: "PATCH",
      body: JSON.stringify({ story }),
    }),
}
