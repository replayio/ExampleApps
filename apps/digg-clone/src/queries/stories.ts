import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useSavedStore } from "@/store/saved-store"
import type {
  FeedId,
  FeedResponse,
  NewStoryInput,
  Story,
  VoteState,
} from "@/lib/types"

function replaceStory(stories: Story[], updated: Story) {
  return stories.map((story) => (story.id === updated.id ? updated : story))
}

function patchStoryCaches(
  qc: ReturnType<typeof useQueryClient>,
  updated: Story,
  mode: "replace" | "prepend" = "replace"
) {
  qc.setQueriesData<FeedResponse>({ queryKey: ["stories"] }, (old) => {
    if (!old) return old
    const exists = old.stories.some((story) => story.id === updated.id)
    return {
      ...old,
      stories:
        mode === "prepend" && !exists
          ? [updated, ...old.stories]
          : replaceStory(old.stories, updated),
    }
  })
  qc.setQueriesData<{ query: string; results: Story[] }>(
    { queryKey: ["search"] },
    (old) => {
      if (!old) return old
      return { ...old, results: replaceStory(old.results, updated) }
    }
  )
  qc.setQueriesData<Story[]>({ queryKey: ["featured"] }, (old) =>
    old ? replaceStory(old, updated) : old
  )
}

export function useStories(feed: FeedId, q = "") {
  return useQuery({
    queryKey: ["stories", feed, q],
    queryFn: () => api.getFeed(feed, q),
    staleTime: 1000 * 60 * 4,
  })
}

export function useCommunities() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: api.getCommunities,
    staleTime: 1000 * 60 * 30,
  })
}

export function useDailyEpisode() {
  return useQuery({
    queryKey: ["daily"],
    queryFn: api.getDailyEpisode,
    staleTime: 1000 * 60 * 60,
  })
}

export function useFeaturedStories() {
  return useQuery({
    queryKey: ["featured"],
    queryFn: api.getFeatured,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewStoryInput) => api.createStory(input),
    onSuccess: (story) => {
      patchStoryCaches(qc, story, "prepend")
    },
  })
}

export function useVoteStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ story, vote }: { story: Story; vote: VoteState }) =>
      api.voteStory(story, vote),
    onSuccess: (story) => {
      patchStoryCaches(qc, story)
    },
  })
}

export function useToggleSaveStory() {
  const qc = useQueryClient()
  const syncSaved = useSavedStore((state) => state.sync)
  return useMutation({
    mutationFn: (story: Story) => api.toggleSave(story),
    onSuccess: (story) => {
      // The feed API runs on stateless serverless instances, so the saved flag
      // set here cannot be relied upon for the "saved" feed. Persist the saved
      // set client-side so the Saved view is always populated correctly.
      syncSaved(story)
      patchStoryCaches(qc, story)
    },
  })
}
