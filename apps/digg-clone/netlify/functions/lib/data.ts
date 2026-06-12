export type VoteState = -1 | 0 | 1
export type MediaType = "article" | "video" | "image"

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

export interface NewStoryInput {
  title: string
  summary: string
  url: string
  communityId: string
  imageUrl?: string | null
}

export const communities: Community[] = [
  {
    id: "gaming",
    name: "gaming",
    slug: "/gaming",
    iconUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80",
    color: "#2f7ee7",
    description: "Games, hardware, leaks, streams, and player culture.",
    members: 875,
    posts: 120,
    followed: true,
  },
  {
    id: "entertainment",
    name: "entertainment",
    slug: "/entertainment",
    iconUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=120&q=80",
    color: "#d6a12f",
    description: "Film, streaming, television, celebrity, and pop culture.",
    members: 1420,
    posts: 86,
    followed: true,
  },
  {
    id: "finance",
    name: "finance",
    slug: "/finance",
    iconUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=120&q=80",
    color: "#43a565",
    description: "Markets, company news, crypto, careers, and business.",
    members: 611,
    posts: 42,
    followed: false,
  },
  {
    id: "technology",
    name: "technology",
    slug: "/technology",
    iconUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80",
    color: "#17181f",
    description: "Computing, AI, gadgets, security, and the internet.",
    members: 2034,
    posts: 229,
    followed: true,
  },
  {
    id: "music",
    name: "music",
    slug: "/music",
    iconUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=120&q=80",
    color: "#c43b68",
    description: "Scenes, artists, gear, playlists, and industry shifts.",
    members: 528,
    posts: 35,
    followed: false,
  },
  {
    id: "science",
    name: "science",
    slug: "/science",
    iconUrl:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=120&q=80",
    color: "#6f5bd8",
    description: "Space, health, climate, research, and discoveries.",
    members: 948,
    posts: 73,
    followed: false,
  },
  {
    id: "oldweb",
    name: "oldweb",
    slug: "/oldweb",
    iconUrl:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=120&q=80",
    color: "#e16d3d",
    description: "Forums, retro computing, personal sites, and web history.",
    members: 2943,
    posts: 229,
    followed: true,
  },
  {
    id: "cozy",
    name: "cozy",
    slug: "/cozy",
    iconUrl:
      "https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?auto=format&fit=crop&w=120&q=80",
    color: "#8c633f",
    description: "Comfortable links, low-stakes threads, and quiet internet.",
    members: 393,
    posts: 23,
    followed: false,
  },
]

const now = Date.now()
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString()
const communityById = (id: string) => communities.find((community) => community.id === id) ?? communities[0]

function story(input: Omit<Story, "communityName" | "communityIcon" | "userVote" | "saved">): Story {
  const community = communityById(input.communityId)
  return {
    ...input,
    communityName: community.name,
    communityIcon: community.iconUrl,
    userVote: 0,
    saved: false,
  }
}

export const localStories: Story[] = [
  story({
    id: "seed-cozy",
    title: "/cozy - a place for all things that make you feel comfy",
    summary:
      "A new community for comfortable links, old forums, low-pressure discussions, music, videos, and all-around good vibes.",
    url: "https://example.com/cozy-community",
    domain: "digg.local",
    imageUrl:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=82",
    communityId: "cozy",
    publishedAt: hoursAgo(1),
    diggCount: 20,
    commentCount: 7,
    featured: true,
    mediaType: "image",
    submittedBy: "digglist",
    sourceCountry: "United States",
    tags: ["community", "cozy", "oldweb"],
  }),
  story({
    id: "seed-gaming-2025",
    title: "POLL: What Was the Best Video Game of 2025?",
    summary:
      "A year of long-awaited sequels, surprise indie hits, and huge open-world releases has players split over the top spot.",
    url: "https://example.com/best-video-game-2025",
    domain: "pixlparade.com",
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=82",
    communityId: "gaming",
    publishedAt: hoursAgo(6),
    diggCount: 39,
    commentCount: 5,
    featured: false,
    mediaType: "article",
    submittedBy: "pollsquad",
    sourceCountry: "United States",
    tags: ["poll", "games"],
  }),
  story({
    id: "seed-gta",
    title:
      "GTA 6 Leak Reveals 700+ Enterable Stores, Five Story Chapters, and Functional Malls",
    summary:
      "A new leak claims players will be able to rob hundreds of stores, explore malls, and encounter more reactive side systems.",
    url: "https://example.com/gta-six-leak",
    domain: "thegamepost.com",
    imageUrl:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=82",
    communityId: "gaming",
    publishedAt: hoursAgo(1.2),
    diggCount: 12,
    commentCount: 1,
    featured: true,
    mediaType: "article",
    submittedBy: "controller",
    sourceCountry: "United States",
    tags: ["leak", "console"],
  }),
  story({
    id: "seed-oscars",
    title: "How To Watch The Oscars Online This Weekend: Streaming Options and Start Time",
    summary:
      "The ceremony airs Sunday night with new streaming packages, red carpet coverage, and international viewing details.",
    url: "https://example.com/watch-oscars-online",
    domain: "bgr.com",
    imageUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=82",
    communityId: "entertainment",
    publishedAt: hoursAgo(6),
    diggCount: 32,
    commentCount: 3,
    featured: false,
    mediaType: "article",
    submittedBy: "screenwire",
    sourceCountry: "United States",
    tags: ["streaming", "awards"],
  }),
  story({
    id: "seed-music-forums",
    title: "Thirty Years of Forum Culture: How Dance Music Found Its Voice on the Internet",
    summary:
      "Before streaming, before social feeds, and before algorithms, small forums helped scenes form across cities and continents.",
    url: "https://example.com/dance-music-forums",
    domain: "decodedmagazine.com",
    imageUrl:
      "https://images.unsplash.com/photo-1461784180009-27aee34a4a24?auto=format&fit=crop&w=900&q=82",
    communityId: "music",
    publishedAt: hoursAgo(3),
    diggCount: 28,
    commentCount: 5,
    featured: true,
    mediaType: "article",
    submittedBy: "cratebrowser",
    sourceCountry: "United Kingdom",
    tags: ["forums", "history"],
  }),
  story({
    id: "seed-atlassian",
    title:
      "Atlassian Is Cutting 10% of Its Workforce to Fund Investment in AI and Enterprise Sales",
    summary:
      "The company says it will redirect spending into enterprise growth and AI tooling after a broader operating review.",
    url: "https://example.com/atlassian-cuts-ai",
    domain: "theverge.com",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=82",
    communityId: "finance",
    publishedAt: hoursAgo(5),
    diggCount: 44,
    commentCount: 18,
    featured: true,
    mediaType: "article",
    submittedBy: "tickerdesk",
    sourceCountry: "United States",
    tags: ["ai", "jobs"],
  }),
  story({
    id: "seed-vaccine",
    title: "Universal Vaccine Blocks Viruses, Bacteria, and Allergies With a Nasal Spray",
    summary:
      "Researchers report early evidence that a mucosal immune approach can reduce several types of respiratory exposure.",
    url: "https://example.com/universal-vaccine-nasal",
    domain: "sciencealert.com",
    imageUrl:
      "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&w=900&q=82",
    communityId: "science",
    publishedAt: hoursAgo(24),
    diggCount: 140,
    commentCount: 20,
    featured: true,
    mediaType: "article",
    submittedBy: "labnotes",
    sourceCountry: "United States",
    tags: ["health", "research"],
  }),
  story({
    id: "seed-apple",
    title: "Apple Is Going High-End With New MacBook Displays and a Thinner Chassis",
    summary:
      "Supply chain reports point to premium display panels and a lighter industrial design for the next notebook line.",
    url: "https://example.com/apple-macbook-display",
    domain: "9to5mac.com",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=82",
    communityId: "technology",
    publishedAt: hoursAgo(26),
    diggCount: 121,
    commentCount: 72,
    featured: true,
    mediaType: "article",
    submittedBy: "fruitstand",
    sourceCountry: "United States",
    tags: ["apple", "hardware"],
  }),
]

export const dailyEpisode = {
  id: "daily-2026-06-11",
  title: "Digg Daily",
  date: "Jun 11, 2026",
  durationSeconds: 277,
  progressSeconds: 0,
  coverUrl:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=160&q=80",
}

let nextId = 1
export function makeId() {
  return `story-${Date.now()}-${nextId++}`
}

export function stableId(input: string) {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0
  }
  return `live-${hash.toString(36)}`
}
