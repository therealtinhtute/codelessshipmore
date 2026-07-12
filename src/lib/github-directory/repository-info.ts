import { authenticatedFetch } from "./authenticated-fetch"
import type { RepositoryInfo } from "./types"

async function checkBranchExists(
  user: string,
  repo: string,
  gitReference: string,
  token?: string,
): Promise<boolean> {
  const apiUrl = `https://api.github.com/repos/${user}/${repo}/commits/${encodeURIComponent(gitReference)}?per_page=1`
  const response = await authenticatedFetch(apiUrl, { method: "HEAD", token })
  return response.ok
}

/**
 * Resolve branch name vs directory path when branch names contain slashes.
 */
async function parsePath(
  user: string,
  repo: string,
  parts: string[],
  token?: string,
): Promise<{ gitReference: string; directory: string } | void> {
  for (let i = 0; i < parts.length; i++) {
    const gitReference = parts.slice(0, i + 1).join("/")
    // One at a time — each candidate ref must be checked
    if (await checkBranchExists(user, repo, gitReference, token)) {
      return {
        gitReference,
        directory: parts.slice(i + 1).join("/"),
      }
    }
  }
}

export async function getRepositoryInfo(
  repositoryInfo: { user: string; repository: string; parts: string[] },
  token?: string,
): Promise<RepositoryInfo> {
  const { user, repository, parts } = repositoryInfo

  const repoInfoResponse = await authenticatedFetch(
    `https://api.github.com/repos/${user}/${repository}`,
    { token },
  )

  if (repoInfoResponse.status === 404) {
    return { error: "REPOSITORY_NOT_FOUND" }
  }

  if (!repoInfoResponse.ok) {
    return { error: `HTTP ${repoInfoResponse.status} ${repoInfoResponse.statusText}` }
  }

  const { private: isPrivate } = (await repoInfoResponse.json()) as { private: boolean }

  // Repo root → whole-repo zipball
  if (parts.length === 0) {
    return {
      user,
      repository,
      directory: "",
      isPrivate,
      downloadUrl: `https://api.github.com/repos/${user}/${repository}/zipball`,
    }
  }

  // Single segment after tree → treat as git reference, whole-tree zipball
  if (parts.length === 1) {
    return {
      user,
      repository,
      gitReference: parts[0],
      directory: "",
      isPrivate,
      downloadUrl: `https://api.github.com/repos/${user}/${repository}/zipball/${parts[0]}`,
    }
  }

  const parsedPath = await parsePath(user, repository, parts, token)
  if (!parsedPath) {
    return { error: "BRANCH_NOT_FOUND" }
  }

  // Branch only (no directory under it) → zipball for that ref
  if (!parsedPath.directory) {
    return {
      user,
      repository,
      gitReference: parsedPath.gitReference,
      directory: "",
      isPrivate,
      downloadUrl: `https://api.github.com/repos/${user}/${repository}/zipball/${parsedPath.gitReference}`,
    }
  }

  return {
    user,
    repository,
    isPrivate,
    ...parsedPath,
  }
}
