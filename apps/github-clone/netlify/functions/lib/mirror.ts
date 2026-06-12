// Mirrors a GitHub repo's default branch into R2 by streaming the tarball:
// gunzip -> tar extract -> bounded-concurrency uploads, then stale-key
// cleanup and a manifest write.

import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import { createGunzip } from "node:zlib"
import { extract } from "tar-stream"
import type { ReadableStream as WebReadableStream } from "node:stream/web"

import { fetchTarball, latestCommitSha, repoInfo } from "./github.ts"
import { deleteObject, ensureBucket, listKeys, putObject } from "./r2.ts"

// These types mirror src/lib/api.ts — netlify functions must not import
// from src/, so they are duplicated here.
export interface ManifestFile {
  path: string
  size: number
}

export interface RepoManifest {
  fullName: string
  owner: string
  name: string
  description: string | null
  private: boolean
  language: string | null
  defaultBranch: string
  commitSha: string
  mirroredAt: string
  fileCount: number
  totalBytes: number
  stargazersCount: number
  forksCount: number
  files: ManifestFile[]
  skipped: ManifestFile[]
}

const MAX_FILE_BYTES = 10 * 1024 * 1024
const CONCURRENCY = 8

const CONTENT_TYPES: Record<string, string> = {
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  json: "application/json",
  js: "text/javascript",
  mjs: "text/javascript",
  cjs: "text/javascript",
  jsx: "text/javascript",
  ts: "text/typescript",
  tsx: "text/typescript",
  css: "text/css",
  html: "text/html; charset=utf-8",
  xml: "application/xml",
  yml: "text/yaml",
  yaml: "text/yaml",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  ico: "image/x-icon",
  pdf: "application/pdf",
}

function contentTypeFor(path: string): string {
  const dot = path.lastIndexOf(".")
  if (dot === -1) return "application/octet-stream"
  return (
    CONTENT_TYPES[path.slice(dot + 1).toLowerCase()] ??
    "application/octet-stream"
  )
}

async function eachLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) await fn(items[i++])
    })
  )
}

export async function mirrorRepo(
  token: string,
  fullName: string
): Promise<RepoManifest> {
  const [owner, name] = fullName.split("/")
  await ensureBucket()
  const info = await repoInfo(token, fullName)
  const commitSha = await latestCommitSha(token, fullName, info.defaultBranch)

  const prefix = `repos/${owner}/${name}/`
  // Listed before uploading so we can delete keys that vanished upstream.
  const previousKeys = await listKeys(prefix)

  const res = await fetchTarball(token, fullName, commitSha)

  const files: ManifestFile[] = []
  const skipped: ManifestFile[] = []
  const uploadErrors: string[] = []
  const inFlight = new Set<Promise<void>>()
  let totalBytes = 0

  const queueUpload = async (path: string, body: Uint8Array) => {
    if (inFlight.size >= CONCURRENCY) await Promise.race(inFlight)
    const p: Promise<void> = putObject(
      prefix + path,
      body,
      contentTypeFor(path)
    )
      .catch((e) => {
        uploadErrors.push(`${path}: ${String(e)}`)
      })
      .finally(() => {
        inFlight.delete(p)
      })
    inFlight.add(p)
  }

  const extractor = extract()
  extractor.on("entry", (header, stream, next) => {
    // The tarball wraps everything in "{owner}-{repo}-{sha}/".
    const path = header.name.split("/").slice(1).join("/")
    if (header.type !== "file" || !path || path.startsWith(".git/")) {
      stream.resume()
      stream.on("end", () => next())
      return
    }
    if ((header.size ?? 0) > MAX_FILE_BYTES) {
      skipped.push({ path, size: header.size ?? 0 })
      // Every entry stream must be consumed or the tar stream stalls.
      stream.resume()
      stream.on("end", () => next())
      return
    }
    const chunks: Buffer[] = []
    stream.on("data", (chunk: Buffer) => chunks.push(chunk))
    stream.on("end", () => {
      const body = Buffer.concat(chunks)
      files.push({ path, size: body.length })
      totalBytes += body.length
      queueUpload(path, body).then(
        () => next(),
        (e) => next(e)
      )
    })
  })

  await pipeline(
    Readable.fromWeb(res.body as unknown as WebReadableStream<Uint8Array>),
    createGunzip(),
    extractor
  )
  await Promise.all(inFlight)

  if (uploadErrors.length > 0) {
    throw new Error(
      `failed to upload ${uploadErrors.length} file(s): ${uploadErrors.slice(0, 3).join("; ")}`
    )
  }

  // Delete keys that existed before but are no longer in the repo.
  const currentKeys = new Set(files.map((f) => prefix + f.path))
  const staleKeys = previousKeys.filter((k) => !currentKeys.has(k))
  await eachLimit(staleKeys, CONCURRENCY, (key) => deleteObject(key))

  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  const manifest: RepoManifest = {
    fullName,
    owner,
    name,
    description: info.description,
    private: info.private,
    language: info.language,
    defaultBranch: info.defaultBranch,
    commitSha,
    mirroredAt: new Date().toISOString(),
    fileCount: files.length,
    totalBytes,
    stargazersCount: info.stargazersCount,
    forksCount: info.forksCount,
    files,
    skipped,
  }
  await putObject(
    `manifests/${owner}/${name}.json`,
    JSON.stringify(manifest),
    "application/json"
  )
  return manifest
}
