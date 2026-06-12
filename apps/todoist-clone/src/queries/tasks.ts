import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Task, ViewId } from "@/lib/types"

export function projectIdForView(view: ViewId): string | undefined {
  if (view.startsWith("project:")) return view.slice("project:".length)
  if (view === "inbox") return "inbox"
  return undefined // today / upcoming / completed / filters fetch everything
}

export function useTasks(view: ViewId) {
  const projectId = projectIdForView(view)
  return useQuery({
    queryKey: ["tasks", projectId ?? "all"],
    queryFn: () => api.getTasks(projectId),
  })
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: api.getProjects })
}

export function useLabels() {
  return useQuery({ queryKey: ["labels"], queryFn: api.getLabels })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Task>) => api.createTask(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task"] })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) =>
      api.updateTask(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task"] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task"] })
    },
  })
}
