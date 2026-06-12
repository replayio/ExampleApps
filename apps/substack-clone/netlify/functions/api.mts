import type { Config, Context } from "@netlify/functions"
import {
  draft,
  makeId,
  posts,
  publications,
  type Draft,
  type FeedFilter,
  type FeedPost,
} from "./lib/data.ts"

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })

function filterPosts(filter: FeedFilter) {
  if (filter === "following") return posts.filter((post) => post.subscribed)
  if (filter === "saved") return posts.filter((post) => post.saved)
  return posts
}

function dashboard(filter: FeedFilter) {
  return {
    posts: filterPosts(filter),
    upNext: posts.filter((post) => post.title).slice(0, 3),
    bestsellers: publications
      .filter((publication) => publication.rank != null)
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)),
    draft,
  }
}

function findPost(id: string, fallback?: FeedPost) {
  const existing = posts.find((post) => post.id === id)
  if (existing) return existing
  return fallback ? { ...fallback, id } : null
}

function syncPublicationSubscription(publicationId: string) {
  const publication = publications.find((item) => item.id === publicationId)
  if (!publication) return null
  publication.subscribed = !publication.subscribed
  for (const post of posts) {
    if (post.publicationId === publicationId) {
      post.subscribed = publication.subscribed
    }
  }
  return publication
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, "") || "/"
  const method = req.method

  if (path === "/dashboard" && method === "GET") {
    const filter = (url.searchParams.get("filter") || "for-you") as FeedFilter
    return json(dashboard(filter))
  }

  if (path === "/publications" && method === "GET") {
    return json(publications)
  }

  if (path === "/search" && method === "GET") {
    const query = (url.searchParams.get("q") || "").trim().toLowerCase()
    const results = query
      ? posts.filter((post) =>
          `${post.author} ${post.publicationName} ${post.title ?? ""} ${post.body}`
            .toLowerCase()
            .includes(query)
        )
      : []
    return json({ query, results })
  }

  if (path === "/posts" && method === "POST") {
    const body = (await req.json()) as { body?: string }
    const content = (body.body || "").trim()
    if (!content) return json({ error: "body required" }, 400)
    const created: FeedPost = {
      id: makeId(),
      author: "Sam Lee",
      publicationId: "writers-cabin",
      publicationName: "From The Writer's Cabin",
      avatarUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=160&q=80",
      body: content,
      publishedAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      restacks: 0,
      liked: false,
      saved: false,
      subscribed: true,
      readMinutes: 1,
    }
    posts.unshift(created)
    return json(created, 201)
  }

  const likeMatch = path.match(/^\/posts\/([^/]+)\/like$/)
  if (likeMatch && method === "PATCH") {
    const body = (await req.json()) as { post?: FeedPost }
    const post = findPost(likeMatch[1], body.post)
    if (!post) return json({ error: "not found" }, 404)
    post.liked = !post.liked
    post.likes = Math.max(0, post.likes + (post.liked ? 1 : -1))
    return json(post)
  }

  const restackMatch = path.match(/^\/posts\/([^/]+)\/restack$/)
  if (restackMatch && method === "PATCH") {
    const body = (await req.json()) as { post?: FeedPost }
    const post = findPost(restackMatch[1], body.post)
    if (!post) return json({ error: "not found" }, 404)
    post.restacks += 1
    return json(post)
  }

  const saveMatch = path.match(/^\/posts\/([^/]+)\/save$/)
  if (saveMatch && method === "PATCH") {
    const body = (await req.json()) as { post?: FeedPost }
    const post = findPost(saveMatch[1], body.post)
    if (!post) return json({ error: "not found" }, 404)
    post.saved = !post.saved
    return json(post)
  }

  const subscribeMatch = path.match(/^\/publications\/([^/]+)\/subscribe$/)
  if (subscribeMatch && method === "PATCH") {
    const publication = syncPublicationSubscription(subscribeMatch[1])
    if (!publication) return json({ error: "not found" }, 404)
    return json(publication)
  }

  if (path === "/draft" && method === "PATCH") {
    const body = (await req.json()) as Draft
    Object.assign(draft, body, {
      savedAt: new Date().toISOString(),
      status: body.status ?? "draft",
    })
    return json(draft)
  }

  if (path === "/draft/publish" && method === "POST") {
    const body = (await req.json()) as Draft
    Object.assign(draft, body, {
      savedAt: new Date().toISOString(),
      status: "published",
    })
    const created: FeedPost = {
      id: makeId(),
      author: body.author,
      publicationId: "writers-cabin",
      publicationName: "From The Writer's Cabin",
      avatarUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=160&q=80",
      title: body.title,
      body: `${body.subtitle}\n\n${body.body}`,
      imageUrl: body.imageUrls[0],
      imageCaption: body.imageCaption,
      publishedAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      restacks: 0,
      liked: false,
      saved: false,
      subscribed: true,
      readMinutes: 6,
    }
    posts.unshift(created)
    return json(created, 201)
  }

  return json({ error: "not found", path }, 404)
}

export const config: Config = {
  path: "/api/*",
}
