import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import { useContacts, useInvoices } from "@/queries/acctual"
import {
  INVOICE_TABS,
  formatDate,
  formatMoney,
  invoiceTotal,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const styles: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-600",
    unpaid: "bg-amber-50 text-amber-700",
    overdue: "bg-red-50 text-red-600",
    paid: "bg-emerald-50 text-emerald-700",
    sent: "bg-blue-50 text-blue-700",
    void: "bg-neutral-100 text-neutral-500",
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
        styles[status] ?? styles.draft
      )}
    >
      {status}
    </span>
  )
}

export function InvoicesView() {
  const invoiceTab = useUIStore((s) => s.invoiceTab)
  const setInvoiceTab = useUIStore((s) => s.setInvoiceTab)
  const setCreateInvoiceOpen = useUIStore((s) => s.setCreateInvoiceOpen)
  const selectInvoice = useUIStore((s) => s.selectInvoice)
  const setViewInvoiceOpen = useUIStore((s) => s.setViewInvoiceOpen)

  const { data: invoices = [], isLoading } = useInvoices()
  const { data: contacts = [] } = useContacts()

  const counts = INVOICE_TABS.reduce(
    (acc, tab) => {
      acc[tab.key] = invoices.filter((i) => i.status === tab.key).length
      return acc
    },
    {} as Record<string, number>
  )

  const overdueTotal = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + invoiceTotal(i), 0)

  const filtered =
    invoiceTab === "all"
      ? invoices
      : invoices.filter((i) => i.status === invoiceTab)

  const openInvoice = (inv: Invoice) => {
    selectInvoice(inv.id)
    setViewInvoiceOpen(true)
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white shadow-sm">
      <header className="flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <Button
          className="rounded-full bg-[#1a1a1a] px-4 hover:bg-[#333]"
          onClick={() => setCreateInvoiceOpen(true)}
        >
          <Plus className="size-4" /> Create invoice
        </Button>
      </header>

      {overdueTotal > 0 && (
        <div className="mx-8 mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {counts.overdue ?? 0} overdue · {formatMoney(overdueTotal, "USD")}
        </div>
      )}

      <div className="flex items-center gap-6 border-b px-8">
        {INVOICE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setInvoiceTab(tab.key)}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 text-sm transition-colors",
              invoiceTab === tab.key
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[11px]",
                invoiceTab === tab.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-2">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No invoices in this tab.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-3 font-medium">Customer</th>
                <th className="py-3 font-medium">Invoice #</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Due date</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const contact = contacts.find((c) => c.id === inv.contactId)
                return (
                  <tr
                    key={inv.id}
                    onClick={() => openInvoice(inv)}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/40"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <AvatarFallback
                            className="text-[10px] text-white"
                            style={{
                              backgroundColor:
                                contact?.avatarColor ?? "#1a1a1a",
                            }}
                          >
                            {contact?.initials ??
                              contact?.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{contact?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-xs">{inv.number}</td>
                    <td className="py-3 font-medium">
                      {formatMoney(invoiceTotal(inv), inv.currency)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {inv.paymentMethod}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
