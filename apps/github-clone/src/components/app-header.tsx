import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
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
                {user ? user.login : "Signed in"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
