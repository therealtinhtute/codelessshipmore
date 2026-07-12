export type RepositoryPreview =
  | { error: "NOT_A_REPOSITORY" | "NOT_A_DIRECTORY" }
  | { user: string; repository: string; parts: string[]; directory: string }

export type RepositoryInfo =
  | { error: "REPOSITORY_NOT_FOUND" | "BRANCH_NOT_FOUND" | string }
  | {
      user: string
      repository: string
      directory: string
      isPrivate: boolean
      downloadUrl: string
      gitReference?: string
    }
  | {
      user: string
      repository: string
      gitReference: string
      directory: string
      isPrivate: boolean
    }

export type StatusLevel = "info" | "warn" | "error" | "success"

export type DownloadStatusEvent = {
  message: string
  level?: StatusLevel
  downloaded?: number
  total?: number
}

export type DownloadGitHubDirectoryResult =
  | { kind: "zipball"; downloadUrl: string }
  | { kind: "zip"; filename: string; fileCount: number; blockedFiles: boolean }
  | { kind: "empty"; blockedFiles: boolean }

export type DownloadGitHubDirectoryOptions = {
  url: string
  token?: string
  filename?: string
  signal?: AbortSignal
  onStatus?: (event: DownloadStatusEvent) => void
}
