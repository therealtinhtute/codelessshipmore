import pMap from "p-map"
import { downloadFile } from "./download-files"
import { listDirectoryFiles } from "./list-files"
import { getRepositoryPreview, buildZipFilename } from "./parse-url"
import { getRepositoryInfo } from "./repository-info"
import { addFileToZip, createZip, generateZipBlob } from "./zip-directory"
import type {
  DownloadGitHubDirectoryOptions,
  DownloadGitHubDirectoryResult,
  DownloadStatusEvent,
} from "./types"

const BLOCKED_PATH = /malware|virus|trojan/i

function emit(
  onStatus: DownloadGitHubDirectoryOptions["onStatus"],
  event: DownloadStatusEvent,
) {
  onStatus?.(event)
}

function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Full client-side pipeline: parse URL → list → download → zip.
 * For root/branch-only URLs returns a zipball redirect URL instead.
 */
export async function downloadGitHubDirectory(
  options: DownloadGitHubDirectoryOptions,
): Promise<DownloadGitHubDirectoryResult> {
  const { url, token, filename: customFilename, signal, onStatus } = options

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("You are offline")
  }

  const repositoryPreview = getRepositoryPreview(url)
  if ("error" in repositoryPreview) {
    if (repositoryPreview.error === "NOT_A_REPOSITORY") {
      throw new Error("Not a repository URL")
    }
    throw new Error("Not a directory URL")
  }

  emit(onStatus, {
    message: `Repo: ${repositoryPreview.user}/${repositoryPreview.repository}`,
  })

  const parsedPath = await getRepositoryInfo(repositoryPreview, token)

  if ("error" in parsedPath) {
    if (parsedPath.error === "REPOSITORY_NOT_FOUND") {
      throw new Error(
        "Repository not found. If it’s private, enter a token that can access it.",
      )
    }
    if (parsedPath.error === "BRANCH_NOT_FOUND") {
      throw new Error("Branch or path not found")
    }
    throw new Error(String(parsedPath.error))
  }

  const { user, repository, gitReference, directory, isPrivate } = parsedPath

  emit(onStatus, {
    message: `Directory: /${directory || ""}`,
  })

  if ("downloadUrl" in parsedPath) {
    emit(onStatus, {
      message: "Downloading the entire repository/ref directly from GitHub",
    })
    return { kind: "zipball", downloadUrl: parsedPath.downloadUrl }
  }

  if (!gitReference) {
    throw new Error("Branch or path not found")
  }

  emit(onStatus, { message: "Retrieving directory info" })

  let files = await listDirectoryFiles(
    {
      user,
      repository,
      ref: gitReference,
      directory,
      token,
    },
    () => {
      emit(onStatus, {
        message:
          "Large repo: listing may take a while. Consider git sparse-checkout for huge trees.",
        level: "warn",
      })
    },
  )

  let foundBlockedFiles = false
  files = files.filter((file) => {
    if (BLOCKED_PATH.test(file.path)) {
      foundBlockedFiles = true
      emit(onStatus, {
        message: `File blocked: ${file.path}`,
        level: "warn",
      })
      return false
    }
    return true
  })

  if (files.length === 0) {
    if (foundBlockedFiles) {
      emit(onStatus, {
        message: "Some files were blocked (unsafe path names).",
        level: "warn",
      })
    }
    emit(onStatus, { message: "No files to download", level: "warn" })
    return { kind: "empty", blockedFiles: foundBlockedFiles }
  }

  emit(onStatus, {
    message: `Will download ${files.length} files`,
    total: files.length,
    downloaded: 0,
  })

  const downloadSignal = signal

  const zip = await createZip()
  let downloaded = 0

  try {
    await pMap(
      files,
      async (file) => {
        if (downloadSignal?.aborted) {
          throw new DOMException("Download cancelled", "AbortError")
        }

        const blob = await downloadFile({
          user,
          repository,
          reference: gitReference,
          file,
          isPrivate,
          signal: downloadSignal,
          token,
        })

        downloaded++
        emit(onStatus, {
          message: file.path,
          downloaded,
          total: files.length,
        })

        addFileToZip(zip, directory, file.path, blob)
      },
      { concurrency: 20, signal: downloadSignal },
    )
  } catch (error) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("Could not download all files, network connection lost.")
    }
    if (
      isError(error) &&
      (error.name === "AbortError" || error.message === "Download cancelled")
    ) {
      throw new Error("Download cancelled")
    }
    if (isError(error) && error.message.startsWith("HTTP ")) {
      throw new Error("Could not download all files.")
    }
    if (isError(error)) {
      throw error
    }
    throw new Error(
      "Some files were blocked from downloading. Disable ad blockers and try again.",
    )
  }

  emit(onStatus, {
    message: `Zipping ${downloaded} files...`,
    downloaded,
    total: files.length,
  })

  const zipBlob = await generateZipBlob(zip)
  const zipFilename = buildZipFilename({
    user,
    repository,
    gitReference,
    directory,
    customFilename,
  })

  // Trigger browser download here so callers don't need the blob for zipball case
  const { downloadBlob } = await import("@/lib/file-operations")
  downloadBlob(zipBlob, zipFilename)

  if (foundBlockedFiles) {
    emit(onStatus, {
      message: "Some files were blocked (unsafe path names).",
      level: "warn",
    })
  }

  emit(onStatus, {
    message: `Downloaded ${downloaded} files! Done!`,
    level: "success",
    downloaded,
    total: files.length,
  })

  return {
    kind: "zip",
    filename: zipFilename,
    fileCount: downloaded,
    blockedFiles: foundBlockedFiles,
  }
}
