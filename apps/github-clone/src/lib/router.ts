import { useEffect, useState } from "react"

export type Route =
  | { kind: "dashboard" }
  | {
      kind: "repo"
      owner: string
      name: string
      view: "tree" | "blob"
      path: string
    }

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "")
  if (!raw) return { kind: "dashboard" }
  const [owner, name, view, ...rest] = raw.split("/").map(decodeURIComponent)
  if (!owner || !name) return { kind: "dashboard" }
  if (view === "tree" || view === "blob") {
    return { kind: "repo", owner, name, view, path: rest.join("/") }
  }
  return { kind: "repo", owner, name, view: "tree", path: "" }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash))
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(location.hash))
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])
  return route
}

export function navigate(to: string) {
  location.hash = to
}

const encodePath = (path: string) =>
  path.split("/").map(encodeURIComponent).join("/")

export const repoUrl = (owner: string, name: string) => `#/${owner}/${name}`

export const treeUrl = (owner: string, name: string, path: string) =>
  path ? `#/${owner}/${name}/tree/${encodePath(path)}` : repoUrl(owner, name)

export const blobUrl = (owner: string, name: string, path: string) =>
  `#/${owner}/${name}/blob/${encodePath(path)}`
