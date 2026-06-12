import type { Config, Context } from "@netlify/functions"
import { createRemoteJWKSet, jwtVerify } from "jose"

import { listUserRepos, userProfile } from "./lib/github.ts"
import { mirrorRepo, type RepoManifest } from "./lib/mirror.ts"
import { deleteObject, getObject, listKeys } from "./lib/r2.ts"
import {
  GithubNotConnectedError,
  githubTokenForUser,
} from "./lib/auth0-vault.ts"

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || "webreplay.us.auth0.com"
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET
const COOKIE = "auth_token"
const REFRESH_COOKIE = "auth_refresh"
// AUTH_DISABLED lets the API run open until the Auth0 .env is provisioned.
const AUTH_DISABLED = process.env.AUTH_DISABLED === "true"

const jwks = createRemoteJWKSet(
  new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
)

function cookieValue(req: Request, name: string): string | null {
  const cookies = req.headers.get("cookie") || ""
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? match[1] : null
}

function bearerOrCookieToken(req: Request): string | null {
  const header = req.headers.get("authorization") || ""
  if (header.startsWith("Bearer ")) return header.slice(7)
  return cookieValue(req, COOKIE)
}

async function verifyToken(token: string) {
  return jwtVerify(token, jwks, {
    issuer: `https://${AUTH0_DOMAIN}/`,
    ...(AUTH0_AUDIENCE ? { audience: AUTH0_AUDIENCE } : {}),
  })
}

const setCookie = (name: string, value: string, maxAge: number) =>
  `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`

// Auth0 Regular Web App flow: the SPA lands back on the site root with
// ?code=... and forwards it here; the secret-bearing exchange stays
// server-side. The session is two HttpOnly cookies: the access token (JWT)
// and the refresh token, which Token Vault exchanges for per-user GitHub
// access tokens.
async function handleAuth(req: Request, path: string): Promise<Response> {
  const sub = path.replace(/^\/auth/, "") || "/"

  if (sub === "/exchange" && req.method === "POST") {
    if (!AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
      return json({ error: "auth not configured" }, 500)
    }
    const { code, redirect_uri } = (await req.json()) as {
      code?: string
      redirect_uri?: string
    }
    if (!code || !redirect_uri) {
      return json({ error: "code and redirect_uri required" }, 400)
    }
    const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        code,
        redirect_uri,
      }),
    })
    if (!res.ok) {
      return json(
        { error: "token exchange failed", detail: await res.text() },
        401
      )
    }
    const { access_token, refresh_token, expires_in } = (await res.json()) as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }
    const headers = new Headers({ "content-type": "application/json" })
    headers.append(
      "set-cookie",
      setCookie(COOKIE, access_token, expires_in ?? 86400)
    )
    if (refresh_token) {
      headers.append(
        "set-cookie",
        setCookie(REFRESH_COOKIE, refresh_token, 30 * 86400)
      )
    }
    return new Response(
      JSON.stringify({ ok: true, offline: !!refresh_token }),
      {
        status: 200,
        headers,
      }
    )
  }

  if (sub === "/me" && req.method === "GET") {
    const session = await ensureSession(req)
    if (session.failed || !session.sub)
      return json({ error: "not authenticated" }, 401)
    const res = json({ sub: session.sub })
    for (const c of session.cookies) res.headers.append("set-cookie", c)
    return res
  }

  if (sub === "/logout" && req.method === "POST") {
    const headers = new Headers({ "content-type": "application/json" })
    headers.append("set-cookie", setCookie(COOKIE, "", 0))
    headers.append("set-cookie", setCookie(REFRESH_COOKIE, "", 0))
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  }

  return json({ error: "not found", path }, 404)
}

interface Session {
  failed?: Response
  /** Set-Cookie headers to append to the response (after a silent refresh). */
  cookies: string[]
  sub?: string
}

// When a refresh succeeds with rotation, the request still carries the old
// refresh cookie — later lookups in the same request must see the new one.
const refreshedTokens = new WeakMap<Request, string>()

/**
 * Validates the session, silently refreshing the access token with the
 * refresh-token grant when it is missing or expired.
 */
async function ensureSession(req: Request): Promise<Session> {
  if (AUTH_DISABLED) return { cookies: [] }

  const token = bearerOrCookieToken(req)
  if (token) {
    try {
      const { payload } = await verifyToken(token)
      return { cookies: [], sub: String(payload.sub) }
    } catch {
      /* expired/invalid — fall through to refresh */
    }
  }

  const refresh = cookieValue(req, REFRESH_COOKIE)
  if (refresh && AUTH0_CLIENT_ID && AUTH0_CLIENT_SECRET) {
    const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        refresh_token: refresh,
      }),
    })
    if (res.ok) {
      const body = (await res.json()) as {
        access_token: string
        refresh_token?: string
        expires_in?: number
      }
      try {
        const { payload } = await verifyToken(body.access_token)
        const cookies = [
          setCookie(COOKIE, body.access_token, body.expires_in ?? 86400),
        ]
        if (body.refresh_token) {
          cookies.push(
            setCookie(REFRESH_COOKIE, body.refresh_token, 30 * 86400)
          )
          refreshedTokens.set(req, body.refresh_token)
        }
        return { cookies, sub: String(payload.sub) }
      } catch {
        /* refreshed token failed verification — treat as unauthenticated */
      }
    }
  }

  return { failed: json({ error: "missing bearer token" }, 401), cookies: [] }
}

/** GitHub access token for the logged-in user, via Auth0 Token Vault. */
async function githubToken(req: Request): Promise<string> {
  const refresh = refreshedTokens.get(req) ?? cookieValue(req, REFRESH_COOKIE)
  if (!refresh) {
    throw new GithubNotConnectedError(
      "no refresh token in session — log in again (offline_access)"
    )
  }
  return githubTokenForUser(refresh)
}

function githubError(e: unknown): Response {
  if (e instanceof GithubNotConnectedError) {
    return json({ error: "github_not_connected", detail: e.detail }, 428)
  }
  return json({ error: String(e) }, 502)
}

async function eachLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) await fn(items[i++])
    })
  )
}

const toSummary = (manifest: RepoManifest) => {
  const { files: _files, skipped: _skipped, ...summary } = manifest
  return summary
}

async function handleGithub(req: Request, path: string): Promise<Response> {
  const sub = path.replace(/^\/github/, "") || "/"

  // GET /github/profile — the logged-in GitHub user, for the header
  if (sub === "/profile" && req.method === "GET") {
    try {
      const token = await githubToken(req)
      return json(await userProfile(token))
    } catch (e) {
      return githubError(e)
    }
  }

  // GET /github/repos — repos the logged-in GitHub user can access
  if (sub === "/repos" && req.method === "GET") {
    try {
      const token = await githubToken(req)
      return json(await listUserRepos(token))
    } catch (e) {
      return githubError(e)
    }
  }

  return json({ error: "not found", path }, 404)
}

// POST /mirror — copy a repo's default branch into R2 and write its manifest.
async function handleMirror(req: Request): Promise<Response> {
  const { fullName } = (await req.json().catch(() => ({}))) as {
    fullName?: string
  }
  if (!fullName || !/^[\w.-]+\/[\w.-]+$/.test(fullName)) {
    return json({ error: "fullName required (owner/name)" }, 400)
  }
  let token: string
  try {
    token = await githubToken(req)
  } catch (e) {
    return githubError(e)
  }
  try {
    const manifest = await mirrorRepo(token, fullName)
    return json({ repo: toSummary(manifest) })
  } catch (e) {
    return json({ error: "mirror_failed", detail: String(e) }, 502)
  }
}

// /repos* — everything served from the R2 mirror.
async function handleRepos(req: Request, path: string): Promise<Response> {
  try {
    // GET /repos — all mirrored repos, newest mirror first
    if (path === "/repos" && req.method === "GET") {
      const keys = await listKeys("manifests/")
      const manifests = await Promise.all(
        keys.map(async (key) => {
          const res = await getObject(key)
          if (!res) return null
          try {
            return (await res.json()) as RepoManifest
          } catch {
            return null
          }
        })
      )
      const repos = manifests
        .filter((m): m is RepoManifest => m !== null)
        .map(toSummary)
        .sort((a, b) => b.mirroredAt.localeCompare(a.mirroredAt))
      return json(repos)
    }

    // GET /repos/:owner/:name/blob?path=...
    const blobMatch = path.match(/^\/repos\/([^/]+)\/([^/]+)\/blob$/)
    if (blobMatch && req.method === "GET") {
      const [, owner, name] = blobMatch
      const filePath = new URL(req.url).searchParams.get("path")
      if (!filePath) return json({ error: "path required" }, 400)
      if (filePath.includes("..") || filePath.startsWith("/")) {
        return json({ error: "invalid path" }, 400)
      }
      const obj = await getObject(`repos/${owner}/${name}/${filePath}`)
      if (!obj) return json({ error: "not found", path: filePath }, 404)
      const buf = Buffer.from(await obj.arrayBuffer())
      const binary = buf.subarray(0, 8000).includes(0)
      return json({
        path: filePath,
        size: buf.length,
        encoding: binary ? "base64" : "utf8",
        content: binary ? buf.toString("base64") : buf.toString("utf8"),
      })
    }

    const repoMatch = path.match(/^\/repos\/([^/]+)\/([^/]+)$/)
    if (repoMatch) {
      const [, owner, name] = repoMatch

      // GET /repos/:owner/:name — the full manifest
      if (req.method === "GET") {
        const res = await getObject(`manifests/${owner}/${name}.json`)
        if (!res) return json({ error: "not found", path }, 404)
        return json(await res.json())
      }

      // DELETE /repos/:owner/:name — remove the mirror and its manifest
      if (req.method === "DELETE") {
        const keys = await listKeys(`repos/${owner}/${name}/`)
        await eachLimit(keys, 8, (key) => deleteObject(key))
        await deleteObject(`manifests/${owner}/${name}.json`).catch(() => {
          /* manifest may not exist */
        })
        return json({ ok: true })
      }
    }

    return json({ error: "not found", path }, 404)
  } catch (e) {
    return json({ error: "r2_error", detail: String(e) }, 502)
  }
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, "") || "/"

  // Auth endpoints handle their own authentication.
  if (path.startsWith("/auth")) return handleAuth(req, path)

  const session = await ensureSession(req)
  if (session.failed) return session.failed

  let res: Response
  if (path.startsWith("/github")) {
    res = await handleGithub(req, path)
  } else if (path === "/mirror" && req.method === "POST") {
    res = await handleMirror(req)
  } else if (path === "/repos" || path.startsWith("/repos/")) {
    res = await handleRepos(req, path)
  } else {
    res = json({ error: "not found", path }, 404)
  }

  // Propagate any silently-refreshed session cookies.
  for (const c of session.cookies) res.headers.append("set-cookie", c)
  return res
}

export const config: Config = {
  path: "/api/*",
}
