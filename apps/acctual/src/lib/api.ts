import type {
  Bill,
  Contact,
  Invoice,
  PaymentMethod,
  Profile,
  Transaction,
} from "./types"

const BASE = "/api"

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  getProfile: () => http<Profile>("/profile"),
  getContacts: () => http<Contact[]>("/contacts"),
  createContact: (input: Partial<Contact>) =>
    http<Contact>("/contacts", { method: "POST", body: JSON.stringify(input) }),
  getInvoices: (status?: string) =>
    http<Invoice[]>(`/invoices${status ? `?status=${status}` : ""}`),
  getInvoice: (id: string) => http<Invoice>(`/invoices/${id}`),
  createInvoice: (input: Partial<Invoice>) =>
    http<Invoice>("/invoices", { method: "POST", body: JSON.stringify(input) }),
  updateInvoice: (id: string, patch: Partial<Invoice>) =>
    http<Invoice>(`/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  getBills: (status?: string) =>
    http<Bill[]>(`/bills${status ? `?status=${status}` : ""}`),
  getPaymentMethods: () => http<PaymentMethod[]>("/payment-methods"),
  getTransactions: () => http<Transaction[]>("/transactions"),
}
