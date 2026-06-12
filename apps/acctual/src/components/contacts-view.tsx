import { Copy, Plus } from "lucide-react"
import { useUIStore } from "@/store/ui-store"
import { useContacts } from "@/queries/acctual"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ContactsView() {
  const setAddContactOpen = useUIStore((s) => s.setAddContactOpen)
  const { data: contacts = [], isLoading } = useContacts()

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white shadow-sm">
      <header className="flex items-center justify-between px-8 pt-8 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <Button
          className="rounded-full bg-[#1a1a1a] hover:bg-[#333]"
          onClick={() => setAddContactOpen(true)}
        >
          <Plus className="size-4" /> Add contact
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-8">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Payment details</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback
                          className="text-[10px] text-white"
                          style={{
                            backgroundColor: contact.avatarColor ?? "#1a1a1a",
                          }}
                        >
                          {contact.initials ??
                            contact.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {contact.name}
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground">{contact.email}</td>
                  <td className="py-4">
                    {contact.walletAddress ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                        {contact.walletAddress}
                        <Copy className="size-3" />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
