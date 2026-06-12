import { Copy, Download, Mail } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { InvoicePreview } from "@/components/invoice-preview"
import { useUIStore } from "@/store/ui-store"
import {
  useContacts,
  useInvoices,
  useProfile,
  useUpdateInvoice,
} from "@/queries/acctual"
import type { InvoiceStatus } from "@/lib/types"

export function ViewInvoiceDialog() {
  const open = useUIStore((s) => s.viewInvoiceOpen)
  const setOpen = useUIStore((s) => s.setViewInvoiceOpen)
  const selectedId = useUIStore((s) => s.selectedInvoiceId)
  const selectInvoice = useUIStore((s) => s.selectInvoice)

  const { data: invoices = [] } = useInvoices()
  const { data: contacts = [] } = useContacts()
  const { data: profile } = useProfile()
  const update = useUpdateInvoice()

  const invoice = invoices.find((i) => i.id === selectedId)
  const contact = contacts.find((c) => c.id === invoice?.contactId)

  const close = () => {
    setOpen(false)
    selectInvoice(null)
  }

  if (!invoice) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">View invoice</DialogTitle>
          <p className="text-sm text-muted-foreground">Invoice not found.</p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="flex h-[85vh] max-w-5xl gap-0 overflow-hidden p-0">
        <div className="flex w-[340px] shrink-0 flex-col border-r p-6">
          <DialogTitle className="mb-6 text-lg font-semibold">
            View invoice
          </DialogTitle>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-[#1a1a1a] hover:bg-[#333]"
              onClick={() => toast.success("Email sent successfully!")}
            >
              <Mail className="size-4" /> Send email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Payment link copied")}
            >
              <Copy className="size-4" /> Copy payment link
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="size-4" /> Download PDF
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Status
              </label>
              <Select
                value={invoice.status}
                onValueChange={(v) =>
                  update.mutate({
                    id: invoice.id,
                    patch: { status: v as InvoiceStatus },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["draft", "unpaid", "overdue", "paid", "void"] as const).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-6">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button size="sm" className="bg-[#1a1a1a] hover:bg-[#333]">
              Update
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-[#f5f5f5]">
          <div className="flex gap-6 border-b bg-white px-6 pt-4">
            <button className="border-b-2 border-foreground pb-2 text-sm font-medium">
              Invoice
            </button>
            <button className="pb-2 text-sm text-muted-foreground">Email</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <InvoicePreview
              invoice={invoice}
              contact={contact}
              profile={profile}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
