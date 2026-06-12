export type ViewId = "invoices" | "payments" | "bills" | "contacts"

export type InvoiceStatus = "draft" | "sent" | "unpaid" | "overdue" | "paid" | "void"
export type BillStatus = "draft" | "approve" | "ready" | "paid"

export interface LineItem {
  id: string
  description: string
  qty: number
  price: number
}

export interface Contact {
  id: string
  name: string
  email: string
  address?: string
  taxId?: string
  walletAddress?: string
  initials?: string
  avatarColor?: string
}

export interface Invoice {
  id: string
  number: string
  status: InvoiceStatus
  contactId: string
  currency: string
  issueDate: string
  dueDate: string
  lineItems: LineItem[]
  note: string | null
  discount: number
  paymentMethod: string
  memo: string | null
  paidDate: string | null
  createdAt: string
}

export interface Bill {
  id: string
  vendor: string
  invoiceNumber: string
  status: BillStatus
  amount: number
  currency: string
  method: string
  methodType: "fiat" | "crypto"
  dueDate: string
  paidDate: string | null
  memo: string
  initials: string
  avatarColor: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: "crypto" | "fiat"
  network?: string
  asset?: string
  walletAddress?: string
  currency?: string
  flexible: boolean
}

export interface Transaction {
  id: string
  date: string
  to: string
  amount: number
  currency: string
  status: string
  reference: string
}

export interface Profile {
  name: string
  email: string
  address: string
}

export const INVOICE_TABS: { key: InvoiceStatus | "all"; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "unpaid", label: "Unpaid" },
  { key: "overdue", label: "Overdue" },
  { key: "paid", label: "Paid" },
]

export const BILL_TABS: { key: BillStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "approve", label: "Approve" },
  { key: "ready", label: "Ready for payment" },
  { key: "paid", label: "Paid" },
]

export function formatMoney(amount: number, currency: string) {
  const sym = currency === "SGD" ? "SGD " : currency === "ETH" ? "" : "$"
  const suffix = currency === "ETH" ? " ETH" : ""
  return `${sym}${amount.toFixed(2)}${suffix}`
}

export function invoiceSubtotal(inv: Invoice) {
  return inv.lineItems.reduce((s, i) => s + i.qty * i.price, 0)
}

export function invoiceTotal(inv: Invoice) {
  return Math.max(0, invoiceSubtotal(inv) - inv.discount)
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00")
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
