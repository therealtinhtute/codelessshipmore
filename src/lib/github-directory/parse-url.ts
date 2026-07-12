import type { RepositoryPreview } from "./types"

function cleanUrl(url: string) {
  return url
    .replace(/[/]{2,}/, "/") // Drop double slashes in path
    .replace(/[/]$/, "") // Drop trailing slash
}

/**
 * Sync parse of a GitHub repo/directory URL into user, repo, and path parts.
 * Does not resolve whether path segments are branch vs directory.
 */
export function getRepositoryPreview(url: string): RepositoryPreview {
  let pathname: string

  try {
    pathname = cleanUrl(decodeURIComponent(new URL(url).pathname))
  } catch {
    return { error: "NOT_A_REPOSITORY" }
  }

  const [, user, repository, ...restPathParts] = pathname.split("/")
  const type = restPathParts[0]

  if (!user || !repository) {
    return { error: "NOT_A_REPOSITORY" }
  }

  // Only allow repo root or /tree/... directory views
  if (type && type !== "tree") {
    return { error: "NOT_A_DIRECTORY" }
  }

  const directoryParts = type === "tree" ? restPathParts.slice(2) : []
  const parts = type === "tree" ? restPathParts.slice(1) : []

  return {
    user,
    repository,
    parts,
    directory: directoryParts.join("/"),
  }
}

export function buildZipFilename(options: {
  user: string
  repository: string
  gitReference?: string
  directory: string
  customFilename?: string
}): string {
  if (options.customFilename?.trim()) {
    const name = options.customFilename.trim()
    return name.endsWith(".zip") ? name : `${name}.zip`
  }

  const base = `${options.user} ${options.repository} ${options.gitReference ?? ""} ${options.directory}`
    .replace(/\//g, "-")
    .replace(/\s+/g, " ")
    .trim()

  return `${base}.zip`
}
