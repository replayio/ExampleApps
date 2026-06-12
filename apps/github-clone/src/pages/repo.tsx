import { Fragment, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  Book,
  File,
  FileCode,
  Folder,
  GitBranch,
  GitFork,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { api, type ManifestFile } from "@/lib/api"
import {
  formatBytes,
  isImagePath,
  languageColor,
  mimeFromPath,
} from "@/lib/lang"
import { blobUrl, navigate, treeUrl } from "@/lib/router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CodeView } from "@/components/code-view"
import { GithubIcon } from "@/components/github-icon"
import { Markdown } from "@/components/markdown"

interface DirListing {
  dirs: string[]
  files: ManifestFile[]
}

function listDir(files: ManifestFile[], path: string): DirListing {
  const prefix = path ? `${path}/` : ""
  const dirs = new Set<string>()
  const direct: ManifestFile[] = []
  for (const file of files) {
    if (!file.path.startsWith(prefix)) continue
    const rest = file.path.slice(prefix.length)
    const slash = rest.indexOf("/")
    if (slash === -1) direct.push(file)
    else dirs.add(rest.slice(0, slash))
  }
  return {
    dirs: [...dirs].sort((a, b) => a.localeCompare(b)),
    files: direct.sort((a, b) => a.path.localeCompare(b.path)),
  }
}

const README_NAMES = new Set(["readme.md", "readme.markdown", "readme"])

function Breadcrumbs({
  owner,
  name,
  path,
  linkLast,
}: {
  owner: string
  name: string
  path: string
  linkLast: boolean
}) {
  const segments = path.split("/")
  return (
    <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
      <a
        href={treeUrl(owner, name, "")}
        className="text-sky-600 hover:underline dark:text-sky-400"
      >
        {name}
      </a>
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1
        const segmentPath = segments.slice(0, i + 1).join("/")
        return (
          <Fragment key={segmentPath}>
            <span className="text-muted-foreground">/</span>
            {isLast && !linkLast ? (
              <span className="font-semibold">{segment}</span>
            ) : (
              <a
                href={treeUrl(owner, name, segmentPath)}
                className="text-sky-600 hover:underline dark:text-sky-400"
              >
                {segment}
              </a>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export function RepoPage({
  owner,
  name,
  view,
  path,
}: {
  owner: string
  name: string
  view: "tree" | "blob"
  path: string
}) {
  const queryClient = useQueryClient()
  const manifest = useQuery({
    queryKey: ["manifest", owner, name],
    queryFn: () => api.repoManifest(owner, name),
    retry: false,
  })

  const [remirroring, setRemirroring] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [mdView, setMdView] = useState<"preview" | "code">("preview")

  const listing = useMemo(
    () =>
      manifest.data && view === "tree"
        ? listDir(manifest.data.files, path)
        : null,
    [manifest.data, view, path]
  )

  const readme = listing?.files.find((f) =>
    README_NAMES.has(f.path.split("/").pop()?.toLowerCase() ?? "")
  )
  const readmeQuery = useQuery({
    queryKey: ["blob", owner, name, readme?.path],
    queryFn: () => api.repoBlob(owner, name, readme!.path),
    enabled: !!readme,
  })

  const blobQuery = useQuery({
    queryKey: ["blob", owner, name, path],
    queryFn: () => api.repoBlob(owner, name, path),
    enabled: view === "blob",
  })

  const remirror = async () => {
    setRemirroring(true)
    try {
      await api.mirrorRepo(`${owner}/${name}`)
      await queryClient.invalidateQueries({
        queryKey: ["manifest", owner, name],
      })
      queryClient.invalidateQueries({ queryKey: ["mirrored"] })
      toast.success(`Re-mirrored ${owner}/${name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setRemirroring(false)
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteMirror(owner, name)
      queryClient.invalidateQueries({ queryKey: ["mirrored"] })
      toast.success(`Deleted mirror of ${owner}/${name}`)
      navigate("#/")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (manifest.isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-6 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-96 animate-pulse rounded bg-muted" />
        <div className="mt-8 h-64 animate-pulse rounded-md border bg-muted/30" />
      </main>
    )
  }

  if (manifest.isError || !manifest.data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <GithubIcon className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 text-lg font-semibold">
          {owner}/{name} is not mirrored
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {manifest.error
            ? String(manifest.error.message)
            : "Repository not found."}
        </p>
        <a
          href="#/"
          className="mt-4 inline-block text-sm text-sky-600 hover:underline dark:text-sky-400"
        >
          Back to repositories
        </a>
      </main>
    )
  }

  const repo = manifest.data
  const fileName = path.split("/").pop() ?? ""
  const blobIsMarkdown = view === "blob" && /\.(md|markdown)$/i.test(path)
  const parentPath = path.split("/").slice(0, -1).join("/")
  const readmeName = readme?.path.split("/").pop()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg">
              <a
                href="#/"
                className="text-sky-600 hover:underline dark:text-sky-400"
              >
                {owner}
              </a>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="font-bold">{name}</span>
            </h1>
            <Badge variant="outline">
              {repo.private ? "Private" : "Public"}
            </Badge>
          </div>
          {repo.description && (
            <p className="mt-1 text-sm text-muted-foreground">
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
            <span className="flex items-center gap-1">
              <GitBranch className="size-3.5" />
              {repo.defaultBranch}
            </span>
            <code className="rounded bg-muted px-1 font-mono">
              {repo.commitSha.slice(0, 7)}
            </code>
            <span>
              Mirrored {formatDistanceToNow(new Date(repo.mirroredAt))} ago
            </span>
          </div>
        </div>
        <div className="ml-auto flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={remirroring}
            onClick={remirror}
          >
            <RefreshCw className={remirroring ? "animate-spin" : ""} />
            Re-mirror
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      {view === "tree" && listing && (
        <div className="mt-6">
          {path !== "" && (
            <div className="mb-3">
              <Breadcrumbs owner={owner} name={name} path={path} linkLast />
            </div>
          )}
          <div className="overflow-hidden rounded-md border">
            <div className="divide-y">
              {path !== "" && (
                <a
                  href={treeUrl(owner, name, parentPath)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Folder className="size-4 fill-current text-sky-400/80" />
                  <span className="font-mono text-xs">..</span>
                </a>
              )}
              {listing.dirs.map((dir) => (
                <a
                  key={dir}
                  href={treeUrl(owner, name, path ? `${path}/${dir}` : dir)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Folder className="size-4 shrink-0 fill-current text-sky-400/80" />
                  <span className="truncate font-mono text-xs">{dir}</span>
                </a>
              ))}
              {listing.files.map((file) => (
                <a
                  key={file.path}
                  href={blobUrl(owner, name, file.path)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50"
                >
                  <File className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-xs">
                    {file.path.split("/").pop()}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {formatBytes(file.size)}
                  </span>
                </a>
              ))}
              {listing.dirs.length === 0 &&
                listing.files.length === 0 &&
                path === "" && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    This repository is empty.
                  </div>
                )}
            </div>
          </div>
          {repo.skipped.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {repo.skipped.length} file{repo.skipped.length === 1 ? "" : "s"}{" "}
              skipped (&gt;10 MB)
            </p>
          )}

          {readme &&
            readmeQuery.data &&
            readmeQuery.data.encoding === "utf8" && (
              <div className="mt-4 rounded-md border">
                <div className="flex items-center gap-2 border-b px-4 py-2.5 text-sm font-medium">
                  <Book className="size-4 text-muted-foreground" />
                  {readmeName}
                </div>
                <div className="px-6 py-5">
                  <Markdown content={readmeQuery.data.content} />
                </div>
              </div>
            )}
        </div>
      )}

      {view === "blob" && (
        <div className="mt-6">
          <div className="mb-3">
            <Breadcrumbs
              owner={owner}
              name={name}
              path={path}
              linkLast={false}
            />
          </div>
          <div className="overflow-hidden rounded-md border">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
              <FileCode className="size-4 text-muted-foreground" />
              <span className="font-mono text-xs font-medium">{fileName}</span>
              {blobQuery.data && (
                <span className="text-xs text-muted-foreground">
                  {formatBytes(blobQuery.data.size)}
                </span>
              )}
              {blobIsMarkdown && blobQuery.data?.encoding === "utf8" && (
                <div className="ml-auto flex gap-0.5 rounded-md bg-muted p-0.5 text-xs">
                  {(["code", "preview"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`rounded px-2 py-0.5 capitalize ${
                        mdView === v
                          ? "bg-background font-medium"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setMdView(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {blobQuery.isLoading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading file…
              </div>
            )}
            {blobQuery.isError && (
              <div className="py-16 text-center text-sm text-destructive">
                {String(blobQuery.error.message)}
              </div>
            )}
            {blobQuery.data &&
              (blobQuery.data.encoding === "base64" ? (
                isImagePath(path) ? (
                  <div className="flex justify-center p-8">
                    <img
                      className="max-w-full"
                      src={`data:${mimeFromPath(path)};base64,${blobQuery.data.content}`}
                      alt={fileName}
                    />
                  </div>
                ) : (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    Binary file not shown
                  </div>
                )
              ) : blobIsMarkdown && mdView === "preview" ? (
                <div className="px-6 py-5">
                  <Markdown content={blobQuery.data.content} />
                </div>
              ) : (
                <CodeView path={path} content={blobQuery.data.content} />
              ))}
          </div>
        </div>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete mirror</DialogTitle>
            <DialogDescription>
              Remove {owner}/{name} and all of its files from the R2 mirror? The
              GitHub repository is not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={deleting}
              onClick={doDelete}
            >
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete mirror
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
