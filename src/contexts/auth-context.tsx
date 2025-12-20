"use client"

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  useCallback,
  type ReactNode
} from "react"
import { verifyPasscode } from "@/lib/auth/hash"
import {
  canAttempt,
  recordAttempt,
  remainingAttempts,
  timeUntilReset,
  clearRateLimit
} from "@/lib/auth/rate-limiter"

const AUTH_STORAGE_KEY = "auth_authenticated"

function getAuthFromStorage(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true"
}

function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getServerSnapshot(): boolean {
  return false
}

interface LoginResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (passcode: string) => Promise<LoginResult>
  logout: () => void
  getRateLimitInfo: () => { remaining: number; resetIn: number }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(() => getAuthFromStorage())
  const isAuthenticated = useSyncExternalStore(
    subscribeToStorage,
    () => authState,
    getServerSnapshot
  )
  const isLoading = false

  const login = useCallback(async (passcode: string): Promise<LoginResult> => {
    if (!canAttempt()) {
      const resetIn = timeUntilReset()
      return {
        success: false,
        error: `Too many attempts. Try again in ${resetIn} seconds.`
      }
    }

    const expectedHash = process.env.NEXT_PUBLIC_PASSCODE_HASH
    if (!expectedHash) {
      return { success: false, error: "Authentication not configured." }
    }

    const isValid = await verifyPasscode(passcode, expectedHash)

    if (isValid) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true")
      clearRateLimit()
      setAuthState(true)
      return { success: true }
    }

    recordAttempt()
    const remaining = remainingAttempts()

    if (remaining === 0) {
      const resetIn = timeUntilReset()
      return {
        success: false,
        error: `Too many attempts. Try again in ${resetIn} seconds.`
      }
    }

    return {
      success: false,
      error: `Invalid passcode. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setAuthState(false)
  }, [])

  const getRateLimitInfo = useCallback(() => {
    return {
      remaining: remainingAttempts(),
      resetIn: timeUntilReset()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout, getRateLimitInfo }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
