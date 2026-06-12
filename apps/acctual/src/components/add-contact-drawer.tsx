import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/ui-store"
import { useCreateContact } from "@/queries/acctual"
import { cn } from "@/lib/utils"

export function AddContactDrawer() {
  const open = useUIStore((s) => s.addContactOpen)
  const setOpen = useUIStore((s) => s.setAddContactOpen)
  const create = useCreateContact()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [taxId, setTaxId] = useState("")

  const reset = () => {
    setName("")
    setEmail("")
    setAddress("")
    setTaxId("")
  }

  const submit = () => {
    if (!name.trim() || !email.trim()) return
    create.mutate(
      { name, email, address: address || undefined, taxId: taxId || undefined },
      {
        onSuccess: () => {
          toast.success("Contact added")
          reset()
          setOpen(false)
        },
      }
    )
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-[400px] flex-col bg-white shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Add contact</h2>
          <button onClick={() => setOpen(false)}>
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jdoe@gmail.com"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="mb-3 text-sm font-medium">Payment details</div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Wallet address
            </label>
            <select className="w-full rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              <option>Select or add a wallet</option>
            </select>
          </div>

          <div>
            <div className="mb-3 text-sm font-medium">Billing details</div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter or search for address…"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Tax ID
            </label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Enter tax ID…"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#1a1a1a] hover:bg-[#333]"
            onClick={submit}
            disabled={!name.trim() || !email.trim() || create.isPending}
          >
            Add
          </Button>
        </div>
      </div>
    </>
  )
}
