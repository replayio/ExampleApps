/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

const STATE_KEY = "auth0_state"
// Persists the user's choice to skip login, so a reload stays in guest mode
// rather than dropping back to the login screen.
const GUEST_KEY = "blamy_guest"

export type AuthStatus = "loading" | "anonymous" | "authenticated" | "guest"

interface AuthContextValue {
  status: AuthStatus
  setStatus: (status: AuthStatus) => void
  login: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}

function login() {
  const state = crypto.randomUUID()
  sessionStorage.setItem(STATE_KEY, state)
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: window.location.origin,
    // offline_access yields a refresh token, which Token Vault exchanges
    // for the user's GitHub access token server-side.
    scope: "openid profile email offline_access",
    state,
    // Always show the login screen instead of silently reusing the SSO session.
    prompt: "login",
    ...(audience ? { audience } : {}),
  })
  window.location.assign(`https://${domain}/authorize?${params}`)
}

// Auth0 Regular Web App flow: Auth0 redirects back to the site root with
// ?code=...; we forward it to a Netlify function that holds the client secret
// and sets an HttpOnly session cookie.
async function exchangeCodeIfPresent(): Promise<void> {
  const url = new URL(window.location.href)
  const code = url.searchParams.get("code")
  if (!code) return
  const state = url.searchParams.get("state")
  const expected = sessionStorage.getItem(STATE_KEY)
  sessionStorage.removeItem(STATE_KEY)
  url.searchParams.delete("code")
  url.searchParams.delete("state")
  window.history.replaceState({}, "", url)
  if (!expected || state !== expected) return
  await fetch("/api/auth/exchange", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: window.location.origin }),
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")

  useEffect(() => {
    // Until the .env is in place, run without auth so the app stays usable.
    if (!domain || !clientId) {
      setStatus("authenticated")
      return
    }
    // A returning login (?code=...) always wins over a stored guest choice.
    const url = new URL(window.location.href)
    const returningFromLogin = url.searchParams.has("code")
    exchangeCodeIfPresent()
      .then(() => fetch("/api/auth/me"))
      .then((res) => {
        if (res.ok) {
          localStorage.removeItem(GUEST_KEY)
          setStatus("authenticated")
        } else if (!returningFromLogin && localStorage.getItem(GUEST_KEY)) {
          setStatus("guest")
        } else {
          setStatus("anonymous")
        }
      })
      .catch(() => {
        setStatus(
          !returningFromLogin && localStorage.getItem(GUEST_KEY)
            ? "guest"
            : "anonymous"
        )
      })
  }, [])

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, "1")
    setStatus("guest")
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(GUEST_KEY)
    await api.logout().catch(() => {})
    window.location.reload()
  }, [])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (status === "anonymous") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">blamy-notes</h1>
        <Button onClick={login}>Log in</Button>
        <Button variant="ghost" onClick={continueAsGuest}>
          Continue without logging in
        </Button>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ status, setStatus, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}