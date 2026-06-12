import { useState } from "react"
import {
  Bold,
  ChevronDown,
  Code2,
  History,
  Image,
  Info,
  Italic,
  Link,
  List,
  ListOrdered,
  MessageSquareQuote,
  RotateCcw,
  RotateCw,
  Settings,
  Strikethrough,
  Upload,
  Video,
  Headphones,
} from "lucide-react"
import { toast } from "sonner"
import type { Draft } from "@/lib/types"
import { usePublishDraft, useSaveDraft } from "@/queries/substack"
import { useUIStore } from "@/store/ui-store"
import { SubstackLogo } from "@/components/substack-logo"
import { Button } from "@/components/ui/button"

const fallbackDraft: Draft = {
  id: "draft",
  title: "",
  subtitle: "",
  author: "Sam Lee",
  body: "",
  imageUrls: [],
  imageCaption: "",
  savedAt: new Date().toISOString(),
  status: "draft",
}

function ToolbarButton({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-md text-[#333] hover:bg-[#f2f2f2]"
    >
      {children}
    </button>
  )
}

function EditorBody({ initialDraft }: { initialDraft: Draft }) {
  const setView = useUIStore((state) => state.setView)
  const saveDraft = useSaveDraft()
  const publishDraft = usePublishDraft()
  const [localDraft, setLocalDraft] = useState<Draft>(initialDraft)

  const patch = (partial: Partial<Draft>) =>
    setLocalDraft((current) => ({ ...current, ...partial }))

  const save = () => {
    saveDraft.mutate(localDraft, {
      onSuccess: (updated) => {
        setLocalDraft(updated)
        toast.success("Draft saved")
      },
    })
  }

  const publish = () => {
    publishDraft.mutate(localDraft, {
      onSuccess: () => {
        toast.success("Post published")
        setView("home")
      },
    })
  }

  return (
    <section className="flex h-svh flex-1 flex-col overflow-hidden bg-white">
      <header className="flex h-20 shrink-0 items-center justify-between px-8">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setView("home")}
            className="text-3xl leading-none text-[#242424]"
            aria-label="Back"
          >
            ‹
          </button>
          <span className="rounded-md border border-[#ddd] px-3 py-1 text-sm font-medium">
            <span className="mr-2 inline-block size-2 rounded-full bg-[#18c58c]" />
            Saved
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-12 rounded-lg px-6 text-lg"
            onClick={save}
          >
            Preview
          </Button>
          <Button
            onClick={publish}
            className="h-12 rounded-lg bg-[#ff6719] px-6 text-lg font-bold hover:bg-[#ec5a10]"
          >
            Continue
          </Button>
        </div>
      </header>

      <div className="flex h-16 shrink-0 items-center justify-center gap-5 border-b border-transparent text-[#333]">
        <ToolbarButton label="Undo"><RotateCcw className="size-6" /></ToolbarButton>
        <ToolbarButton label="Redo"><RotateCw className="size-6 text-[#bbb]" /></ToolbarButton>
        <span className="h-10 w-px bg-[#e7e7e7]" />
        <button className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold hover:bg-[#f2f2f2]">
          Style <ChevronDown className="size-4" />
        </button>
        <span className="h-10 w-px bg-[#e7e7e7]" />
        <ToolbarButton label="Bold"><Bold className="size-6" /></ToolbarButton>
        <ToolbarButton label="Italic"><Italic className="size-6" /></ToolbarButton>
        <ToolbarButton label="Strikethrough"><Strikethrough className="size-6" /></ToolbarButton>
        <ToolbarButton label="Code"><Code2 className="size-6" /></ToolbarButton>
        <span className="h-10 w-px bg-[#e7e7e7]" />
        <ToolbarButton label="Link"><Link className="size-6" /></ToolbarButton>
        <ToolbarButton label="Image"><Image className="size-6" /></ToolbarButton>
        <ToolbarButton label="Audio"><Headphones className="size-6" /></ToolbarButton>
        <ToolbarButton label="Video"><Video className="size-6" /></ToolbarButton>
        <ToolbarButton label="Quote"><MessageSquareQuote className="size-6" /></ToolbarButton>
        <span className="h-10 w-px bg-[#e7e7e7]" />
        <ToolbarButton label="Bulleted list"><List className="size-6" /></ToolbarButton>
        <ToolbarButton label="Numbered list"><ListOrdered className="size-6" /></ToolbarButton>
        <span className="h-10 w-px bg-[#e7e7e7]" />
        <button className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold hover:bg-[#f2f2f2]">
          Button <ChevronDown className="size-4" />
        </button>
        <span className="h-10 w-px bg-[#e7e7e7]" />
        <button className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold hover:bg-[#f2f2f2]">
          More <ChevronDown className="size-4" />
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-8 pb-28">
        <article className="mx-auto max-w-[980px] pt-14">
          <button className="mb-12 flex items-center gap-2 text-base font-semibold text-[#333]">
            <span className="inline-flex size-5 items-center justify-center rounded border border-[#555]">
              =
            </span>
            Email header / footer
          </button>

          <input
            value={localDraft.title}
            onChange={(event) => patch({ title: event.target.value })}
            className="w-full bg-transparent font-serif text-[44px] font-semibold leading-tight text-[#3b3835] outline-none"
            placeholder="Title"
          />
          <input
            value={localDraft.subtitle}
            onChange={(event) => patch({ subtitle: event.target.value })}
            className="mt-7 w-full bg-transparent font-serif text-[27px] leading-tight text-[#827d78] outline-none"
            placeholder="Subtitle"
          />
          <div className="mt-12 flex items-center gap-3">
            <span className="rounded-full bg-[#efefef] px-4 py-2 text-base">
              {localDraft.author}
              <button className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-[#c8c8c8] text-white">
                ×
              </button>
            </span>
            <button className="text-3xl text-[#777]">+</button>
          </div>

          <textarea
            value={localDraft.body}
            onChange={(event) => patch({ body: event.target.value })}
            rows={Math.max(6, localDraft.body.split("\n").length + 5)}
            className="mt-10 w-full resize-none overflow-hidden bg-transparent font-serif text-[27px] leading-[1.55] text-[#34312f] outline-none"
          />

          <div className="mt-8 grid grid-cols-2 gap-2">
            {localDraft.imageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-[460px] w-full object-cover"
              />
            ))}
          </div>
          <input
            value={localDraft.imageCaption}
            onChange={(event) => patch({ imageCaption: event.target.value })}
            className="mt-3 w-full bg-transparent text-center font-serif text-lg text-[#827d78] outline-none"
            placeholder="Caption"
          />
        </article>
      </main>

      <div className="fixed bottom-5 left-5 flex gap-3">
        <button className="flex size-12 items-center justify-center rounded-lg bg-[#f0f0f0]">
          <History className="size-6" />
        </button>
        <button className="flex size-12 items-center justify-center rounded-lg bg-[#f0f0f0]">
          <Info className="size-6" />
        </button>
      </div>
      <button className="fixed bottom-5 right-5 flex h-12 items-center gap-3 rounded-lg bg-[#f0f0f0] px-5 text-lg font-semibold">
        <Settings className="size-6" />
        Settings
      </button>
      <div className="fixed bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-sm text-[#aaa] xl:flex">
        <Upload className="size-4" />
        <SubstackLogo compact />
      </div>
    </section>
  )
}

export function EditorView({ draft }: { draft?: Draft }) {
  const initialDraft = draft ?? fallbackDraft
  return <EditorBody key={initialDraft.id} initialDraft={initialDraft} />
}
