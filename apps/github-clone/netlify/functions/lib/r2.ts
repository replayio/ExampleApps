// Cloudflare R2 via its S3-compatible API, signed with aws4fetch.

import { AwsClient } from "aws4fetch"

const ENDPOINT = process.env.R2_ENDPOINT ?? ""
const BUCKET = process.env.R2_BUCKET || "github-clone"

const client = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  region: "auto",
  service: "s3",
})

const objectUrl = (key: string) =>
  `${ENDPOINT}/${BUCKET}/` + key.split("/").map(encodeURIComponent).join("/")

// XML entity decode; &amp; must come last so it doesn't re-expand.
const decodeXml = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")

let bucketReady = false

/**
 * Makes sure the bucket exists. Object-scoped R2 tokens get AccessDenied on
 * S3 CreateBucket even when the bucket already exists, so check with HEAD
 * first and fall back to the Cloudflare REST API (needs an Admin R&W token).
 */
export async function ensureBucket(): Promise<void> {
  if (bucketReady) return

  const head = await client.fetch(`${ENDPOINT}/${BUCKET}`, { method: "HEAD" })
  if (head.status === 200) {
    bucketReady = true
    return
  }

  const put = await client.fetch(`${ENDPOINT}/${BUCKET}`, { method: "PUT" })
  if (put.status === 200 || put.status === 409) {
    bucketReady = true
    return
  }
  const putBody = await put.text()

  const accountId = process.env.R2_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (accountId && apiToken) {
    const rest = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: BUCKET }),
      }
    )
    // 10004 = bucket already exists
    if (rest.ok || (await rest.text()).includes('"code":10004')) {
      bucketReady = true
      return
    }
  }

  throw new Error(
    `R2 bucket ${BUCKET} does not exist and could not be created ` +
      `(S3 CreateBucket -> ${put.status}: ${putBody}). Create it in the ` +
      `Cloudflare dashboard or use an Admin Read & Write R2 token.`
  )
}

export async function putObject(
  key: string,
  body: Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<void> {
  const res = await client.fetch(objectUrl(key), {
    method: "PUT",
    headers: { "content-type": contentType },
    // Uint8Array<ArrayBufferLike> vs BodyInit's ArrayBuffer-backed views
    body: body as BodyInit,
  })
  if (!res.ok) {
    throw new Error(`R2 PUT ${key} -> ${res.status}: ${await res.text()}`)
  }
}

/** Fetches an object; null when it does not exist. */
export async function getObject(key: string): Promise<Response | null> {
  const res = await client.fetch(objectUrl(key))
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`R2 GET ${key} -> ${res.status}: ${await res.text()}`)
  }
  return res
}

export async function deleteObject(key: string): Promise<void> {
  const res = await client.fetch(objectUrl(key), { method: "DELETE" })
  if (!res.ok) {
    throw new Error(`R2 DELETE ${key} -> ${res.status}: ${await res.text()}`)
  }
}

/** All keys under a prefix, following ListObjectsV2 pagination. */
export async function listKeys(prefix: string): Promise<string[]> {
  const keys: string[] = []
  let continuation: string | undefined
  do {
    let url = `${ENDPOINT}/${BUCKET}?list-type=2&prefix=${encodeURIComponent(prefix)}`
    if (continuation)
      url += `&continuation-token=${encodeURIComponent(continuation)}`
    const res = await client.fetch(url)
    if (!res.ok) {
      throw new Error(`R2 LIST ${prefix} -> ${res.status}: ${await res.text()}`)
    }
    const xml = await res.text()
    for (const match of xml.matchAll(/<Key>([^<]*)<\/Key>/g)) {
      keys.push(decodeXml(match[1]))
    }
    continuation = undefined
    if (xml.includes("<IsTruncated>true</IsTruncated>")) {
      const token = xml.match(
        /<NextContinuationToken>([^<]*)<\/NextContinuationToken>/
      )
      if (token) continuation = decodeXml(token[1])
    }
  } while (continuation)
  return keys
}
