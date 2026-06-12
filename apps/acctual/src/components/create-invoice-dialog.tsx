import { useState } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InvoicePreview } from "@/components/invoice-preview"
import { useUIStore } from "@/store/ui-store"
import {
  useContacts,
  useCreateInvoice,
  useProfile,
} from "@/queries/acctual"
import type { Invoice, LineItem } from "@/lib/types"

const STEPS = ["Customer", "Items", "Terms", "Payment"] as const

export function CreateInvoiceDialog() {
  const open = useUIStore((s) => s.createInvoiceOpen)
  const setOpen = useUIStore((s) => s.setCreateInvoiceOpen)
  const { data: contacts = [] } = useContacts()
  const { data: profile } = useProfile()
  const create = useCreateInvoice()

  const [step, setStep] = useState(0)
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "new1", description: "", qty: 1, price: 0 },
  ])
  const [number, setNumber] = useState("ASM00005")
  const [issueDate, setIssueDate] = useState("2025-10-23")
  const [dueDate, setDueDate] = useState("2025-11-06")
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("USDT ETH")

  const contact = contacts.find((c) => c.id === contactId)

  const preview: Invoice = {
    id: "preview",
    number,
    status: "draft",
    contactId,
    currency: "USD",
    issueDate,
    dueDate,
    lineItems: lineItems.filter((i) => i.description),
    note: null,
    discount,
    paymentMethod,
    memo: null,
    paidDate: null,
    createdAt: new Date().toISOString(),
  }

  const reset = () => {
    setStep(0)
    setContactId(contacts[0]?.id ?? "")
    setLineItems([{ id: "new1", description: "", qty: 1, price: 0 }])
    setDiscount(0)
  }

  const submit = () => {
    create.mutate(
      {
        number,
        contactId,
        issueDate,
        dueDate,
        lineItems: lineItems.filter((i) => i.description),
        discount,
        paymentMethod,
        status: "draft",
      },
      {
        onSuccess: () => {
          toast.success("Invoice saved as draft")
          reset()
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="flex h-[85vh] max-w-5xl gap-0 overflow-hidden p-0">
        <div className="flex w-[380px] shrink-0 flex-col p-6">
          <div className="mb-6 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Create invoice
            </DialogTitle>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mb-4 flex gap-2 text-xs text-muted-foreground">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={i === step ? "font-medium text-foreground" : ""}
              >
                {s}
                {i < STEPS.length - 1 && " · "}
              </span>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Who&apos;s this invoice for?
              </h2>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Name
                </label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  We&apos;ll fill in their details automatically if we&apos;ve
                  seen them before
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Line items</h2>
              {lineItems.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-[1fr_60px_80px] gap-2">
                  <input
                    placeholder="Item name"
                    value={item.description}
                    onChange={(e) => {
                      const next = [...lineItems]
                      next[idx] = { ...item, description: e.target.value }
                      setLineItems(next)
                    }}
                    className="rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => {
                      const next = [...lineItems]
                      next[idx] = { ...item, qty: Number(e.target.value) }
                      setLineItems(next)
                    }}
                    className="rounded-lg border px-2 py-2 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => {
                      const next = [...lineItems]
                      next[idx] = { ...item, price: Number(e.target.value) }
                      setLineItems(next)
                    }}
                    className="rounded-lg border px-2 py-2 text-sm"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setLineItems([
                    ...lineItems,
                    {
                      id: `new${lineItems.length + 1}`,
                      description: "",
                      qty: 1,
                      price: 0,
                    },
                  ])
                }
              >
                <Plus className="size-4" /> Add item
              </Button>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Discount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Terms</h2>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Invoice number
                </label>
                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Issue date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Payment details</h2>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Method 1
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="USDT ETH">USDT ETH</option>
                  <option value="USDC ETH">USDC ETH</option>
                  <option value="USD ACH">USD ACH</option>
                  <option value="USD Wire">USD Wire</option>
                </select>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="size-4" /> Add a payment method
              </Button>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-6">
            <Button variant="outline" size="sm" onClick={submit}>
              Save draft
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  size="sm"
                  className="bg-[#1a1a1a] hover:bg-[#333]"
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-[#1a1a1a] hover:bg-[#333]"
                  onClick={submit}
                >
                  Create &amp; send later
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f5f5f5] p-6">
          <InvoicePreview
            invoice={preview}
            contact={contact}
            profile={profile}
            highlightTo={step === 0}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
