import { useMemo } from "react"
import { common, createLowlight } from "lowlight"
import { toHtml } from "hast-util-to-html"

import { langFromPath } from "@/lib/lang"

const lowlight = createLowlight(common)

function HighlightedCode({
  code,
  language,
}: {
  code: string
  language: string | null
}) {
  const html = useMemo(() => {
    if (language && lowlight.registered(language)) {
      try {
        return toHtml(lowlight.highlight(language, code))
      } catch {
        /* fall through to plain */
      }
    }
    return null
  }, [code, language])

  if (html === null) return <code>{code}</code>
  return <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
}

export function CodeView({ path, content }: { path: string; content: string }) {
  const language = langFromPath(path)
  const code = content.endsWith("\n") ? content.slice(0, -1) : content
  const lineCount = code === "" ? 1 : code.split("\n").length

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max font-mono text-xs leading-5">
        <div className="sticky left-0 shrink-0 bg-background py-2 pr-4 pl-4 text-right text-muted-foreground select-none">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 py-2 pr-4 whitespace-pre [&_code.hljs]:bg-transparent [&_code.hljs]:p-0">
          <HighlightedCode code={code} language={language} />
        </pre>
      </div>
    </div>
  )
}
