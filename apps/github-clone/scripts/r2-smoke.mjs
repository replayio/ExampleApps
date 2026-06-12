// R2 connectivity smoke test: bucket create, PUT/GET/LIST/DELETE an object.
// Usage: node scripts/r2-smoke.mjs   (reads .env; never prints credentials)

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { AwsClient } from "aws4fetch"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function loadEnv(path) {
  const env = {}
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const env = loadEnv(join(root, ".env"))
const endpoint = env.R2_ENDPOINT
const bucket = env.R2_BUCKET || "github-clone"

for (const name of [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
]) {
  if (!env[name]) {
    console.error(`FAIL setup: ${name} missing from .env`)
    process.exit(1)
  }
}

const client = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  region: "auto",
  service: "s3",
})

const KEY = "smoke-test/hello.txt"
const PAYLOAD = `hello from r2-smoke ${new Date().toISOString()}`

let failed = false

function report(step, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? `: ${detail}` : ""}`)
  if (!ok) failed = true
}

// 1. Ensure bucket: HEAD (object-scoped tokens can't CreateBucket), then
//    S3 PUT (200 = created, 409 = already owned), then Cloudflare REST API.
{
  let ok = false
  let detail = ""
  const head = await client.fetch(`${endpoint}/${bucket}`, { method: "HEAD" })
  if (head.status === 200) {
    ok = true
    detail = "already exists"
  } else {
    const put = await client.fetch(`${endpoint}/${bucket}`, { method: "PUT" })
    if (put.status === 200 || put.status === 409) {
      ok = true
      detail = `created via S3 (status ${put.status})`
    } else {
      detail = `S3 CreateBucket status ${put.status} ${await put.text()}`
      if (env.R2_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN) {
        const rest = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${env.R2_ACCOUNT_ID}/r2/buckets`,
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({ name: bucket }),
          }
        )
        const restBody = await rest.text()
        if (rest.ok || restBody.includes('"code":10004')) {
          ok = true
          detail = "created via Cloudflare REST API"
        } else {
          detail += `; REST create status ${rest.status} ${restBody}`
        }
      }
    }
  }
  report("ensure bucket", ok, detail)
  if (!ok) {
    console.error(
      "Bucket missing and the token cannot create buckets (needs Admin " +
        "Read & Write). Create the bucket manually, then re-run."
    )
    process.exit(1)
  }
}

const objectUrl = `${endpoint}/${bucket}/${KEY}`

// 2. PUT object
{
  const res = await client.fetch(objectUrl, {
    method: "PUT",
    headers: { "content-type": "text/plain" },
    body: PAYLOAD,
  })
  report(
    "put object",
    res.ok,
    res.ok ? `status ${res.status}` : `status ${res.status} ${await res.text()}`
  )
}

// 3. GET object back and compare
{
  const res = await client.fetch(objectUrl)
  const body = res.ok ? await res.text() : await res.text()
  const ok = res.ok && body === PAYLOAD
  report(
    "get object",
    ok,
    res.ok
      ? ok
        ? "content matches"
        : "content mismatch"
      : `status ${res.status} ${body}`
  )
}

// 4. ListObjectsV2 with prefix, expect the key
{
  const res = await client.fetch(
    `${endpoint}/${bucket}?list-type=2&prefix=${encodeURIComponent("smoke-test/")}`
  )
  const xml = await res.text()
  const ok = res.ok && xml.includes(`<Key>${KEY}</Key>`)
  report(
    "list objects",
    ok,
    res.ok
      ? ok
        ? "key found"
        : "key not in listing"
      : `status ${res.status} ${xml}`
  )
}

// 5. DELETE object
{
  const res = await client.fetch(objectUrl, { method: "DELETE" })
  report(
    "delete object",
    res.ok,
    res.ok ? `status ${res.status}` : `status ${res.status} ${await res.text()}`
  )
}

process.exit(failed ? 1 : 0)
