// Shared contract between the SPA and the Netlify function (/api/*).
// The backend stores mirrored repos in Cloudflare R2:
//   - file contents at  repos/{owner}/{name}/{path}
//   - one manifest per repo at  manifests/{owner}/{name}.json

export interface GhUser {
  login: string
  avatar: string
}

/** A repo as listed live from the GitHub API (for the mirror picker). */
export interface GhRepo {
  fullName: string
  owner: string
  name: string
  description: string | null
  private: boolean
  language: string | null
  defaultBranch: string
  pushedAt: string
  stargazersCount: number
  forksCount: number
}

export interface ManifestFile {
  path: string
  size: number
}

/** Summary of a repo mirrored into R2 (manifest minus the file list). */
export interface MirroredRepo {
  fullName: string
  owner: string
  name: string
  description: string | null
  private: boolean
  language: string | null
  defaultBranch: string
  commitSha: string
  mirroredAt: string
  fileCount: number
  totalBytes: number
  stargazersCount: number
  forksCount: number
}

export interface RepoManifest extends MirroredRepo {
  files: ManifestFile[]
  /** Files skipped during mirroring (over the per-file size cap). */
  skipped: ManifestFile[]
}

export interface BlobResult {
  path: string
  size: number
  /** "utf8" for text, "base64" for binary content. */
  encoding: "utf8" | "base64"
  content: string
}

const BASE = "/api"

/** Error thrown by `http` that carries the HTTP status code of the response. */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

// Auth rides along automatically via the HttpOnly session cookie.
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const body = (await res.json()) as { error?: string; detail?: string }
      if (body.error) detail = body.detail ? `${body.error}: ${body.detail}` : body.error
    } catch {
      /* not json */
    }
    throw new ApiError(detail, res.status)
  }
  return res.json() as Promise<T>
}

export const api = {
  githubProfile: () => http<{ user: GhUser }>("/github/profile"),
  githubRepos: () => http<GhRepo[]>("/github/repos"),

  mirrorRepo: (fullName: string) =>
    http<{ repo: MirroredRepo }>("/mirror", {
      method: "POST",
      body: JSON.stringify({ fullName }),
    }),

  mirroredRepos: () => http<MirroredRepo[]>("/repos"),
  repoManifest: (owner: string, name: string) =>
    http<RepoManifest>(`/repos/${owner}/${name}`),
  repoBlob: (owner: string, name: string, path: string) =>
    http<BlobResult>(`/repos/${owner}/${name}/blob?path=${encodeURIComponent(path)}`),
  deleteMirror: (owner: string, name: string) =>
    http<{ ok: true }>(`/repos/${owner}/${name}`, { method: "DELETE" }),

  logout: () => http<{ ok: true }>("/auth/logout", { method: "POST" }),
}
