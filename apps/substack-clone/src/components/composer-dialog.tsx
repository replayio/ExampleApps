import { useState } from "react"
import { toast } from "sonner"
import { useCreateNote } from "@/queries/substack"
import { useUIStore } from "@/store/ui-store"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ComposerDialog() {
  const open = useUIStore((state) => state.composerOpen)
  const setOpen = useUIStore((state) => state.setComposerOpen)
  const create = useCreateNote()
  const [body, setBody] = useState("")

  const submit = () => {
    if (!body.trim()) return
    create.mutate(
      { body },
      {
        onSuccess: () => {
          toast.success("Note posted")
          setBody("")
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl rounded-2xl p-0">
        <DialogTitle className="sr-only">Create note</DialogTitle>
        <div className="border-b border-[#eee] px-5 py-4 text-lg font-semibold">
          Create note
        </div>
        <textarea
          autoFocus
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What's on your mind?"
          rows={7}
          className="w-full resize-none bg-transparent px-5 py-4 text-xl outline-none placeholder:text-[#888]"
        />
        <div className="flex justify-end gap-2 border-t border-[#eee] px-5 py-4">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!body.trim() || create.isPending}
            className="bg-[#ff6719] hover:bg-[#ec5a10]"
          >
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
