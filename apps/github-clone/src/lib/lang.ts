// Only languages registered by lowlight's "common" bundle (aliases included).
const EXT_LANG: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  cs: "csharp",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  markdown: "markdown",
  html: "xml",
  htm: "xml",
  xml: "xml",
  svg: "xml",
  css: "css",
  scss: "scss",
  less: "less",
  sql: "sql",
  toml: "ini",
  ini: "ini",
  swift: "swift",
  kt: "kotlin",
  kts: "kotlin",
  php: "php",
  graphql: "graphql",
  gql: "graphql",
  lua: "lua",
  pl: "perl",
  r: "r",
  diff: "diff",
  patch: "diff",
  txt: "plaintext",
}

export function langFromPath(path: string): string | null {
  const base = path.split("/").pop()?.toLowerCase() ?? ""
  if (base === "makefile") return "makefile"
  const dot = base.lastIndexOf(".")
  if (dot <= 0) return null
  return EXT_LANG[base.slice(dot + 1)] ?? null
}

// GitHub language dot colors.
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  PHP: "#4F5D95",
}

export function languageColor(language: string | null): string {
  return (language && LANG_COLORS[language]) || "#8b949e"
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = n
  let unit = 0
  do {
    value /= 1024
    unit++
  } while (value >= 1024 && unit < units.length)
  const rounded = value >= 100 ? Math.round(value).toString() : value.toFixed(1)
  return `${rounded} ${units[unit - 1]}`
}

const IMAGE_MIMES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",
}

export function isImagePath(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  return ext in IMAGE_MIMES
}

export function mimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? ""
  return IMAGE_MIMES[ext] ?? "application/octet-stream"
}
