const STORAGE_KEY = "auth_rate_limit"
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60 * 1000

interface RateLimitData {
  attempts: number[]
}

function getStoredData(): RateLimitData {
  if (typeof window === "undefined") return { attempts: [] }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return { attempts: [] }
    return JSON.parse(stored) as RateLimitData
  } catch {
    return { attempts: [] }
  }
}

function setStoredData(data: RateLimitData): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function cleanOldAttempts(attempts: number[]): number[] {
  const now = Date.now()
  return attempts.filter((timestamp) => now - timestamp < WINDOW_MS)
}

export function canAttempt(): boolean {
  const data = getStoredData()
  const validAttempts = cleanOldAttempts(data.attempts)
  return validAttempts.length < MAX_ATTEMPTS
}

export function recordAttempt(): void {
  const data = getStoredData()
  const validAttempts = cleanOldAttempts(data.attempts)
  validAttempts.push(Date.now())
  setStoredData({ attempts: validAttempts })
}

export function remainingAttempts(): number {
  const data = getStoredData()
  const validAttempts = cleanOldAttempts(data.attempts)
  return Math.max(0, MAX_ATTEMPTS - validAttempts.length)
}

export function timeUntilReset(): number {
  const data = getStoredData()
  const validAttempts = cleanOldAttempts(data.attempts)
  if (validAttempts.length === 0) return 0
  const oldestAttempt = Math.min(...validAttempts)
  const resetTime = oldestAttempt + WINDOW_MS
  return Math.max(0, Math.ceil((resetTime - Date.now()) / 1000))
}

export function clearRateLimit(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
}
