import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { login } from "@/components/auth-provider"
import { GithubIcon } from "@/components/github-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader({ onMirror }: { onMirror: () => void }) {
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: api.githubProfile,
    staleTime: 10 * 60_000,
    retry: false,
  })
  const user = profile.data?.user
  // The profile request rides on the HttpOnly session cookie; if it fails
  // (e.g. 401) or returns no user, the visitor is signed out.
  const isSignedIn = !!user

  const signOut = async () => {
    await api.logout()
    location.reload()
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <a href="#/" className="flex items-center gap-2 text-sm font-semibold">
          <GithubIcon className="size-5" />
          github-clone
        </a>
        <div className="ml-auto flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={onMirror}>
            Mirror repos
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar size="sm">
                  {user && <AvatarImage src={user.avatar} alt={user.login} />}
                  <AvatarFallback>
                    <GithubIcon className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {isSignedIn ? user.login : "Not signed in"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isSignedIn ? (
                <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={login}>
                  <GithubIcon className="size-3.5" /> Sign in with GitHub
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
