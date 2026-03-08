export type SavedTotpEntry = {
  id: string
  name: string
  secret: string
  createdAt: string
}

import { isValidBase32Secret } from "@/lib/totp-utils"

export const TOTP_SAVED_ENTRIES_KEY = "codelessshipmore:totp-saved-entries"

function isSavedTotpEntry(value: unknown): value is SavedTotpEntry {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.length > 0 &&
    typeof candidate.secret === "string" &&
    isValidBase32Secret(candidate.secret) &&
    typeof candidate.createdAt === "string" &&
    !Number.isNaN(Date.parse(candidate.createdAt))
  )
}

export function parseSavedTotpEntries(value: string | null): SavedTotpEntry[] {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed) || !parsed.every(isSavedTotpEntry)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

export function loadSavedTotpEntries() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    return parseSavedTotpEntries(window.localStorage.getItem(TOTP_SAVED_ENTRIES_KEY))
  } catch {
    return []
  }
}

export function saveTotpEntries(entries: SavedTotpEntry[]) {
  if (typeof window === "undefined") {
    return false
  }

  try {
    window.localStorage.setItem(TOTP_SAVED_ENTRIES_KEY, JSON.stringify(entries))
    return true
  } catch {
    return false
  }
}
