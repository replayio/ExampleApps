import type { Config, Context } from "@netlify/functions"
import {
  invoices,
  bills,
  contacts,
  paymentMethods,
  transactions,
  profile,
  makeId,
  type Invoice,
  type Bill,
  type Contact,
} from "./lib/data.ts"

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, "") || "/"
  const method = req.method

  if (path === "/profile" && method === "GET") return json(profile)

  if (path === "/contacts" && method === "GET") return json(contacts)

  if (path === "/contacts" && method === "POST") {
    const body = (await req.json()) as Partial<Contact>
    const contact: Contact = {
      id: makeId("c"),
      name: (body.name || "").trim(),
      email: (body.email || "").trim(),
      address: body.address,
      taxId: body.taxId,
      walletAddress: body.walletAddress,
      initials: body.initials ?? body.name?.slice(0, 2).toUpperCase(),
      avatarColor: body.avatarColor ?? "#1a1a1a",
    }
    contacts.push(contact)
    return json(contact, 201)
  }

  if (path === "/invoices" && method === "GET") {
    const status = url.searchParams.get("status")
    const list = status
      ? invoices.filter((i) => i.status === status)
      : invoices
    return json(list)
  }

  if (path === "/invoices" && method === "POST") {
    const body = (await req.json()) as Partial<Invoice>
    const inv: Invoice = {
      id: makeId("inv"),
      number: body.number || `ASM${String(invoices.length + 1).padStart(5, "0")}`,
      status: body.status || "draft",
      contactId: body.contactId || contacts[0].id,
      currency: body.currency || "USD",
      issueDate: body.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: body.dueDate || new Date().toISOString().slice(0, 10),
      lineItems: body.lineItems || [],
      note: body.note ?? null,
      discount: body.discount ?? 0,
      paymentMethod: body.paymentMethod || "USDT ETH",
      memo: body.memo ?? null,
      paidDate: null,
      createdAt: new Date().toISOString(),
    }
    invoices.push(inv)
    return json(inv, 201)
  }

  const invMatch = path.match(/^\/invoices\/([^/]+)$/)
  if (invMatch) {
    const id = invMatch[1]
    const idx = invoices.findIndex((i) => i.id === id)
    if (idx === -1) return json({ error: "not found" }, 404)
    if (method === "PATCH") {
      const body = (await req.json()) as Partial<Invoice>
      invoices[idx] = { ...invoices[idx], ...body, id }
      return json(invoices[idx])
    }
    if (method === "DELETE") {
      const [removed] = invoices.splice(idx, 1)
      return json(removed)
    }
    if (method === "GET") return json(invoices[idx])
  }

  if (path === "/bills" && method === "GET") {
    const status = url.searchParams.get("status")
    const list = status ? bills.filter((b) => b.status === status) : bills
    return json(list)
  }

  if (path === "/payment-methods" && method === "GET") return json(paymentMethods)

  if (path === "/transactions" && method === "GET") return json(transactions)

  return json({ error: "not found", path }, 404)
}

export const config: Config = {
  path: "/api/*",
}
