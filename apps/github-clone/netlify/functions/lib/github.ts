// GitHub REST helpers operating with the USER's own access token (obtained
// via Auth0 Token Vault), so all access is scoped to what the logged-in
// GitHub user can see.

const API = "https://api.github.com"

async function gh(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    throw new Error(
      `GitHub ${init?.method ?? "GET"} ${path} -> ${res.status}: ${await res.text()}`
    )
  }
  return res.status === 204 ? null : res.json()
}

/** Mirrors GhRepo in src/lib/api.ts — functions must not import from src/. */
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

interface RawRepo {
  full_name: string
  name: string
  owner: { login: string }
  description: string | null
  private: boolean
  language: string | null
  default_branch: string
  pushed_at: string
  stargazers_count: number
  forks_count: number
}

const toGhRepo = (r: RawRepo): GhRepo => ({
  fullName: r.full_name,
  owner: r.owner.login,
  name: r.name,
  description: r.description,
  private: r.private,
  language: r.language,
  defaultBranch: r.default_branch,
  pushedAt: r.pushed_at,
  stargazersCount: r.stargazers_count,
  forksCount: r.forks_count,
})

export async function userProfile(
  token: string
): Promise<{ user: { login: string; avatar: string } }> {
  const user = (await gh("/user", token)) as {
    login: string
    avatar_url: string
  }
  return { user: { login: user.login, avatar: user.avatar_url } }
}

/** Repos the user can access, most recently pushed first. */
export async function listUserRepos(token: string): Promise<GhRepo[]> {
  const repos: GhRepo[] = []
  for (let page = 1; page <= 5; page++) {
    const res = (await gh(
      `/user/repos?sort=pushed&per_page=100&page=${page}`,
      token
    )) as RawRepo[]
    repos.push(...res.map(toGhRepo))
    if (res.length < 100) break
  }
  return repos
}

export interface RepoInfo {
  defaultBranch: string
  description: string | null
  private: boolean
  language: string | null
  stargazersCount: number
  forksCount: number
}

export async function repoInfo(
  token: string,
  fullName: string
): Promise<RepoInfo> {
  const r = (await gh(`/repos/${fullName}`, token)) as RawRepo
  return {
    defaultBranch: r.default_branch,
    description: r.description,
    private: r.private,
    language: r.language,
    stargazersCount: r.stargazers_count,
    forksCount: r.forks_count,
  }
}

export async function latestCommitSha(
  token: string,
  fullName: string,
  ref: string
): Promise<string> {
  const commit = (await gh(`/repos/${fullName}/commits/${ref}`, token)) as {
    sha: string
  }
  return commit.sha
}

/**
 * Streams the repo tarball. fetch follows the redirect to codeload — undici
 * drops the Authorization header cross-origin, which is correct here since
 * codeload uses a signed URL.
 */
export async function fetchTarball(
  token: string,
  fullName: string,
  ref: string
): Promise<Response> {
  const res = await fetch(`${API}/repos/${fullName}/tarball/${ref}`, {
    headers: {
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
    },
  })
  if (!res.ok || !res.body) {
    throw new Error(
      `GitHub tarball ${fullName}@${ref} -> ${res.status}: ${await res.text()}`
    )
  }
  return res
}
