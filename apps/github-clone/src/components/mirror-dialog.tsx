import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, Check, Loader2, Search } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type RowStatus = "pending" | "done" | "error"

export function MirrorDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const reposQuery = useQuery({
    queryKey: ["github-repos"],
    queryFn: api.githubRepos,
    enabled: open,
    retry: false,
  })
  const mirroredQuery = useQuery({
    queryKey: ["mirrored"],
    queryFn: api.mirroredRepos,
  })

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<Record<string, RowStatus>>({})
  const [running, setRunning] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (!next) setStatus({})
    onOpenChange(next)
  }

  const mirroredSet = useMemo(
    () => new Set((mirroredQuery.data ?? []).map((r) => r.fullName)),
    [mirroredQuery.data]
  )

  const repos = useMemo(() => {
    const q = search.trim().toLowerCase()
    const all = reposQuery.data ?? []
    return q ? all.filter((r) => r.fullName.toLowerCase().includes(q)) : all
  }, [reposQuery.data, search])

  const toggle = (fullName: string) => {
    if (running) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(fullName)) next.delete(fullName)
      else next.add(fullName)
      return next
    })
  }

  const run = async () => {
    const queue = [...selected]
    const succeeded = new Set<string>()
    setRunning(true)
    const worker = async () => {
      for (;;) {
        const fullName = queue.shift()
        if (!fullName) return
        setStatus((s) => ({ ...s, [fullName]: "pending" }))
        try {
          await api.mirrorRepo(fullName)
          succeeded.add(fullName)
          setStatus((s) => ({ ...s, [fullName]: "done" }))
          queryClient.invalidateQueries({ queryKey: ["mirrored"] })
          toast.success(`Mirrored ${fullName}`)
        } catch (e) {
          setStatus((s) => ({ ...s, [fullName]: "error" }))
          toast.error(
            `${fullName}: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }
    }
    await Promise.all([worker(), worker()])
    setSelected((prev) => new Set([...prev].filter((f) => !succeeded.has(f))))
    setRunning(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mirror repositories</DialogTitle>
          <DialogDescription>
            Copy repositories from GitHub into the R2 mirror.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Filter repositories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="max-h-80 rounded-md border">
          {reposQuery.isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading repositories…
            </div>
          )}
          {reposQuery.isError && (
            <div className="space-y-1 px-4 py-8 text-center text-sm">
              <p className="text-destructive">
                {String(reposQuery.error.message)}
              </p>
              <p className="text-xs text-muted-foreground">
                Sign out and back in if GitHub access has expired.
              </p>
            </div>
          )}
          {reposQuery.data && repos.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No repositories match “{search}”.
            </div>
          )}
          <div className="divide-y">
            {repos.map((repo) => {
              const rowStatus = status[repo.fullName]
              return (
                <div
                  key={repo.fullName}
                  role="button"
                  tabIndex={0}
                  className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted/50 ${running ? "opacity-70" : ""}`}
                  onClick={() => toggle(repo.fullName)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault()
                      toggle(repo.fullName)
                    }
                  }}
                >
                  <Checkbox
                    checked={selected.has(repo.fullName)}
                    className="pointer-events-none"
                  />
                  <span className="truncate font-medium">{repo.fullName}</span>
                  {repo.private && <Badge variant="outline">Private</Badge>}
                  {mirroredSet.has(repo.fullName) && (
                    <Badge variant="secondary">Mirrored</Badge>
                  )}
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(repo.pushedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {rowStatus === "pending" && (
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                  )}
                  {rowStatus === "done" && (
                    <Check className="size-3.5 shrink-0 text-green-500" />
                  )}
                  {rowStatus === "error" && (
                    <AlertCircle className="size-3.5 shrink-0 text-destructive" />
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button disabled={selected.size === 0 || running} onClick={run}>
            {running && <Loader2 className="animate-spin" />}
            Mirror {selected.size}{" "}
            {selected.size === 1 ? "repository" : "repositories"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
