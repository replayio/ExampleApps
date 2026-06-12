import { ArrowLeftRight, Copy, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import { useBills } from "@/queries/acctual"
import {
  BILL_TABS,
  formatDate,
  formatMoney,
  type BillStatus,
} from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function BillsView() {
  const billTab = useUIStore((s) => s.billTab)
  const setBillTab = useUIStore((s) => s.setBillTab)
  const { data: bills = [], isLoading } = useBills()

  const counts = BILL_TABS.reduce(
    (acc, tab) => {
      acc[tab.key] = bills.filter((b) => b.status === tab.key).length
      return acc
    },
    {} as Record<BillStatus, number>
  )

  const filtered = bills.filter((b) => b.status === billTab)

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white shadow-sm">
      <header className="flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Bills</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ArrowLeftRight className="size-4" /> Transfer funds
          </Button>
          <Button className="rounded-full bg-[#1a1a1a] hover:bg-[#333]" size="sm">
            <Plus className="size-4" /> Add bill
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-between border-b px-8">
        <div className="flex gap-6">
          {BILL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBillTab(tab.key)}
              className={cn(
                "flex items-center gap-2 border-b-2 py-3 text-sm transition-colors",
                billTab === tab.key
                  ? "border-foreground font-medium"
                  : "border-transparent text-muted-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[11px]",
                  billTab === tab.key
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 pb-3 text-xs text-muted-foreground">
          Forward invoices to bills@ap.acctual.com
          <Copy className="size-3" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-2">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No bills in this tab.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-3 font-medium">Vendor / Pay to</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Method</th>
                <th className="py-3 font-medium">
                  {billTab === "paid" ? "Paid date" : "Due date"}
                </th>
                <th className="py-3 font-medium">Invoice #</th>
                <th className="py-3 font-medium">Memo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => (
                <tr key={bill.id} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback
                          className="text-[10px] text-white"
                          style={{ backgroundColor: bill.avatarColor }}
                        >
                          {bill.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{bill.vendor}</div>
                        {bill.methodType === "crypto" && (
                          <div className="text-xs text-muted-foreground">
                            Internal Transfer
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-medium">
                    {formatMoney(bill.amount, bill.currency)}
                  </td>
                  <td className="py-3">
                    <div>{bill.method}</div>
                    <div className="text-xs capitalize text-muted-foreground">
                      {bill.methodType}
                    </div>
                  </td>
                  <td className="py-3">
                    <div>
                      {formatDate(
                        billTab === "paid" && bill.paidDate
                          ? bill.paidDate
                          : bill.dueDate
                      )}
                    </div>
                    {billTab === "draft" && (
                      <div className="text-xs text-red-500">Overdue 17 hours</div>
                    )}
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {bill.invoiceNumber || "—"}
                  </td>
                  <td className="py-3 text-muted-foreground">{bill.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
