import type { Contact, Invoice, Profile } from "@/lib/types"
import {
  formatDate,
  formatMoney,
  invoiceSubtotal,
  invoiceTotal,
} from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function InvoicePreview({
  invoice,
  contact,
  profile,
  highlightTo,
}: {
  invoice: Invoice
  contact?: Contact
  profile?: Profile
  highlightTo?: boolean
}) {
  const subtotal = invoiceSubtotal(invoice)
  const total = invoiceTotal(invoice)

  return (
    <div
      className="relative min-h-full rounded-xl bg-white p-8 shadow-sm"
      style={{
        backgroundImage:
          "radial-gradient(circle, #e8e8e8 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 grid grid-cols-3 gap-4 text-[10px] uppercase tracking-wide text-muted-foreground">
          <div>
            <div>Invoice no</div>
            <div className="mt-1 text-sm font-medium normal-case text-foreground">
              {invoice.number}
            </div>
          </div>
          <div>
            <div>Issued</div>
            <div className="mt-1 text-sm font-medium normal-case text-foreground">
              {formatDate(invoice.issueDate)}
            </div>
          </div>
          <div>
            <div>Due date</div>
            <div className="mt-1 text-sm font-medium normal-case text-foreground">
              {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              From
            </div>
            <div className="flex items-start gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-[#5b8def] text-xs text-white">
                  {profile?.name?.slice(0, 1) ?? "A"}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs leading-relaxed">
                <div className="font-semibold">{profile?.name}</div>
                <div className="text-muted-foreground">{profile?.email}</div>
                <div className="text-muted-foreground">{profile?.address}</div>
              </div>
            </div>
          </div>
          <div className={highlightTo ? "rounded-md ring-2 ring-[#5b8def]/40" : ""}>
            <div className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              To
            </div>
            {contact ? (
              <div className="flex items-start gap-2">
                <Avatar className="size-8">
                  <AvatarFallback
                    className="text-xs text-white"
                    style={{ backgroundColor: contact.avatarColor ?? "#1a1a1a" }}
                  >
                    {contact.initials ?? contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs leading-relaxed">
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-muted-foreground">{contact.email}</div>
                  {contact.address && (
                    <div className="text-muted-foreground">{contact.address}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-16 rounded border border-dashed border-muted-foreground/30" />
            )}
          </div>
        </div>

        <table className="mb-4 w-full text-xs">
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Price</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-muted-foreground">
                  No line items yet
                </td>
              </tr>
            ) : (
              invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-dashed">
                  <td className="py-2.5">{item.description}</td>
                  <td className="py-2.5 text-right">{item.qty}</td>
                  <td className="py-2.5 text-right">
                    {formatMoney(item.price, invoice.currency)}
                  </td>
                  <td className="py-2.5 text-right">
                    {formatMoney(item.qty * item.price, invoice.currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between gap-8 text-xs">
          {invoice.note && (
            <div className="max-w-[50%] text-muted-foreground">
              <div className="mb-1 font-medium text-foreground">Note</div>
              {invoice.note}
            </div>
          )}
          <div className="ml-auto min-w-[140px] space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(subtotal, invoice.currency)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatMoney(invoice.discount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total</span>
              <span>{formatMoney(total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4 text-[11px] text-muted-foreground">
          <span>Powered by Acctual</span>
          <span className="text-[#5b8def]">Choose how you&apos;d like to pay →</span>
        </div>
      </div>
    </div>
  )
}
