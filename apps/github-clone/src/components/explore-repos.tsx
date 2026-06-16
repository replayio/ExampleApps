import { GitFork, Star } from "lucide-react"

import { POPULAR_REPOS } from "@/lib/popular-repos"
import { languageColor } from "@/lib/lang"

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return String(n)
}

/**
 * Logged-out discovery view: a list of popular public repositories sorted by
 * star count (descending). Lets visitors browse popular public repos without
 * signing in. Each card links to the repo on github.com since these are not
 * mirrored into R2.
 */
export function ExploreRepos() {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Explore popular repositories</h2>
        <span className="text-sm text-muted-foreground">
          {POPULAR_REPOS.length} repos · no sign-in required
        </span>
      </div>

      <div className="mt-4 divide-y rounded-md border">
        {POPULAR_REPOS.map((repo) => (
          <a
            key={repo.fullName}
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="block px-4 py-4 transition-colors hover:bg-muted/50"
          >
            <span className="font-semibold text-sky-600 hover:underline dark:text-sky-400">
              {repo.fullName}
            </span>
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
                {formatStars(repo.stargazersCount)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="size-3.5" />
                {formatStars(repo.forksCount)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
