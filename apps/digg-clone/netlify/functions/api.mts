import type { Config, Context } from "@netlify/functions"
import {
  communities,
  dailyEpisode,
  localStories,
  makeId,
  stableId,
  type Community,
  type NewStoryInput,
  type Story,
  type VoteState,
} from "./lib/data.ts"

type FeedId =
  | "all"
  | "my-feed"
  | "trending"
  | "saved"
  | "search"
  | `community:${string}`

interface GdeltArticle {
  url: string
  title: string
  seendate: string
  socialimage?: string
  domain?: string
  language?: string
  sourcecountry?: string
}

interface HnHit {
  objectID: string
  title?: string
  story_title?: string
  url?: string
  story_url?: string
  points?: number
  num_comments?: number
  created_at?: string
  author?: string
}

interface CachedStories {
  source: "gdelt" | "hn"
  expiresAt: number
  stories: Story[]
}

const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc"
const HN_URL = "https://hn.algolia.com/api/v1"
const CACHE_TTL_MS = 1000 * 60 * 5
const GDELT_TIMEOUT_MS = 3200
const liveCache = new Map<string, CachedStories>()
const storyIndex = new Map<string, Story>()

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })

function registerStories(stories: Story[]) {
  for (const story of stories) {
    storyIndex.set(story.id, story)
  }
}

registerStories(localStories)

function communityForFeed(feed: FeedId, title = "", query = ""): Community {
  if (feed.startsWith("community:")) {
    const id = feed.slice("community:".length)
    return communities.find((community) => community.id === id) ?? communities[0]
  }

  const haystack = `${query} ${title}`.toLowerCase()
  const match =
    communities.find((community) => haystack.includes(community.name)) ??
    (haystack.match(/game|console|playstation|xbox|nintendo/)
      ? communities.find((community) => community.id === "gaming")
      : undefined) ??
    (haystack.match(/movie|film|stream|actor|oscar|tv/)
      ? communities.find((community) => community.id === "entertainment")
      : undefined) ??
    (haystack.match(/market|stock|bank|company|jobs|crypto/)
      ? communities.find((community) => community.id === "finance")
      : undefined) ??
    (haystack.match(/music|album|song|tour|festival/)
      ? communities.find((community) => community.id === "music")
      : undefined) ??
    (haystack.match(/health|space|science|research|climate/)
      ? communities.find((community) => community.id === "science")
      : undefined)

  return match ?? communities.find((community) => community.id === "technology") ?? communities[0]
}

function gdeltQuery(feed: FeedId, q: string) {
  if (q.trim()) return `${q.trim()} sourcelang:english`
  if (feed.startsWith("community:")) {
    return `${feed.slice("community:".length)} sourcelang:english`
  }
  if (feed === "my-feed") return "technology sourcelang:english"
  if (feed === "trending") return "technology sourcelang:english"
  return "technology sourcelang:english"
}

function parseGdeltDate(value: string) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
  if (!match) return new Date().toISOString()
  const [, year, month, day, hour, minute, second] = match
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
}

function numberFromId(id: string, offset: number, modulo: number) {
  let total = 0
  for (let index = 0; index < id.length; index += 1) {
    total += id.charCodeAt(index) * (index + 1)
  }
  return offset + (total % modulo)
}

function normalizeArticle(article: GdeltArticle, feed: FeedId, q: string): Story | null {
  if (!article.url || !article.title) return null

  const community = communityForFeed(feed, article.title, q)
  const id = stableId(article.url)
  const domain = article.domain || safeDomain(article.url)
  const story: Story = {
    id,
    title: article.title.replace(/\s+/g, " ").trim(),
    summary: `A live news story from ${domain}, surfaced through GDELT's public news index.`,
    url: article.url,
    domain,
    imageUrl: article.socialimage || null,
    communityId: community.id,
    communityName: community.name,
    communityIcon: community.iconUrl,
    publishedAt: parseGdeltDate(article.seendate),
    diggCount: numberFromId(id, 16, 180),
    commentCount: numberFromId(`${id}-comments`, 1, 74),
    userVote: 0,
    saved: false,
    featured: numberFromId(id, 0, 5) === 2,
    mediaType: "article",
    submittedBy: "gdelt",
    sourceCountry: article.sourcecountry || "Global",
    tags: [community.name, article.language || "English"],
  }

  return story
}

const storyImagesByCommunity: Record<string, string[]> = {
  gaming: [
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=82",
  ],
  entertainment: [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=82",
  ],
  finance: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=900&q=82",
  ],
  technology: [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=82",
  ],
  music: [
    "https://images.unsplash.com/photo-1461784180009-27aee34a4a24?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=82",
  ],
  science: [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1581093458791-9d42f2c8f4d6?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=82",
  ],
  oldweb: [
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=82",
  ],
  cozy: [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?auto=format&fit=crop&w=900&q=82",
  ],
}

function imageForStory(communityId: string, id: string) {
  const images = storyImagesByCommunity[communityId] ?? storyImagesByCommunity.technology
  return images[numberFromId(id, 0, images.length)]
}

function hnQuery(feed: FeedId, q: string) {
  if (q.trim()) return q.trim()
  if (feed.startsWith("community:")) return feed.slice("community:".length)
  if (feed === "my-feed") return "web technology design"
  return ""
}

function normalizeHnHit(hit: HnHit, feed: FeedId, q: string): Story | null {
  const title = hit.title || hit.story_title
  if (!hit.objectID || !title) return null

  const url = hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`
  const community = communityForFeed(feed, title, q || "technology")
  const id = `hn-${hit.objectID}`
  const story: Story = {
    id,
    title: title.replace(/\s+/g, " ").trim(),
    summary: `A discussion-driven story from Hacker News, submitted by ${hit.author || "an HN user"}.`,
    url,
    domain: safeDomain(url),
    imageUrl: imageForStory(community.id, id),
    communityId: community.id,
    communityName: community.name,
    communityIcon: community.iconUrl,
    publishedAt: hit.created_at || new Date().toISOString(),
    diggCount: Math.max(1, hit.points ?? numberFromId(id, 10, 120)),
    commentCount: Math.max(0, hit.num_comments ?? numberFromId(`${id}-comments`, 0, 80)),
    userVote: 0,
    saved: false,
    featured: (hit.points ?? 0) > 150,
    mediaType: "article",
    submittedBy: hit.author || "hn",
    sourceCountry: "Hacker News",
    tags: [community.name, "hacker-news"],
  }

  return story
}

function safeDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "external.link"
  }
}

async function fetchGdeltStories(feed: FeedId, q: string) {
  if (feed === "saved") return []

  const query = gdeltQuery(feed, q)
  const cacheKey = `gdelt:${feed}:${query}`
  const cached = liveCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.stories

  const url = new URL(GDELT_URL)
  url.searchParams.set("query", query)
  url.searchParams.set("mode", "artlist")
  url.searchParams.set("format", "json")
  url.searchParams.set("maxrecords", "24")
  url.searchParams.set("sort", "datedesc")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), GDELT_TIMEOUT_MS)
  let response: Response
  let text: string
  try {
    response = await fetch(url, {
      headers: { "user-agent": "digg-clone-demo/1.0" },
      signal: controller.signal,
    })
    text = await response.text()
  } finally {
    clearTimeout(timeout)
  }
  if (!response.ok || !text.trim().startsWith("{")) {
    throw new Error(`GDELT unavailable: ${response.status}`)
  }

  const data = JSON.parse(text) as { articles?: GdeltArticle[] }
  const stories = (data.articles ?? [])
    .map((article) => normalizeArticle(article, feed, q))
    .filter((story): story is Story => story != null)
    .filter((story) => story.title.length > 10)

  registerStories(stories)
  liveCache.set(cacheKey, {
    source: "gdelt",
    expiresAt: Date.now() + CACHE_TTL_MS,
    stories,
  })
  return stories
}

async function fetchHnStories(feed: FeedId, q: string) {
  if (feed === "saved") return []

  const query = hnQuery(feed, q)
  const cacheKey = `hn:${feed}:${query}`
  const cached = liveCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.stories

  const endpoint = query ? "search_by_date" : "search"
  const url = new URL(`${HN_URL}/${endpoint}`)
  if (query) url.searchParams.set("query", query)
  url.searchParams.set("tags", query ? "story" : "front_page")
  url.searchParams.set("hitsPerPage", "24")

  const response = await fetch(url)
  if (!response.ok) throw new Error(`HN unavailable: ${response.status}`)
  const data = (await response.json()) as { hits?: HnHit[] }
  const stories = (data.hits ?? [])
    .map((hit) => normalizeHnHit(hit, feed, q))
    .filter((story): story is Story => story != null)

  registerStories(stories)
  liveCache.set(cacheKey, {
    source: "hn",
    expiresAt: Date.now() + CACHE_TTL_MS,
    stories,
  })
  return stories
}

async function fetchLiveStories(feed: FeedId, q: string) {
  try {
    const gdelt = await fetchGdeltStories(feed, q)
    if (gdelt.length > 0) return { source: "gdelt" as const, stories: gdelt }
  } catch {
    // Fall through to the no-key HN Search API.
  }
  const hn = await fetchHnStories(feed, q)
  return { source: "hn" as const, stories: hn }
}

function localStoriesFor(feed: FeedId, q = "") {
  const needle = q.trim().toLowerCase()
  let stories = localStories

  if (feed === "saved") stories = stories.filter((story) => story.saved)
  if (feed === "my-feed") {
    const followed = new Set(
      communities
        .filter((community) => community.followed)
        .map((community) => community.id)
    )
    stories = stories.filter((story) => followed.has(story.communityId))
  }
  if (feed.startsWith("community:")) {
    const id = feed.slice("community:".length)
    stories = stories.filter((story) => story.communityId === id)
  }
  if (needle) {
    stories = stories.filter((story) =>
      `${story.title} ${story.summary} ${story.domain} ${story.tags.join(" ")}`
        .toLowerCase()
        .includes(needle)
    )
  }

  return stories
}

function dedupeStories(stories: Story[]) {
  const byUrl = new Map<string, Story>()
  for (const story of stories) {
    if (!byUrl.has(story.url)) byUrl.set(story.url, story)
  }
  return Array.from(byUrl.values())
}

function sortStories(stories: Story[], feed: FeedId) {
  const list = [...stories]
  if (feed === "trending") {
    return list.sort((a, b) => b.diggCount + b.commentCount - (a.diggCount + a.commentCount))
  }
  return list.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

async function feedResponse(feed: FeedId, q = "") {
  const local = localStoriesFor(feed, q)
  try {
    const live = await fetchLiveStories(feed, q)
    const stories = sortStories(dedupeStories([...local, ...live.stories]), feed)
    return {
      feed,
      source: live.stories.length > 0 && local.length > 0 ? "mixed" : live.source,
      stories,
    }
  } catch {
    return {
      feed,
      source: feed === "saved" ? "local" : "fallback",
      stories: sortStories(local.length > 0 ? local : localStories, feed),
    }
  }
}

function findStory(id: string) {
  return localStories.find((story) => story.id === id) ?? storyIndex.get(id)
}

function storyFromBody(id: string, body: { story?: Story }) {
  if (!body.story) return null
  return {
    ...body.story,
    id,
  }
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, "") || "/"
  const method = req.method

  if (path === "/communities" && method === "GET") {
    return json(communities)
  }

  if (path === "/daily" && method === "GET") {
    return json(dailyEpisode)
  }

  if (path === "/featured" && method === "GET") {
    const featured = sortStories(
      localStories.filter((story) => story.featured),
      "trending"
    ).slice(0, 5)
    return json(featured)
  }

  if (path === "/feed" && method === "GET") {
    const feed = (url.searchParams.get("feed") || "all") as FeedId
    const q = url.searchParams.get("q") || ""
    return json(await feedResponse(feed, q))
  }

  if (path === "/search" && method === "GET") {
    const q = url.searchParams.get("q") || ""
    const result = await feedResponse("search", q)
    return json({ query: q, results: result.stories })
  }

  if (path === "/stories" && method === "POST") {
    const body = (await req.json()) as NewStoryInput
    const community = communities.find((item) => item.id === body.communityId) ?? communities[0]
    const title = body.title.trim()
    const summary = body.summary.trim()
    const urlValue = body.url.trim()
    if (!title || !urlValue) return json({ error: "title and url required" }, 400)

    const created: Story = {
      id: makeId(),
      title,
      summary: summary || `A community submission from ${safeDomain(urlValue)}.`,
      url: urlValue,
      domain: safeDomain(urlValue),
      imageUrl: body.imageUrl || null,
      communityId: community.id,
      communityName: community.name,
      communityIcon: community.iconUrl,
      publishedAt: new Date().toISOString(),
      diggCount: 1,
      commentCount: 0,
      userVote: 1,
      saved: false,
      featured: false,
      mediaType: "article",
      submittedBy: "you",
      sourceCountry: "Community",
      tags: [community.name, "submitted"],
    }
    localStories.unshift(created)
    registerStories([created])
    return json(created, 201)
  }

  const voteMatch = path.match(/^\/stories\/([^/]+)\/vote$/)
  if (voteMatch && method === "PATCH") {
    const body = (await req.json()) as { vote?: VoteState; story?: Story }
    const story = findStory(voteMatch[1]) ?? storyFromBody(voteMatch[1], body)
    if (!story) return json({ error: "not found" }, 404)
    const vote = body.vote === 1 || body.vote === -1 ? body.vote : 0
    story.diggCount = Math.max(0, story.diggCount + vote - story.userVote)
    story.userVote = vote
    registerStories([story])
    return json(story)
  }

  const saveMatch = path.match(/^\/stories\/([^/]+)\/save$/)
  if (saveMatch && method === "PATCH") {
    const body = (await req.json()) as { story?: Story }
    const story = findStory(saveMatch[1]) ?? storyFromBody(saveMatch[1], body)
    if (!story) return json({ error: "not found" }, 404)
    story.saved = !story.saved
    if (story.saved && !localStories.some((item) => item.id === story.id)) {
      localStories.unshift(story)
    }
    registerStories([story])
    return json(story)
  }

  return json({ error: "not found", path }, 404)
}

export const config: Config = {
  path: "/api/*",
}
