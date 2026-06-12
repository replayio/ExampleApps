import { create } from "zustand"
import type { BillStatus, InvoiceStatus, ViewId } from "@/lib/types"

interface UIState {
  view: ViewId
  invoiceTab: InvoiceStatus | "all"
  billTab: BillStatus
  paymentsTab: "receive" | "transfer"
  selectedInvoiceId: string | null
  createInvoiceOpen: boolean
  viewInvoiceOpen: boolean
  addContactOpen: boolean

  setView: (view: ViewId) => void
  setInvoiceTab: (tab: InvoiceStatus | "all") => void
  setBillTab: (tab: BillStatus) => void
  setPaymentsTab: (tab: "receive" | "transfer") => void
  selectInvoice: (id: string | null) => void
  setCreateInvoiceOpen: (open: boolean) => void
  setViewInvoiceOpen: (open: boolean) => void
  setAddContactOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  view: "invoices",
  invoiceTab: "unpaid",
  billTab: "draft",
  paymentsTab: "receive",
  selectedInvoiceId: null,
  createInvoiceOpen: false,
  viewInvoiceOpen: false,
  addContactOpen: false,

  setView: (view) => set({ view }),
  setInvoiceTab: (tab) => set({ invoiceTab: tab }),
  setBillTab: (tab) => set({ billTab: tab }),
  setPaymentsTab: (tab) => set({ paymentsTab: tab }),
  selectInvoice: (id) => set({ selectedInvoiceId: id }),
  setCreateInvoiceOpen: (open) => set({ createInvoiceOpen: open }),
  setViewInvoiceOpen: (open) => set({ viewInvoiceOpen: open }),
  setAddContactOpen: (open) => set({ addContactOpen: open }),
}))
