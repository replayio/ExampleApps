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

const now = Date.now()
const daysAgo = (days: number) =>
  new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
const hoursAgo = (hours: number) =>
  new Date(now - hours * 60 * 60 * 1000).toISOString()

export const publications: Publication[] = [
  {
    id: "doomberg",
    name: "Doomberg",
    subtitle: "Energy, markets, and hard truths",
    avatarUrl:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=160&q=80",
    verified: true,
    subscribers: "294K",
    subscribed: false,
  },
  {
    id: "design-explained",
    name: "Design, Explained",
    subtitle: "Product thinking without the theater",
    avatarUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80",
    verified: false,
    subscribers: "71K",
    subscribed: true,
  },
  {
    id: "raw-america",
    name: "Raw America",
    subtitle: "Raw America",
    avatarUrl:
      "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=160&q=80",
    verified: true,
    subscribers: "183K",
    subscribed: false,
    rank: 1,
  },
  {
    id: "dana-mom",
    name: "DANA | Mom to 4",
    subtitle: "Dana's Substack",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    verified: true,
    subscribers: "95K",
    subscribed: false,
    rank: 2,
  },
  {
    id: "mysticprimrose",
    name: "Mysticprimrose | Lill...",
    subtitle: "MYSTICPRIMROSE ACADE...",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    verified: true,
    subscribers: "81K",
    subscribed: false,
    rank: 3,
  },
  {
    id: "double-gun",
    name: "The Double Gun Jou...",
    subtitle: "The Double Gun Journal",
    avatarUrl:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=160&q=80",
    verified: true,
    subscribers: "63K",
    subscribed: false,
    rank: 4,
  },
  {
    id: "writers-cabin",
    name: "From The Writer's Ca...",
    subtitle: "From The Writer's Cabin",
    avatarUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=160&q=80",
    verified: false,
    subscribers: "47K",
    subscribed: false,
    rank: 5,
  },
  {
    id: "naval",
    name: "Naval's Archive",
    subtitle: "Notes on decisions, leverage, and clarity",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    verified: true,
    subscribers: "512K",
    subscribed: false,
  },
]

function pub(id: string) {
  return publications.find((publication) => publication.id === id) ?? publications[0]
}

function post(input: Omit<FeedPost, "publicationName" | "avatarUrl" | "subscribed">) {
  const publication = pub(input.publicationId)
  return {
    ...input,
    publicationName: publication.name,
    avatarUrl: publication.avatarUrl,
    subscribed: publication.subscribed,
  }
}

export const posts: FeedPost[] = [
  post({
    id: "takashi-rain",
    author: "Takashi Yasui",
    publicationId: "design-explained",
    body: "Kyoto in the rain.",
    imageUrl:
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=900&q=84",
    imageCaption: "Kyoto roofline",
    publishedAt: hoursAgo(48),
    likes: 1400,
    comments: 26,
    restacks: 53,
    liked: false,
    saved: false,
    readMinutes: 2,
  }),
  post({
    id: "naval-decisions",
    author: "Naval's Archive",
    publicationId: "naval",
    body:
      "Spend more time making the big decisions. There are basically three really big decisions you make in your early life:\n\n1. Where you live\n2. Who you're with, and\n3. What you're doing.",
    publishedAt: daysAgo(160),
    likes: 3700,
    comments: 81,
    restacks: 305,
    liked: false,
    saved: false,
    readMinutes: 4,
  }),
  post({
    id: "kav-cozy",
    author: "Kav",
    publicationId: "writers-cabin",
    body:
      "The notebook is back on the table, the coffee is exactly right, and the first paragraph finally stopped fighting me.",
    imageUrl:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=84",
    publishedAt: daysAgo(153),
    likes: 820,
    comments: 19,
    restacks: 44,
    liked: false,
    saved: true,
    readMinutes: 3,
  }),
  post({
    id: "design-psychology",
    author: "Mira Shah",
    publicationId: "design-explained",
    title: "Understanding the psychology behind product decisions",
    body:
      "The best product decisions feel obvious after the fact because they reduce the number of competing mental models a user has to keep alive.",
    imageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=84",
    publishedAt: hoursAgo(3),
    likes: 6,
    comments: 0,
    restacks: 2,
    liked: false,
    saved: false,
    readMinutes: 3,
  }),
  post({
    id: "borrowed-time",
    author: "Doomberg",
    publicationId: "doomberg",
    title: "Borrowed Time",
    body:
      "Markets are not clocks, but they do keep time. The strange thing about borrowed time is how normal it feels right up until the bill arrives.",
    imageUrl:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=84",
    publishedAt: hoursAgo(8),
    likes: 810,
    comments: 240,
    restacks: 87,
    liked: false,
    saved: false,
    readMinutes: 8,
  }),
  post({
    id: "cold-truths",
    author: "Doomberg",
    publicationId: "doomberg",
    title: "Cold Truths",
    body:
      "Energy abundance is easy to take for granted until weather, politics, and balance sheets all tighten at once.",
    imageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=84",
    publishedAt: hoursAgo(6),
    likes: 2010,
    comments: 261,
    restacks: 173,
    liked: false,
    saved: false,
    readMinutes: 6,
  }),
]

export const draft: Draft = {
  id: "designer-day",
  title: "A Day in My Life as a Designer",
  subtitle: "What my days actually look like as a designer",
  author: "Sam Lee",
  body:
    "I usually start my day slowly. Mornings are quiet, and I like to keep them that way-checking messages, skimming through a few design references, and easing my brain into thinking mode. I've learned that rushing too early often leads to sloppy decisions later.\n\nOnce work starts, my day is a mix of structure and unpredictability. I might begin by reviewing designs from the previous day, checking in on feedback, and making a small list of what needs real attention.",
  imageUrls: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=84",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=84",
  ],
  imageCaption: "Beach",
  savedAt: new Date().toISOString(),
  status: "draft",
}

let nextId = 1
export function makeId() {
  return `post-${Date.now()}-${nextId++}`
}
