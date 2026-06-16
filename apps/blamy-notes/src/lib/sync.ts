import { DbNotesStorage, LocalNotesStorage } from "./storage"

export interface SyncResult {
  synced: number
  failed: number
}

// On the guest/anonymous → authenticated transition, upload every local note
// into the user's DB store. A local note is removed ONLY after its DB copy is
// confirmed created, so a partial failure never loses data — unsynced notes
// stay in localStorage and are retried on the next login.
export async function syncLocalNotesToDb(): Promise<SyncResult> {
  const local = new LocalNotesStorage()
  const db = new DbNotesStorage()
  const refs = await local.list()

  let synced = 0
  let failed = 0
  for (const ref of refs) {
    try {
      const { content } = await local.get(ref.id)
      await db.create(ref.title, content)
      await local.remove(ref.id)
      synced += 1
    } catch {
      failed += 1
    }
  }
  return { synced, failed }
}

