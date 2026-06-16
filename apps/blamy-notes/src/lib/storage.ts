// A note is always a markdown document. The three sources differ only in
// where that markdown is persisted — localStorage, our Netlify Blobs DB, or a
// GitHub repo file — never in the note's structure. LocalNotesStorage and
// DbNotesStorage share this flat-list interface; git keeps its repo/tree flow
// in src/lib/api.ts (the thin wrapper over the GitHub API).

export type NoteSource = "local" | "db" | "git"

export interface NoteRef {
  id: string // local: uuid; db: blob id; git: `${repo}:${filePath}`
  source: NoteSource
  title: string
  updatedAt: string
}

export interface NoteData {
  content: string // raw markdown — identical across all sources
}

export interface NotesStorage {
  list(): Promise<NoteRef[]>
  get(id: string): Promise<NoteData>
  create(title: string, content: string): Promise<NoteRef>
  save(id: string, content: string, title?: string): Promise<void>
  remove(id: string): Promise<void>
}

const byUpdatedDesc = (a: NoteRef, b: NoteRef) =>
  b.updatedAt.localeCompare(a.updatedAt)

// ---------- Local (browser localStorage) ----------

const INDEX_KEY = "blamy_notes_index"
const bodyKey = (id: string) => `blamy_note_${id}`

export class LocalNotesStorage implements NotesStorage {
  private readIndex(): NoteRef[] {
    try {
      const raw = localStorage.getItem(INDEX_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as NoteRef[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private writeIndex(refs: NoteRef[]): void {
    localStorage.setItem(INDEX_KEY, JSON.stringify(refs))
  }

  async list(): Promise<NoteRef[]> {
    return this.readIndex().sort(byUpdatedDesc)
  }

  async get(id: string): Promise<NoteData> {
    return { content: localStorage.getItem(bodyKey(id)) ?? "" }
  }

  async create(title: string, content: string): Promise<NoteRef> {
    const ref: NoteRef = {
      id: crypto.randomUUID(),
      source: "local",
      title: title || "Untitled",
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(bodyKey(ref.id), content)
    this.writeIndex([ref, ...this.readIndex()])
    return ref
  }

  async save(id: string, content: string, title?: string): Promise<void> {
    localStorage.setItem(bodyKey(id), content)
    const refs = this.readIndex()
    const ref = refs.find((r) => r.id === id)
    if (ref) {
      if (title !== undefined) ref.title = title || "Untitled"
      ref.updatedAt = new Date().toISOString()
      this.writeIndex(refs)
    }
  }

  async remove(id: string): Promise<void> {
    localStorage.removeItem(bodyKey(id))
    this.writeIndex(this.readIndex().filter((r) => r.id !== id))
  }
}

// ---------- DB (Netlify Blobs via /api/notes/*) ----------

async function notesApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/notes${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) detail = body.error
    } catch {
      /* not json */
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

export class DbNotesStorage implements NotesStorage {
  async list(): Promise<NoteRef[]> {
    const refs = await notesApi<NoteRef[]>("")
    return refs.sort(byUpdatedDesc)
  }

  async get(id: string): Promise<NoteData> {
    return notesApi<NoteData>(`/${encodeURIComponent(id)}`)
  }

  async create(title: string, content: string): Promise<NoteRef> {
    return notesApi<NoteRef>("", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    })
  }

  async save(id: string, content: string, title?: string): Promise<void> {
    await notesApi<{ ok: true }>(`/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ content, title }),
    })
  }

  async remove(id: string): Promise<void> {
    await notesApi<{ ok: true }>(`/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  }
}

// Derives a human title from the first non-empty markdown line, so flat-note
// lists stay meaningful as the user types.
export function deriveTitle(markdown: string): string {
  const line = markdown
    .split("\n")
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .find((l) => l.length > 0)
  return line ? line.slice(0, 80) : "Untitled"
}

