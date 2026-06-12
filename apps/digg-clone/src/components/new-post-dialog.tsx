import { useState } from "react"
import { Link, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { useCommunities, useCreateStory } from "@/queries/stories"
import { useUIStore } from "@/store/ui-store"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function NewPostDialog() {
  const open = useUIStore((state) => state.newPostOpen)
  const setOpen = useUIStore((state) => state.setNewPostOpen)
  const feed = useUIStore((state) => state.feed)
  const { data: communities = [] } = useCommunities()
  const createStory = useCreateStory()
  const defaultCommunity = feed.startsWith("community:")
    ? feed.slice("community:".length)
    : "technology"

  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [url, setUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [communityId, setCommunityId] = useState(defaultCommunity)

  const reset = () => {
    setTitle("")
    setSummary("")
    setUrl("")
    setImageUrl("")
  }

  const submit = () => {
    if (!title.trim() || !url.trim()) return
    createStory.mutate(
      {
        title,
        summary,
        url,
        imageUrl: imageUrl || null,
        communityId,
      },
      {
        onSuccess: () => {
          toast.success("Post added")
          reset()
          setOpen(false)
        },
        onError: () => toast.error("Could not add post"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-[24px] p-0">
        <DialogTitle className="sr-only">New post</DialogTitle>
        <div className="border-b border-[#ececf1] px-6 py-5">
          <h2 className="text-2xl font-black">New post</h2>
        </div>

        <div className="space-y-4 p-6">
          <Input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Headline"
            className="h-12 text-base font-semibold"
          />
          <Textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Short summary"
            rows={3}
            className="resize-none text-base"
          />
          <label className="flex items-center gap-2 rounded-lg border border-[#dedee4] px-3 py-2">
            <Link className="size-5 text-[#777887]" />
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://source.example/story"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-[#dedee4] px-3 py-2">
            <ImageIcon className="size-5 text-[#777887]" />
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="Optional image URL"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>

          <Select value={communityId} onValueChange={setCommunityId}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {communities.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  /{community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#ececf1] px-6 py-4">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!title.trim() || !url.trim() || createStory.isPending}
            className="bg-[#111119] hover:bg-[#242431]"
          >
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
