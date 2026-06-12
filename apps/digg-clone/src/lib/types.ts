export type VoteState = -1 | 0 | 1
export type MediaType = "article" | "video" | "image"

export type FeedId =
  | "all"
  | "my-feed"
  | "trending"
  | "saved"
  | "search"
  | `community:${string}`

export interface Story {
  id: string
  title: string
  summary: string
  url: string
  domain: string
  imageUrl: string | null
  communityId: string
  communityName: string
  communityIcon: string
  publishedAt: string
  diggCount: number
  commentCount: number
  userVote: VoteState
  saved: boolean
  featured: boolean
  mediaType: MediaType
  submittedBy: string
  sourceCountry: string
  tags: string[]
}

export interface Community {
  id: string
  name: string
  slug: string
  iconUrl: string
  color: string
  description: string
  members: number
  posts: number
  followed: boolean
}

export interface DailyEpisode {
  id: string
  title: string
  date: string
  durationSeconds: number
  progressSeconds: number
  coverUrl: string
}

export interface FeedResponse {
  feed: FeedId
  source: "gdelt" | "hn" | "fallback" | "mixed" | "local"
  stories: Story[]
}

export interface NewStoryInput {
  title: string
  summary: string
  url: string
  communityId: string
  imageUrl?: string | null
}
