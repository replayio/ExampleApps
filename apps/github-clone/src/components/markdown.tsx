import { useMemo } from "react"
import DOMPurify from "dompurify"
import { marked } from "marked"

export function Markdown({ content }: { content: string }) {
  const html = useMemo(
    // marked.parse returns a string when no async extensions are installed.
    () => DOMPurify.sanitize(marked.parse(content, { async: false }) as string),
    [content]
  )
  return (
    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
