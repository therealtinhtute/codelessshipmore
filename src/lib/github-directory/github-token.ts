import { encryptAndStore, retrieveAndDecrypt } from "@/lib/ai/encryption"

export const GITHUB_PAT_STORAGE_KEY = "codelessshipmore:github-pat"

export async function loadGithubToken(): Promise<string | null> {
  return retrieveAndDecrypt(GITHUB_PAT_STORAGE_KEY)
}

export async function saveGithubToken(token: string): Promise<void> {
  const trimmed = token.trim()
  if (!trimmed) {
    clearGithubToken()
    return
  }
  await encryptAndStore(GITHUB_PAT_STORAGE_KEY, trimmed)
}

export function clearGithubToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(GITHUB_PAT_STORAGE_KEY)
}
