import { useUIStore } from "@/store/ui-store"
import { InvoicesView } from "@/components/invoices-view"
import { PaymentsView } from "@/components/payments-view"
import { BillsView } from "@/components/bills-view"
import { ContactsView } from "@/components/contacts-view"

export function MainView() {
  const view = useUIStore((s) => s.view)

  switch (view) {
    case "payments":
      return <PaymentsView />
    case "bills":
      return <BillsView />
    case "contacts":
      return <ContactsView />
    default:
      return <InvoicesView />
  }
}
