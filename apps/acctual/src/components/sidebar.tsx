import {
  BookOpen,
  ChevronDown,
  CreditCard,
  FileText,
  HelpCircle,
  Receipt,
  Settings,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AcctualLogo } from "@/components/acctual-logo"
import { useUIStore } from "@/store/ui-store"
import { useProfile } from "@/queries/acctual"
import type { ViewId } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const NAV: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  { id: "invoices", label: "Invoices", icon: <FileText className="size-4" /> },
  { id: "payments", label: "Payments", icon: <CreditCard className="size-4" /> },
  { id: "bills", label: "Bills", icon: <Receipt className="size-4" /> },
  { id: "contacts", label: "Contacts", icon: <Shield className="size-4" /> },
]

function NavRow({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
        active
          ? "bg-white font-medium text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export function Sidebar() {
  const view = useUIStore((s) => s.view)
  const setView = useUIStore((s) => s.setView)
  const { data: profile } = useProfile()

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col bg-[#f3f3f3] px-3 py-4">
      <AcctualLogo className="mb-6 px-2" />

      <nav className="space-y-0.5">
        {NAV.map((item) => (
          <NavRow
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={view === item.id}
            onClick={() => setView(item.id)}
          />
        ))}
      </nav>

      <div className="mt-auto space-y-0.5 pt-6">
        <NavRow
          icon={<HelpCircle className="size-4" />}
          label="Support"
          onClick={() => {}}
        />
        <NavRow
          icon={<BookOpen className="size-4" />}
          label="Guides"
          onClick={() => {}}
        />
        <NavRow
          icon={<Settings className="size-4" />}
          label="Settings"
          onClick={() => {}}
        />

        <button className="mt-3 flex w-full items-center gap-2 rounded-lg bg-white px-2.5 py-2 shadow-sm">
          <Avatar className="size-6">
            <AvatarFallback className="bg-[#5b8def] text-[10px] text-white">
              {profile?.name?.slice(0, 1) ?? "A"}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium">
            {profile?.name ?? "Alex Smith"}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  )
}
