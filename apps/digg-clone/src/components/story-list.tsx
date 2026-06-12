import type { Story } from "@/lib/types"
import { StoryCard } from "@/components/story-card"

export function StoryList({
  stories,
  loading,
}: {
  stories: Story[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="py-14 text-center text-sm font-medium text-[#777887]">
        Loading stories...
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <div className="py-20 text-center text-sm font-medium text-[#777887]">
        No stories found.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}
