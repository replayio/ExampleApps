import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { GitFork, Loader2, Star } from "lucide-react"

import { ApiError, api } from "@/lib/api"
import { ExploreRepos } from "@/components/explore-repos"
import { GithubIcon } from "@/components/github-icon"
import { formatBytes, languageColor } from "@/lib/lang"
import { repoUrl } from "@/lib/router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Dashboard({ onMirror }: { onMirror: () => void }) {
  const mirrored = useQuery({
    queryKey: ["mirrored"],
    queryFn: api.mirroredRepos,
  })
  const repos = mirrored.data ?? []

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Repositories</h1>
        <Badge variant="secondary">{repos.length}</Badge>
        <Button className="ml-auto" size="sm" onClick={onMirror}>
          Mirror repos
        </Button>
      </div>

      {mirrored.isLoading && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-md border py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading repositories…
        </div>
      )}

      {mirrored.isError && (() => {
        const error = mirrored.error
        const isAuth = error instanceof ApiError && error.status === 401
        return (
          <>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-md border py-16 text-center">
            <GithubIcon className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isAuth
                  ? "Couldn't load repositories — please sign in"
                  : "Couldn't load repositories"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAuth
                  ? "Your session has expired or you're not signed in. Sign in with GitHub to view your mirrored repositories."
                  : "Something went wrong while loading your repositories. Please try again."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => mirrored.refetch()}
              disabled={mirrored.isFetching}
            >
              {mirrored.isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Retrying…
                </>
              ) : (
                "Retry"
              )}
            </Button>
          </div>
          {isAuth && <ExploreRepos />}
          </>
        )
      })()}

      {mirrored.data && repos.length === 0 && (
        <>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-md border border-dashed py-16">
            <GithubIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No mirrored repositories yet
            </p>
            <Button size="sm" onClick={onMirror}>
              Mirror your first repo
            </Button>
          </div>
          <ExploreRepos />
        </>
      )}

      {repos.length > 0 && (
        <div className="mt-6 divide-y rounded-md border">
          {repos.map((repo) => (
            <div key={repo.fullName} className="px-4 py-4">
              <div className="flex items-center gap-2">
                <a
                  href={repoUrl(repo.owner, repo.name)}
                  className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
                >
                  {repo.fullName}
                </a>
                <Badge variant="outline">
                  {repo.private ? "Private" : "Public"}
                </Badge>
              </div>
              {repo.description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {repo.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: languageColor(repo.language) }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="size-3.5" />
                  {repo.stargazersCount}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="size-3.5" />
                  {repo.forksCount}
                </span>
                <span>
                  Mirrored {formatDistanceToNow(new Date(repo.mirroredAt))} ago
                </span>
                <span>
                  {repo.fileCount} files · {formatBytes(repo.totalBytes)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
