import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Book,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  GitBranch,
  GitPullRequest,
  Loader2,
  LogOut,
  PenLine,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { GitbookEditor } from "@/editor/Editor"
import { DocsRenderer } from "@/docs/DocsRenderer"
import { parseMarkdown } from "@/gitbook/parse"
import { api } from "@/lib/api"
import { setAssetBase } from "@/lib/assets"
import {
  DbNotesStorage,
  LocalNotesStorage,
  deriveTitle,
  type NotesStorage,
} from "@/lib/storage"
import { syncLocalNotesToDb } from "@/lib/sync"
import { useAuth } from "@/components/auth-provider"
import { LocalModeBanner } from "@/components/local-mode-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type View = "edit" | "preview" | "markdown"

// One markdown content model, three persistence backends. Git keeps its
// repo/file selection; local and DB notes are flat lists keyed by id.
type Selection =
  | { kind: "flat"; source: "local" | "db"; id: string }
  | { kind: "git"; repo: string; filePath: string }

const NEW_NOTE_TEMPLATE = "# Untitled\n\n"

// Module-level singletons — the storage adapters are stateless.
const localStore = new LocalNotesStorage()
const dbStore = new DbNotesStorage()
const storageFor = (source: "local" | "db"): NotesStorage =>
  source === "local" ? localStore : dbStore


// ---------- File tree ----------

interface TreeDir {
  dirs: Map<string, TreeDir>
  files: string[] // full paths
}

function buildTree(paths: string[]): TreeDir {
  const root: TreeDir = { dirs: new Map(), files: [] }
  for (const path of paths) {
    const parts = path.split("/")
    let node = root
    for (const part of parts.slice(0, -1)) {
      if (!node.dirs.has(part)) node.dirs.set(part, { dirs: new Map(), files: [] })
      node = node.dirs.get(part)!
    }
    node.files.push(path)
  }
  return root
}

function FileTree({
  node,
  name,
  depth,
  selected,
  onSelect,
}: {
  node: TreeDir
  name?: string
  depth: number
  selected: string | null
  onSelect: (path: string) => void
}) {
  const [open, setOpen] = useState(depth < 1)
  const inner = (
    <>
      {[...node.dirs.entries()].map(([dir, child]) => (
        <FileTree
          key={dir}
          node={child}
          name={dir}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
      {node.files.map((path) => (
        <button
          key={path}
          className={`tree-file ${selected === path ? "tree-file-active" : ""}`}
          style={{ paddingLeft: 10 + depth * 14 }}
          onClick={() => onSelect(path)}
        >
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">{path.split("/").pop()}</span>
        </button>
      ))}
    </>
  )
  if (name === undefined) return inner
  return (
    <div>
      <button
        className="tree-dir"
        style={{ paddingLeft: 10 + (depth - 1) * 14 }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        <Folder className="size-3.5" />
        <span className="truncate">{name}</span>
      </button>
      {open && inner}
    </div>
  )
}

// ---------- App ----------

export default function App() {
  const { status, logout } = useAuth()
  const isGuest = status === "guest"
  const isAuthed = status === "authenticated"
  // The flat-note store the "New note" action writes into: localStorage for
  // guests, the per-user DB for authenticated users.
  const flatSource: "local" | "db" = isGuest ? "local" : "db"
  const queryClient = useQueryClient()

  const [selection, setSelection] = useState<Selection | null>(null)
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null)
  const [view, setView] = useState<View>("edit")
  const [owner, setOwner] = useState<string | null>(null)
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false)
  const [search, setSearch] = useState("")

  const gitSel = selection?.kind === "git" ? selection : null
  const flatSel = selection?.kind === "flat" ? selection : null

  // Flat notes (local or DB) for the active store.
  const notesQuery = useQuery({
    queryKey: ["notes", flatSource],
    queryFn: () => storageFor(flatSource).list(),
    enabled: isGuest || isAuthed,
  })

  // Repos come from the logged-in user's own GitHub identity (Auth0 Token
  // Vault exchanges the session's refresh token for their GitHub token).
  const reposQuery = useQuery({
    queryKey: ["repos"],
    queryFn: api.githubRepos,
    staleTime: 5 * 60_000,
    retry: false,
    enabled: isAuthed,
  })
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: api.githubProfile,
    staleTime: 10 * 60_000,
    retry: false,
    enabled: isAuthed,
  })
  const allRepos = useMemo(() => reposQuery.data ?? [], [reposQuery.data])
  const githubNotConnected =
    reposQuery.isError && String(reposQuery.error).includes("github_not_connected")

  // Owner switcher: the user plus their orgs (plus any other owners that
  // appear among accessible repos, e.g. collaborator repos).
  const owners = useMemo(() => {
    const known = new Map<string, string>() // login -> avatar
    if (profile.data) {
      known.set(profile.data.user.login, profile.data.user.avatar)
      for (const o of profile.data.orgs) known.set(o.login, o.avatar)
    }
    for (const r of allRepos) {
      const o = r.split("/")[0]
      if (!known.has(o)) known.set(o, `https://github.com/${o}.png?size=48`)
    }
    return [...known.entries()].map(([login, avatar]) => ({ login, avatar }))
  }, [profile.data, allRepos])

  // Default to the personal account once known.
  useEffect(() => {
    if (!owner && profile.data) setOwner(profile.data.user.login)
  }, [owner, profile.data])

  const activeOwner = owners.find((o) => o.login === owner) ?? owners[0] ?? null

  // No query: show the active owner's repos. With a query: search EVERY repo
  // the user can access, across all owners.
  const searching = search.trim().length > 0
  const repos = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q) return allRepos.filter((r) => r.toLowerCase().includes(q))
    return allRepos.filter((r) => !activeOwner || r.split("/")[0] === activeOwner.login)
  }, [allRepos, activeOwner, search])

  const tree = useQuery({
    queryKey: ["tree", expandedRepo],
    queryFn: () => api.repoTree(expandedRepo!),
    enabled: !!expandedRepo,
    staleTime: 60_000,
  })

  const file = useQuery({
    queryKey: ["file", gitSel?.repo, gitSel?.filePath],
    queryFn: () => api.repoFile(gitSel!.repo, gitSel!.filePath),
    enabled: !!gitSel,
  })

  const note = useQuery({
    queryKey: ["note", flatSel?.source, flatSel?.id],
    queryFn: () => storageFor(flatSel!.source).get(flatSel!.id),
    enabled: !!flatSel,
  })

  // Shared markdown editing buffer across all three sources.
  const [markdown, setMarkdown] = useState("")
  const [dirty, setDirty] = useState(false)
  const [syncing, setSyncing] = useState<"main" | "pr" | null>(null)

  // Keep latest buffer + selection in refs so the autosave flush never reads
  // a stale closure when the user switches notes mid-edit.
  const markdownRef = useRef(markdown)
  const dirtyRef = useRef(dirty)
  const flatSelRef = useRef(flatSel)
  useEffect(() => {
    markdownRef.current = markdown
    dirtyRef.current = dirty
    flatSelRef.current = flatSel
  })

  useEffect(() => {
    if (gitSel && file.data) {
      setMarkdown(file.data.content)
      setDirty(false)
    }
  }, [gitSel, file.data])

  useEffect(() => {
    if (flatSel && note.data) {
      setMarkdown(note.data.content)
      setDirty(false)
    }
  }, [flatSel, note.data])

  // Relative image srcs in a git file resolve against the repo's raw URL.
  // Flat notes have no repo, so the base is cleared.
  useEffect(() => {
    if (gitSel) setAssetBase(gitSel.repo, tree.data?.branch ?? null, gitSel.filePath)
    else setAssetBase(null, null, null)
  }, [gitSel, tree.data?.branch])

  // On the first render as an authenticated user, upload any notes that were
  // created earlier in guest mode, then clear them locally. Guarded so it runs
  // at most once per session.
  const syncRan = useRef(false)
  useEffect(() => {
    if (!isAuthed || syncRan.current) return
    syncRan.current = true
    localStore.list().then(async (pending) => {
      if (pending.length === 0) return
      const { synced, failed } = await syncLocalNotesToDb()
      if (synced > 0) {
        toast.success(`Synced ${synced} note${synced === 1 ? "" : "s"} to your account`)
        queryClient.invalidateQueries({ queryKey: ["notes", "db"] })
      }
      if (failed > 0) {
        toast.error(
          `${failed} note${failed === 1 ? "" : "s"} couldn't be synced and stay on this device`
        )
      }
    })
  }, [isAuthed, queryClient])

  const handleChange = useCallback((md: string) => {
    setMarkdown(md)
    setDirty(true)
  }, [])

  // Persist a flat note's pending edits immediately (used before switching
  // notes and on the debounce timer).
  const flushFlat = useCallback(() => {
    const sel = flatSelRef.current
    if (!sel || !dirtyRef.current) return
    const md = markdownRef.current
    storageFor(sel.source)
      .save(sel.id, md, deriveTitle(md))
      .then(() => queryClient.invalidateQueries({ queryKey: ["notes", sel.source] }))
      .catch((e) => toast.error(String(e instanceof Error ? e.message : e)))
  }, [queryClient])

  // Debounced autosave for flat notes (git notes commit on demand instead).
  useEffect(() => {
    if (!flatSel || !dirty) return
    const t = setTimeout(async () => {
      try {
        await storageFor(flatSel.source).save(flatSel.id, markdown, deriveTitle(markdown))
        setDirty(false)
        queryClient.invalidateQueries({ queryKey: ["notes", flatSel.source] })
      } catch (e) {
        toast.error(String(e instanceof Error ? e.message : e))
      }
    }, 700)
    return () => clearTimeout(t)
  }, [markdown, dirty, flatSel, queryClient])

  const confirmDiscardGit = () =>
    !gitSel || !dirty || window.confirm("Discard unsaved changes?")

  const selectGitFile = (path: string) => {
    if (!confirmDiscardGit()) return
    flushFlat()
    setSelection({ kind: "git", repo: expandedRepo!, filePath: path })
    setDirty(false)
  }

  const toggleRepo = (r: string) => {
    if (!confirmDiscardGit()) return
    setExpandedRepo((cur) => (cur === r ? null : r))
  }

  const selectNote = (source: "local" | "db", id: string) => {
    if (!confirmDiscardGit()) return
    flushFlat()
    setSelection({ kind: "flat", source, id })
    setDirty(false)
  }

  const createNote = async () => {
    if (!confirmDiscardGit()) return
    flushFlat()
    try {
      const ref = await storageFor(flatSource).create("Untitled", NEW_NOTE_TEMPLATE)
      await queryClient.invalidateQueries({ queryKey: ["notes", flatSource] })
      setSelection({ kind: "flat", source: flatSource, id: ref.id })
      setMarkdown(NEW_NOTE_TEMPLATE)
      setDirty(false)
    } catch (e) {
      toast.error(String(e instanceof Error ? e.message : e))
    }
  }

  const removeNote = async (source: "local" | "db", id: string) => {
    if (!window.confirm("Delete this note?")) return
    try {
      await storageFor(source).remove(id)
      if (flatSel?.id === id) {
        setSelection(null)
        setMarkdown("")
        setDirty(false)
      }
      queryClient.invalidateQueries({ queryKey: ["notes", source] })
    } catch (e) {
      toast.error(String(e instanceof Error ? e.message : e))
    }
  }

  const [pendingMode, setPendingMode] = useState<"main" | "pr" | null>(null)
  const [commitMessage, setCommitMessage] = useState("")

  const openSyncPanel = (mode: "main" | "pr") => {
    if (!gitSel) return
    setCommitMessage(`docs: update ${gitSel.filePath}`)
    setPendingMode(mode)
  }

  const sync = async (mode: "main" | "pr", message: string) => {
    if (!gitSel || !file.data || !message) return
    setPendingMode(null)
    setSyncing(mode)
    try {
      const result = await api.repoSave(gitSel.repo, {
        path: gitSel.filePath,
        content: markdown,
        message,
        mode,
        sha: file.data.sha,
      })
      setDirty(false)
      if (result.prUrl) {
        toast.success(`Opened PR #${result.number}`, {
          action: { label: "View", onClick: () => window.open(result.prUrl, "_blank") },
        })
      } else {
        toast.success(`Committed to ${tree.data?.branch ?? "main"}`, {
          action: { label: "View", onClick: () => window.open(result.commitUrl, "_blank") },
        })
      }
      file.refetch()
    } catch (e) {
      toast.error(String(e instanceof Error ? e.message : e))
    } finally {
      setSyncing(null)
    }
  }

  const notes = notesQuery.data ?? []
  const flatLabel = isGuest ? "Saved (this device)" : "Saved notes"
  const headerTitle = gitSel
    ? gitSel.filePath
    : flatSel
      ? notes.find((n) => n.id === flatSel.id)?.title ?? "Untitled"
      : null

  return (
    <div className="gb-app">
      <aside className="gb-sidebar">
        <div className="gb-sidebar-head">
          {isAuthed && activeOwner ? (
            <button className="gb-owner-switch" onClick={() => setOwnerMenuOpen((o) => !o)}>
              <img className="gb-owner-avatar" src={activeOwner.avatar} alt="" />
              <span className="font-semibold truncate">{activeOwner.login}</span>
              <ChevronDown className="size-4 shrink-0" />
            </button>
          ) : (
            <>
              <Book className="size-5" />
              <span className="font-semibold">blamy-notes</span>
            </>
          )}
          {ownerMenuOpen && (
            <div className="gb-owner-menu">
              {owners.map((o) => (
                <button
                  key={o.login}
                  className={`gb-owner-item ${o.login === activeOwner?.login ? "gb-owner-item-active" : ""}`}
                  onClick={() => {
                    setOwner(o.login)
                    setOwnerMenuOpen(false)
                    setExpandedRepo(null)
                  }}
                >
                  <img className="gb-owner-avatar" src={o.avatar} alt="" />
                  <span className="truncate">{o.login}</span>
                  {o.login === profile.data?.user.login && (
                    <span className="gb-owner-tag">you</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAuthed && (
          <div className="gb-sidebar-search">
            <Search className="size-3.5" />
            <input
              value={search}
              placeholder="Find repositories…"
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} title="Clear">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="gb-sidebar-scroll">
          {(isGuest || isAuthed) && (
            <>
              <div className="gb-section-label">{flatLabel}</div>
              <button className="gb-new-note" onClick={createNote}>
                <Plus className="size-3.5" /> New note
              </button>
              {notesQuery.isLoading && (
                <div className="gb-sidebar-note">Loading notes…</div>
              )}
              {notesQuery.isError && (
                <div className="gb-sidebar-note">Couldn't load your notes.</div>
              )}
              {notesQuery.data && notes.length === 0 && (
                <div className="gb-sidebar-note">
                  No notes yet — create one to get started.
                </div>
              )}
              {notes.map((n) => (
                <div
                  key={n.id}
                  className={`note-item ${flatSel?.id === n.id ? "note-item-active" : ""}`}
                  onClick={() => selectNote(flatSource, n.id)}
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span className="note-title">{n.title}</span>
                  <button
                    className="note-delete"
                    title="Delete note"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNote(flatSource, n.id)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </>
          )}

          {isAuthed && (
            <>
              <div className="gb-section-label">Git repos</div>
              {reposQuery.isLoading && (
                <div className="gb-sidebar-note">Loading repositories…</div>
              )}
              {githubNotConnected && (
                <div className="gb-sidebar-note">
                  This login isn't connected to GitHub. Log out and sign in with{" "}
                  <strong>Continue with GitHub</strong> to see your repositories.
                </div>
              )}
              {reposQuery.isError && !githubNotConnected && (
                <div className="gb-sidebar-note">
                  <div>
                    Couldn't load your repositories. Please sign in again and retry.
                  </div>
                  <button className="gb-retry-btn" onClick={() => reposQuery.refetch()}>
                    Retry
                  </button>
                </div>
              )}
              {reposQuery.data && repos.length === 0 && (
                <div className="gb-sidebar-note">
                  {search
                    ? `No repositories match “${search}”.`
                    : `No repositories in ${activeOwner?.login ?? "this org"}.`}
                </div>
              )}
              {repos.map((r) => {
                const [repoOwner, name] = r.split("/")
                const active = r === expandedRepo
                const foreign = searching && repoOwner !== activeOwner?.login
                return (
                  <div key={r}>
                    <button
                      className={`repo-item ${active ? "repo-item-active" : ""}`}
                      onClick={() => toggleRepo(r)}
                    >
                      {active ? (
                        <ChevronDown className="size-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0" />
                      )}
                      <GitBranch className="size-3.5 shrink-0" />
                      <span className="truncate">{name}</span>
                      {foreign && <span className="repo-owner">{repoOwner}</span>}
                    </button>
                    {active && (
                      <div className="repo-tree">
                        {tree.isLoading && (
                          <div className="gb-sidebar-note">Loading files…</div>
                        )}
                        {tree.data && tree.data.files.length === 0 && (
                          <div className="gb-sidebar-note">No markdown files</div>
                        )}
                        {tree.data && (
                          <FileTree
                            node={buildTree(tree.data.files)}
                            depth={0}
                            selected={gitSel?.filePath ?? null}
                            onSelect={selectGitFile}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        <div className="gb-sidebar-foot">
          {isGuest ? (
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4" /> Exit guest mode
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4" /> Log out
            </Button>
          )}
        </div>
      </aside>

      <main className="gb-main">
        <LocalModeBanner />
        <header className="gb-header">
          <span className="gb-file-path">
            {headerTitle ? (
              <>
                <FileText className="size-4" /> {headerTitle}
              </>
            ) : (
              <span className="text-muted-foreground">No note selected</span>
            )}
          </span>
          <div className="gb-view-tabs">
            {(
              [
                ["edit", PenLine, "Editor"],
                ["preview", Eye, "Preview"],
                ["markdown", FileText, "Markdown"],
              ] as const
            ).map(([v, Icon, label]) => (
              <button
                key={v}
                className={`gb-view-tab ${view === v ? "gb-view-tab-active" : ""}`}
                onClick={() => setView(v)}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
          {flatSel && (
            <div className="gb-sync">
              <span className={`gb-sync-state ${dirty ? "gb-sync-dirty" : ""}`}>
                {dirty ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" /> Saved
                  </>
                )}
              </span>
            </div>
          )}
          {gitSel && (
            <div className="gb-sync">
              <span className={`gb-sync-state ${dirty ? "gb-sync-dirty" : ""}`}>
                {dirty ? (
                  "Unsaved changes"
                ) : (
                  <>
                    <Check className="size-3.5" /> Synced
                  </>
                )}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={!dirty || !!syncing}
                onClick={() => openSyncPanel("pr")}
              >
                {syncing === "pr" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <GitPullRequest className="size-3.5" />
                )}
                Open PR
              </Button>
              <Button size="sm" disabled={!dirty || !!syncing} onClick={() => openSyncPanel("main")}>
                {syncing === "main" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <GitBranch className="size-3.5" />
                )}
                Commit to {tree.data?.branch ?? "main"}
              </Button>
            </div>
          )}
        </header>

        {pendingMode && gitSel && (
          <div className="gb-commit-panel">
            <Input
              autoFocus
              className="gb-commit-message"
              value={commitMessage}
              placeholder={pendingMode === "pr" ? "Pull request title" : "Commit message"}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sync(pendingMode, commitMessage)
                if (e.key === "Escape") setPendingMode(null)
              }}
            />
            <Button size="sm" disabled={!commitMessage} onClick={() => sync(pendingMode, commitMessage)}>
              {pendingMode === "pr" ? "Create pull request" : `Commit to ${tree.data?.branch ?? "main"}`}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPendingMode(null)}>
              Cancel
            </Button>
          </div>
        )}

        <div className="gb-content">
          {!selection ? (
            <div className="gb-empty">
              {isGuest
                ? "Create a note to get started — it's saved in this browser."
                : "Select a saved note, or a markdown file from a repository."}
            </div>
          ) : gitSel && file.isLoading ? (
            <div className="gb-empty">Loading {gitSel.filePath}…</div>
          ) : gitSel && file.isError ? (
            <div className="gb-empty">Failed to load file: {String(file.error)}</div>
          ) : flatSel && note.isLoading ? (
            <div className="gb-empty">Loading note…</div>
          ) : flatSel && note.isError ? (
            <div className="gb-empty">Failed to load note: {String(note.error)}</div>
          ) : view === "edit" ? (
            <GitbookEditor
              key={gitSel ? `${gitSel.repo}:${gitSel.filePath}` : `${flatSel!.source}:${flatSel!.id}`}
              markdown={markdown}
              onChange={handleChange}
            />
          ) : view === "preview" ? (
            <DocsRenderer doc={parseMarkdown(markdown)} />
          ) : (
            <textarea
              className="gb-raw"
              value={markdown}
              onChange={(e) => handleChange(e.target.value)}
              spellCheck={false}
            />
          )}
        </div>
      </main>
    </div>
  )
}
