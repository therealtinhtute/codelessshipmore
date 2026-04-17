"use client"

import { useEffect, useMemo, useState } from "react"
import { IconCopy, IconDeviceMobileCode, IconKey, IconRefresh, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useClipboard } from "@/hooks/use-clipboard"
import { loadSavedTotpEntries, saveTotpEntries, type SavedTotpEntry } from "@/lib/totp-saved-entries"
import { generateTotpCode, getTotpSecondsRemaining, isValidBase32Secret } from "@/lib/totp-utils"

type SavedCodeState = Record<string, { code: string; error: string | null }>

function normalizeSecret(secret: string) {
  return secret.toUpperCase().replace(/[\s-]+/g, "")
}

export function TotpGenerator() {
  const [name, setName] = useState("")
  const [secret, setSecret] = useState("")
  const [currentCode, setCurrentCode] = useState("")
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [savedEntries, setSavedEntries] = useState<SavedTotpEntry[]>([])
  const [savedCodes, setSavedCodes] = useState<SavedCodeState>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const { copy, isCopying } = useClipboard()

  const normalizedSecret = useMemo(() => normalizeSecret(secret), [secret])
  const secondsRemaining = getTotpSecondsRemaining(now)

  useEffect(() => {
    setSavedEntries(loadSavedTotpEntries())
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const updateCodes = async () => {
      if (!normalizedSecret) {
        setCurrentCode("")
        setCurrentError(null)
        setIsGenerating(false)
      } else if (!isValidBase32Secret(normalizedSecret)) {
        setCurrentCode("")
        setCurrentError("Enter a valid Base32 secret using only A-Z and 2-7")
        setIsGenerating(false)
      } else {
        setIsGenerating(true)

        try {
          const code = await generateTotpCode(normalizedSecret, now)
          if (!cancelled) {
            setCurrentCode(code)
            setCurrentError(null)
          }
        } catch (error) {
          if (!cancelled) {
            setCurrentCode("")
            setCurrentError(error instanceof Error ? error.message : "Failed to generate code")
          }
        } finally {
          if (!cancelled) {
            setIsGenerating(false)
          }
        }
      }

      if (!savedEntries.length) {
        setSavedCodes({})
        return
      }

      const nextEntries = await Promise.all(savedEntries.map(async (entry) => {
        try {
          return [entry.id, { code: await generateTotpCode(entry.secret, now), error: null }] as const
        } catch (error) {
          return [entry.id, { code: "------", error: error instanceof Error ? error.message : "Invalid saved secret" }] as const
        }
      }))

      if (!cancelled) {
        setSavedCodes(Object.fromEntries(nextEntries))
      }
    }

    void updateCodes()

    return () => {
      cancelled = true
    }
  }, [normalizedSecret, now, savedEntries])

  const persistEntries = (entries: SavedTotpEntry[]) => {
    const saved = saveTotpEntries(entries)

    if (!saved) {
      toast.error("Local storage is unavailable on this device")
      return false
    }

    setSavedEntries(entries)
    return true
  }

  const handleSave = () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      toast.error("Enter a label before saving")
      return
    }

    if (!normalizedSecret || !isValidBase32Secret(normalizedSecret)) {
      toast.error("Enter a valid Base32 secret before saving")
      return
    }

    if (savedEntries.some((entry) => entry.name === trimmedName && entry.secret === normalizedSecret)) {
      toast.error("That account is already saved")
      return
    }

    const nextEntries = [
      ...savedEntries,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        secret: normalizedSecret,
        createdAt: new Date().toISOString()
      }
    ]

    if (!persistEntries(nextEntries)) {
      return
    }

    setName("")
    toast.success(`Saved ${trimmedName} on this device`)
  }

  const handleDelete = (entryId: string) => {
    const nextEntries = savedEntries.filter((entry) => entry.id !== entryId)

    if (!persistEntries(nextEntries)) {
      return
    }

    toast.success("Deleted saved account")
  }

  const handleCopyCurrent = async () => {
    if (!currentCode) {
      toast.error("No TOTP code to copy")
      return
    }

    await copy(currentCode, "Copied 2FA code")
  }

  const handleCopySaved = async (entryId: string) => {
    const entry = savedCodes[entryId]

    if (!entry?.code || entry.error) {
      toast.error("No valid TOTP code to copy")
      return
    }

    await copy(entry.code, "Copied 2FA code")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card variant="claude">
          <CardHeader>
            <CardTitle variant="serif" className="flex items-center gap-2">
              <IconKey className="h-5 w-5" />
              Secret Input
            </CardTitle>
            <CardDescription>
              Generate a current code instantly, then optionally save the secret locally on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Account label"
            />
            <Textarea
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="243XN6ZWVEJG4MQS27XU5275TR7QRJ6K"
              className="min-h-32 font-mono text-sm"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              Saved secrets are stored only in browser localStorage on this device. They are not encrypted or synced to a server.
            </div>
            <Button variant="claude" onClick={handleSave} className="w-full sm:w-auto">
              <IconDeviceMobileCode className="h-4 w-4" />
              Save account locally
            </Button>
          </CardContent>
        </Card>

        <Card variant="claude">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle variant="serif" className="flex items-center gap-2">
                  <IconRefresh className="h-5 w-5" />
                  Current Code
                </CardTitle>
                <CardDescription>
                  Standard 6-digit TOTP with a shared 30-second refresh window.
                </CardDescription>
              </div>
              <Button variant="claude" onClick={handleCopyCurrent} disabled={!currentCode || isCopying}>
                <IconCopy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {currentError}
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/20 p-6 text-center">
                <div className="font-mono text-4xl font-semibold tracking-[0.3em] sm:text-5xl">
                  {currentCode || "------"}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {isGenerating && normalizedSecret ? "Generating current code..." : "Code refreshes automatically"}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="text-muted-foreground">Next refresh</span>
              <span className="font-mono font-semibold">{secondsRemaining}s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="claude">
        <CardHeader>
          <CardTitle variant="serif">Saved Accounts</CardTitle>
          <CardDescription>
            Copy current 6-digit codes without re-entering each secret. Deleting an item removes it from localStorage immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedEntries.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No saved accounts yet. Add a label and valid Base32 secret above to keep it on this device.
            </div>
          ) : (
            <div className="space-y-3">
              {savedEntries.map((entry) => {
                const savedState = savedCodes[entry.id]

                return (
                  <div key={entry.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="truncate font-medium">{entry.name}</div>
                        {savedState?.error ? (
                          <div className="text-sm text-destructive">{savedState.error}</div>
                        ) : (
                          <div className="font-mono text-3xl font-semibold tracking-[0.25em]">
                            {savedState?.code ?? "------"}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">Refreshes in {secondsRemaining}s</div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <Button variant="claude" onClick={() => void handleCopySaved(entry.id)} disabled={!savedState?.code || !!savedState.error || isCopying}>
                          <IconCopy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(entry.id)}>
                          <IconTrash className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
