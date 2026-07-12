"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  IconBrandGithub,
  IconDownload,
  IconKey,
  IconPlayerStop,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { ApiKeyInput } from "@/components/settings/api-key-input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  clearGithubToken,
  downloadGitHubDirectory,
  loadGithubToken,
  saveGithubToken,
  type DownloadStatusEvent,
  type StatusLevel,
} from "@/lib/github-directory"
import { cn } from "@/lib/utils"

type StatusLine = {
  id: number
  message: string
  level: StatusLevel
}

function statusClassName(level: StatusLevel) {
  switch (level) {
    case "error":
      return "text-destructive"
    case "warn":
      return "text-chart-4"
    case "success":
      return "text-chart-2"
    default:
      return "text-muted-foreground"
  }
}

export function GithubDirectory() {
  const searchParams = useSearchParams()
  const [url, setUrl] = useState("")
  const [filename, setFilename] = useState("")
  const [token, setToken] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [isTokenReady, setIsTokenReady] = useState(false)
  const [statusLines, setStatusLines] = useState<StatusLine[]>([])
  const [progress, setProgress] = useState<{ downloaded: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const statusIdRef = useRef(0)
  const autoStartedRef = useRef(false)

  const pushStatus = useCallback((event: DownloadStatusEvent) => {
    statusIdRef.current += 1
    setStatusLines((prev) => [
      {
        id: statusIdRef.current,
        message: event.message,
        level: event.level ?? "info",
      },
      ...prev,
    ].slice(0, 80))

    if (typeof event.downloaded === "number" && typeof event.total === "number") {
      setProgress({ downloaded: event.downloaded, total: event.total })
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const stored = await loadGithubToken()
      if (!cancelled && stored) {
        setToken(stored)
      }
      if (!cancelled) {
        setIsTokenReady(true)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const runDownload = useCallback(
    async (nextUrl: string, nextFilename: string, nextToken: string) => {
      const trimmedUrl = nextUrl.trim()
      if (!trimmedUrl) {
        toast.error("Paste a GitHub repository or directory URL")
        return
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        toast.error("You are offline")
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsDownloading(true)
      setStatusLines([])
      setProgress(null)

      try {
        const result = await downloadGitHubDirectory({
          url: trimmedUrl,
          token: nextToken.trim() || undefined,
          filename: nextFilename.trim() || undefined,
          signal: controller.signal,
          onStatus: pushStatus,
        })

        if (result.kind === "zipball") {
          toast.success("Redirecting to GitHub zipball…")
          window.location.href = result.downloadUrl
          return
        }

        if (result.kind === "empty") {
          toast.error("No files to download")
          return
        }

        toast.success(`Downloaded ${result.fileCount} files as ${result.filename}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Download failed"
        pushStatus({ message, level: "error" })
        if (message !== "Download cancelled") {
          toast.error(message)
        } else {
          toast.message("Download cancelled")
        }
      } finally {
        setIsDownloading(false)
        abortRef.current = null
      }
    },
    [pushStatus],
  )

  useEffect(() => {
    if (!isTokenReady || autoStartedRef.current) return

    const queryUrl = searchParams.get("url")
    const queryFilename = searchParams.get("filename")

    if (queryUrl) {
      setUrl(queryUrl)
    }
    if (queryFilename) {
      setFilename(queryFilename)
    }

    if (queryUrl) {
      autoStartedRef.current = true
      void runDownload(queryUrl, queryFilename ?? "", token)
    }
  }, [isTokenReady, searchParams, runDownload, token])

  const handleSaveToken = async () => {
    try {
      await saveGithubToken(token)
      toast.success(token.trim() ? "Token saved (encrypted in this browser)" : "Token cleared")
    } catch {
      toast.error("Could not save token")
    }
  }

  const handleClearToken = () => {
    clearGithubToken()
    setToken("")
    toast.success("Token cleared")
  }

  const handleCancel = () => {
    abortRef.current?.abort()
  }

  const percent =
    progress && progress.total > 0
      ? Math.round((progress.downloaded / progress.total) * 100)
      : null

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBrandGithub className="size-5" />
            Directory URL
          </CardTitle>
          <CardDescription>
            Paste a GitHub folder URL (for example{" "}
            <code className="text-xs">
              https://github.com/user/repo/tree/main/path
            </code>
            ). Root or branch-only URLs download the whole tree via GitHub zipball.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="github-url">GitHub URL</FieldLabel>
              <Input
                id="github-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/tree/branch/folder"
                disabled={isDownloading}
                className="font-mono text-sm"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="zip-filename">ZIP filename (optional)</FieldLabel>
              <Input
                id="zip-filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="my-folder.zip"
                disabled={isDownloading}
              />
              <FieldDescription>
                Leave empty to auto-name from owner, repo, branch, and path.
              </FieldDescription>
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void runDownload(url, filename, token)}
                disabled={isDownloading || !url.trim()}
              >
                <IconDownload data-icon="inline-start" />
                {isDownloading ? "Downloading…" : "Download ZIP"}
              </Button>
              {isDownloading && (
                <Button variant="outline" onClick={handleCancel}>
                  <IconPlayerStop data-icon="inline-start" />
                  Cancel
                </Button>
              )}
              <Button
                variant="ghost"
                disabled={isDownloading}
                onClick={() => {
                  setUrl("")
                  setFilename("")
                  setStatusLines([])
                  setProgress(null)
                }}
              >
                Clear
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconKey className="size-5" />
            GitHub token (optional)
          </CardTitle>
          <CardDescription>
            Raises API rate limits and unlocks private repos. Stored encrypted in localStorage
            (same model as AI API keys — browser-only, not a vault). Use a classic PAT or
            fine-grained token with <code className="text-xs">contents:read</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="github-pat">Personal access token</FieldLabel>
              <ApiKeyInput
                value={token}
                onChange={setToken}
                placeholder="ghp_… or github_pat_…"
                disabled={isDownloading || !isTokenReady}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => void handleSaveToken()}
                disabled={isDownloading || !isTokenReady}
              >
                Save token
              </Button>
              <Button
                variant="outline"
                onClick={handleClearToken}
                disabled={isDownloading || (!token && !isTokenReady)}
              >
                <IconTrash data-icon="inline-start" />
                Clear token
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            Live progress while listing, downloading, and zipping files.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {percent !== null && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {progress?.downloaded ?? 0} / {progress?.total ?? 0} files
                </span>
                <span>{percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}
          <ScrollArea className="h-56 rounded-md border">
            <div className="space-y-1 p-3 font-mono text-xs">
              {statusLines.length === 0 ? (
                <p className="text-muted-foreground">
                  Status messages appear here when a download starts.
                </p>
              ) : (
                statusLines.map((line) => (
                  <p key={line.id} className={cn(statusClassName(line.level))}>
                    {line.message}
                  </p>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
