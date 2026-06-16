import { getStore } from "@netlify/blobs"

// A DB "saved note" is literally a markdown document stored server-side: the
// raw markdown plus a title and timestamps. Notes are namespaced by the
// authenticated user's `sub`, so each account's notes are private. We keep one
// blob store and prefix every key with the user id.

export interface StoredNote {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface NoteRef {
  id: string
  source: "db"
  title: string
  updatedAt: string
}

const STORE = "blamy-notes"

function store() {
  // Strong consistency so a create is immediately visible to the list/get that
  // the login-sync flow fires right after.
  return getStore({ name: STORE, consistency: "strong" })
}

const keyFor = (sub: string, id: string) => `${sub}/${id}`
const prefixFor = (sub: string) => `${sub}/`

const toRef = (note: StoredNote): NoteRef => ({
  id: note.id,
  source: "db",
  title: note.title,
  updatedAt: note.updatedAt,
})

export async function listNotes(sub: string): Promise<NoteRef[]> {
  const blobs = store()
  const { blobs: entries } = await blobs.list({ prefix: prefixFor(sub) })
  const notes = await Promise.all(
    entries.map((e) => blobs.get(e.key, { type: "json" }) as Promise<StoredNote | null>)
  )
  return notes
    .filter((n): n is StoredNote => n !== null)
    .map(toRef)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getNote(sub: string, id: string): Promise<StoredNote | null> {
  return (await store().get(keyFor(sub, id), { type: "json" })) as StoredNote | null
}

export async function createNote(
  sub: string,
  title: string,
  content: string
): Promise<StoredNote> {
  const now = new Date().toISOString()
  const note: StoredNote = {
    id: crypto.randomUUID(),
    title: title || "Untitled",
    content,
    createdAt: now,
    updatedAt: now,
  }
  await store().setJSON(keyFor(sub, note.id), note)
  return note
}

export async function updateNote(
  sub: string,
  id: string,
  patch: { title?: string; content?: string }
): Promise<StoredNote | null> {
  const existing = await getNote(sub, id)
  if (!existing) return null
  const note: StoredNote = {
    ...existing,
    ...(patch.title !== undefined ? { title: patch.title || "Untitled" } : {}),
    ...(patch.content !== undefined ? { content: patch.content } : {}),
    updatedAt: new Date().toISOString(),
  }
  await store().setJSON(keyFor(sub, id), note)
  return note
}

export async function deleteNote(sub: string, id: string): Promise<void> {
  await store().delete(keyFor(sub, id))
}

