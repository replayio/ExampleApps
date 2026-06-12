export type ViewId =
  | "home"
  | "subscriptions"
  | "chat"
  | "activity"
  | "explore"
  | "profile"
  | "editor"

export type FeedFilter = "for-you" | "following" | "saved"

export interface Publication {
  id: string
  name: string
  subtitle: string
  avatarUrl: string
  verified: boolean
  subscribers: string
  subscribed: boolean
  rank?: number
}

export interface FeedPost {
  id: string
  author: string
  publicationId: string
  publicationName: string
  avatarUrl: string
  title?: string
  body: string
  imageUrl?: string
  imageCaption?: string
  publishedAt: string
  likes: number
  comments: number
  restacks: number
  liked: boolean
  saved: boolean
  subscribed: boolean
  readMinutes: number
}

export interface Draft {
  id: string
  title: string
  subtitle: string
  author: string
  body: string
  imageUrls: string[]
  imageCaption: string
  savedAt: string
  status: "draft" | "preview" | "published"
}

export interface DashboardResponse {
  posts: FeedPost[]
  upNext: FeedPost[]
  bestsellers: Publication[]
  draft: Draft
}

export interface NewNoteInput {
  body: string
}
