import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  DashboardResponse,
  Draft,
  FeedFilter,
  FeedPost,
  Publication,
} from "@/lib/types"

function replacePost(posts: FeedPost[], updated: FeedPost, preserveFlags = false) {
  return posts.map((post) =>
    post.id === updated.id
      ? {
          ...updated,
          liked: preserveFlags ? post.liked || updated.liked : updated.liked,
          saved: preserveFlags ? post.saved || updated.saved : updated.saved,
        }
      : post
  )
}

function patchPostCaches(
  qc: ReturnType<typeof useQueryClient>,
  updated: FeedPost,
  preserveFlags = false
) {
  qc.setQueriesData<DashboardResponse>({ queryKey: ["dashboard"] }, (old) => {
    if (!old) return old
    return {
      ...old,
      posts: replacePost(old.posts, updated, preserveFlags),
      upNext: replacePost(old.upNext, updated, preserveFlags),
    }
  })
  qc.setQueriesData<{ query: string; results: FeedPost[] }>(
    { queryKey: ["search"] },
    (old) =>
      old
        ? { ...old, results: replacePost(old.results, updated, preserveFlags) }
        : old
  )
}

function prependPostCaches(qc: ReturnType<typeof useQueryClient>, created: FeedPost) {
  qc.setQueriesData<DashboardResponse>({ queryKey: ["dashboard"] }, (old) =>
    old ? { ...old, posts: [created, ...old.posts] } : old
  )
}

export function useDashboard(filter: FeedFilter) {
  return useQuery({
    queryKey: ["dashboard", filter],
    queryFn: () => api.getDashboard(filter),
    staleTime: 1000 * 60 * 8,
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => api.search(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 4,
  })
}

export function usePublications() {
  return useQuery({
    queryKey: ["publications"],
    queryFn: api.getPublications,
    staleTime: 1000 * 60 * 20,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createNote,
    onSuccess: (post) => prependPostCaches(qc, post),
  })
}

export function useLikePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (post: FeedPost) => api.likePost(post),
    onSuccess: (post) => patchPostCaches(qc, post),
  })
}

export function useRestackPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (post: FeedPost) => api.restackPost(post),
    onSuccess: (post) => patchPostCaches(qc, post, true),
  })
}

export function useSavePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (post: FeedPost) => api.savePost(post),
    onSuccess: (post) => patchPostCaches(qc, post),
  })
}

export function useSubscribe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (publicationId: string) => api.subscribe(publicationId),
    onSuccess: (publication: Publication) => {
      qc.invalidateQueries({ queryKey: ["dashboard"] })
      qc.setQueriesData<Publication[]>({ queryKey: ["publications"] }, (old) =>
        old
          ? old.map((item) => (item.id === publication.id ? publication : item))
          : old
      )
    },
  })
}

export function useSaveDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: Draft) => api.saveDraft(draft),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  })
}

export function usePublishDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: Draft) => api.publishDraft(draft),
    onSuccess: (post) => prependPostCaches(qc, post),
  })
}
