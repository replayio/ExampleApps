import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Contact, Invoice } from "@/lib/types"

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: api.getProfile })
}

export function useContacts() {
  return useQuery({ queryKey: ["contacts"], queryFn: api.getContacts })
}

export function useInvoices(status?: string) {
  return useQuery({
    queryKey: ["invoices", status ?? "all"],
    queryFn: () => api.getInvoices(status),
  })
}

export function useBills(status?: string) {
  return useQuery({
    queryKey: ["bills", status ?? "all"],
    queryFn: () => api.getBills(status),
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: api.getPaymentMethods,
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: api.getTransactions,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Contact>) => api.createContact(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Invoice>) => api.createInvoice(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Invoice> }) =>
      api.updateInvoice(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  })
}
