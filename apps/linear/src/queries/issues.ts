import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Issue, ViewId } from "@/lib/types"

export function scopeForView(view: ViewId): {
  teamId?: string
  projectId?: string
} {
  if (view.startsWith("team:")) return { teamId: view.slice("team:".length) }
  if (view.startsWith("project:")) return { projectId: view.slice("project:".length) }
  return {}
}

export function useIssues(view: ViewId) {
  const scope = scopeForView(view)
  const key = scope.teamId ?? scope.projectId ?? "all"
  return useQuery({
    queryKey: ["issues", key],
    queryFn: () => api.getIssues(scope),
  })
}

export function useTeams() {
  return useQuery({ queryKey: ["teams"], queryFn: api.getTeams })
}

export function useProjects(teamId?: string) {
  return useQuery({
    queryKey: ["projects", teamId ?? "all"],
    queryFn: () => api.getProjects(teamId),
  })
}

export function useLabels() {
  return useQuery({ queryKey: ["labels"], queryFn: api.getLabels })
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: api.getUsers,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Issue> & { teamId: string }) =>
      api.createIssue(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] })
    },
  })
}

export function useUpdateIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Issue> }) =>
      api.updateIssue(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] })
    },
  })
}

export function useDeleteIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteIssue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] })
    },
  })
}
