import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

// Shown whenever the user is browsing in guest mode: their notes live only in
// this browser. "Log in / Register" runs the existing Auth0 flow; on success
// the login-sync uploads these notes and this banner disappears.
export function LocalModeBanner() {
  const { status, login } = useAuth()
  if (status !== "guest") return null
  return (
    <div className="gb-local-banner">
      <Info className="size-4 shrink-0" />
      <span className="gb-local-banner-text">
        Your notes are saved only in this browser. Log in to save them to your
        account.
      </span>
      <Button size="sm" onClick={login}>
        Log in / Register
      </Button>
    </div>
  )
}

