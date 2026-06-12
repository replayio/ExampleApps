import { Sidebar } from "@/components/sidebar"
import { MainView } from "@/components/main-view"
import { CreateInvoiceDialog } from "@/components/create-invoice-dialog"
import { ViewInvoiceDialog } from "@/components/view-invoice-dialog"
import { AddContactDrawer } from "@/components/add-contact-drawer"

export function App() {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-[#ebebeb] text-foreground">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-hidden p-4">
        <MainView />
      </main>
      <CreateInvoiceDialog />
      <ViewInvoiceDialog />
      <AddContactDrawer />
    </div>
  )
}

export default App
