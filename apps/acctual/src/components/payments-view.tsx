import { ChevronDown, Fingerprint, UserCheck, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import {
  usePaymentMethods,
  useTransactions,
} from "@/queries/acctual"
import { formatDate, formatMoney } from "@/lib/types"
import { Button } from "@/components/ui/button"

export function PaymentsView() {
  const paymentsTab = useUIStore((s) => s.paymentsTab)
  const setPaymentsTab = useUIStore((s) => s.setPaymentsTab)
  const { data: methods = [] } = usePaymentMethods()
  const { data: transactions = [] } = useTransactions()

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white shadow-sm">
      <header className="flex items-center justify-between px-8 pt-8 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <Button variant="outline" size="sm" className="gap-1">
          Actions <ChevronDown className="size-3.5" />
        </Button>
      </header>

      <div className="flex gap-6 border-b px-8">
        {(["receive", "transfer"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setPaymentsTab(tab)}
            className={cn(
              "border-b-2 py-3 text-sm capitalize transition-colors",
              paymentsTab === tab
                ? "border-foreground font-medium"
                : "border-transparent text-muted-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium">
            Let&apos;s set up how you want to get paid
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Clients can pay however they want — you always get what works for you
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-[#f8f8f8] p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-700">
              <span className="rounded bg-amber-100 px-1.5 py-0.5">PENDING</span>
            </div>
            <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span>🇺🇸</span>
              <span>🇪🇺</span>
              <span className="rounded bg-muted px-1">+12</span>
              <span>→</span>
              <span className="font-medium text-emerald-600">USDT</span>
            </div>
            <p className="text-sm">
              {methods.length} ways to USDT (
              {methods[0]?.walletAddress ?? "0xDEAF...fB8B"})
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <Wallet className="mb-3 size-5 text-muted-foreground" />
            <div className="font-medium">Choose where to get paid</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Wallet or bank — USDT, USD, EUR, and more
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <Fingerprint className="mb-3 size-5 text-muted-foreground" />
            <div className="font-medium">Verify your identity</div>
            <p className="mt-1 text-sm text-muted-foreground">
              A quick one-time check to unlock flexible payments
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <UserCheck className="mb-3 size-5 text-muted-foreground" />
            <div className="font-medium">Get approved</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Usually under 24 hours. We&apos;ll email you when it&apos;s done.
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">To</th>
              <th className="py-3 font-medium">Amount</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-3">{formatDate(tx.date)}</td>
                <td className="py-3">{tx.to}</td>
                <td className="py-3 font-medium">
                  {formatMoney(tx.amount, tx.currency)}
                </td>
                <td className="py-3 text-emerald-600">{tx.status}</td>
                <td className="py-3 text-muted-foreground">{tx.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
