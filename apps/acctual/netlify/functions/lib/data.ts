// In-memory data store for the Acctual clone backend.

export type InvoiceStatus = "draft" | "sent" | "unpaid" | "overdue" | "paid" | "void"
export type BillStatus = "draft" | "approve" | "ready" | "paid"
export type PaymentMethodType = "crypto" | "fiat"

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
  type: PaymentMethodType
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

export const profile = {
  name: "Alex Smith",
  email: "alexsmith.mobbin+1@gmail.com",
  address: "1226 University Dr, Menlo Park, CA, 94025, USA",
}

export const contacts: Contact[] = [
  {
    id: "c1",
    name: "john smith",
    email: "jsmith.mobbin+1@gmail.com",
    address: "75 Ayer Rajah Cres, Singapore, 02, 139953, SGP",
    initials: "JS",
    avatarColor: "#1a1a1a",
  },
  {
    id: "c2",
    name: "Jane Doe",
    email: "jdoe@gmail.com",
    walletAddress: "jane d... doe",
    initials: "SJ.AI",
    avatarColor: "#111111",
  },
]

export const invoices: Invoice[] = [
  {
    id: "inv1",
    number: "ASM00001",
    status: "unpaid",
    contactId: "c1",
    currency: "USD",
    issueDate: "2025-10-23",
    dueDate: "2025-11-05",
    lineItems: [
      { id: "li1", description: "Brush Pack #10", qty: 1, price: 2.6 },
      { id: "li2", description: "UI Micro Kit", qty: 1, price: 5.6 },
    ],
    note: "Brush Pack #10 — Ink Stroke Mini. UI Micro Kit — component library.",
    discount: 2,
    paymentMethod: "USDT ETH",
    memo: null,
    paidDate: null,
    createdAt: "2025-10-23T10:00:00.000Z",
  },
  {
    id: "inv2",
    number: "ASM00002",
    status: "paid",
    contactId: "c1",
    currency: "USD",
    issueDate: "2025-10-23",
    dueDate: "2025-11-05",
    lineItems: [
      { id: "li3", description: "Brush Pack #10", qty: 1, price: 2.6 },
      { id: "li4", description: "UI Micro Kit", qty: 1, price: 5.6 },
    ],
    note: "Brush Pack #10 — Ink Stroke Mini. UI Micro Kit — component library.",
    discount: 2,
    paymentMethod: "USDT ETH",
    memo: "Paid to MetaMask Wallet",
    paidDate: "2025-10-24",
    createdAt: "2025-10-23T10:00:00.000Z",
  },
  {
    id: "inv3",
    number: "ASM00003",
    status: "overdue",
    contactId: "c2",
    currency: "USD",
    issueDate: "2025-09-15",
    dueDate: "2025-10-01",
    lineItems: [
      { id: "li5", description: "Brand identity package", qty: 1, price: 10000 },
      { id: "li6", description: "Website redesign", qty: 1, price: 10000 },
    ],
    note: null,
    discount: 0,
    paymentMethod: "USD ACH",
    memo: null,
    paidDate: null,
    createdAt: "2025-09-15T10:00:00.000Z",
  },
  {
    id: "inv4",
    number: "ASM00004",
    status: "draft",
    contactId: "c1",
    currency: "SGD",
    issueDate: "2025-10-23",
    dueDate: "2025-11-06",
    lineItems: [],
    note: null,
    discount: 0,
    paymentMethod: "USDT ETH",
    memo: null,
    paidDate: null,
    createdAt: "2025-10-23T12:00:00.000Z",
  },
]

export const bills: Bill[] = [
  {
    id: "b1",
    vendor: "Jane Doe",
    invoiceNumber: "TST0001",
    status: "draft",
    amount: 0.5,
    currency: "USD",
    method: "USD",
    methodType: "fiat",
    dueDate: "2025-10-24",
    paidDate: null,
    memo: "TEST",
    initials: "JD",
    avatarColor: "#111111",
  },
  {
    id: "b2",
    vendor: "Jane Doe",
    invoiceNumber: "B-2025-095",
    status: "paid",
    amount: 1,
    currency: "USD",
    method: "USD",
    methodType: "fiat",
    dueDate: "2025-11-07",
    paidDate: "2025-10-24",
    memo: "tools expenses",
    initials: "JD",
    avatarColor: "#111111",
  },
  {
    id: "b3",
    vendor: "John Smith",
    invoiceNumber: "",
    status: "paid",
    amount: 1,
    currency: "ETH",
    method: "ETH",
    methodType: "crypto",
    dueDate: "2025-10-27",
    paidDate: "2025-10-27",
    memo: "Transfer for payment flow",
    initials: "JO",
    avatarColor: "#7c3aed",
  },
  {
    id: "b4",
    vendor: "Jane Doe",
    invoiceNumber: "B-2025-096",
    status: "ready",
    amount: 9.3,
    currency: "USD",
    method: "USD",
    methodType: "fiat",
    dueDate: "2025-11-10",
    paidDate: null,
    memo: "design stock",
    initials: "JD",
    avatarColor: "#111111",
  },
]

export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    name: "ASMobbin",
    type: "crypto",
    network: "Ethereum",
    asset: "USDT",
    walletAddress: "0xDEAF...fB8B",
    flexible: true,
  },
  {
    id: "pm2",
    name: "Alex Smith",
    type: "fiat",
    currency: "USD",
    flexible: true,
  },
]

export const transactions: Transaction[] = [
  {
    id: "t1",
    date: "2025-10-27",
    to: "John Smith",
    amount: 1,
    currency: "ETH",
    status: "Completed",
    reference: "Internal transfer",
  },
  {
    id: "t2",
    date: "2025-10-24",
    to: "Jane Doe",
    amount: 1,
    currency: "USD",
    status: "Completed",
    reference: "B-2025-095",
  },
]

let nextId = 100
export function makeId(prefix: string) {
  return `${prefix}${nextId++}`
}

export function invoiceTotal(inv: Invoice) {
  const subtotal = inv.lineItems.reduce((s, i) => s + i.qty * i.price, 0)
  return Math.max(0, subtotal - inv.discount)
}
