import pRetry from "p-retry"
import type { ContentsReponseObject, TreeResponseObject } from "list-github-dir-content"
import { authenticatedFetch } from "./authenticated-fetch"

function escapeFilepath(path: string) {
  return path.replaceAll("%", "%25").replaceAll("#", "%23")
}

async function maybeResponseLfs(response: Response): Promise<boolean> {
  const length = Number(response.headers.get("content-length"))
  if (length > 128 && length < 140) {
    const contents = await response.clone().text()
    return contents.startsWith("version https://git-lfs.github.com/spec/v1")
  }
  return false
}

type FileRequest = {
  user: string
  repository: string
  reference: string
  file: TreeResponseObject | ContentsReponseObject
  signal?: AbortSignal
  token?: string
}

async function fetchPublicFile({
  user,
  repository,
  reference,
  file,
  signal,
  token,
}: FileRequest) {
  const response = await authenticatedFetch(
    `https://raw.githubusercontent.com/${user}/${repository}/${reference}/${escapeFilepath(file.path)}`,
    { signal, token },
  )

  if (!response.ok) {
    throw new Error(`HTTP ${response.statusText} for ${file.path}`)
  }

  const lfsCompatibleResponse = (await maybeResponseLfs(response))
    ? await authenticatedFetch(
        `https://media.githubusercontent.com/media/${user}/${repository}/${reference}/${escapeFilepath(file.path)}`,
        { signal, token },
      )
    : response

  if (!lfsCompatibleResponse.ok) {
    throw new Error(`HTTP ${lfsCompatibleResponse.statusText} for ${file.path}`)
  }

  return lfsCompatibleResponse.blob()
}

async function fetchPrivateFile({ file, signal, token }: FileRequest) {
  const response = await authenticatedFetch(file.url, { signal, token })

  if (!response.ok) {
    throw new Error(`HTTP ${response.statusText} for ${file.path}`)
  }

  const { content } = (await response.json()) as { content: string }
  const decoder = await fetch(`data:application/octet-stream;base64,${content}`)
  return decoder.blob()
}

export async function downloadFile({
  user,
  repository,
  reference,
  file,
  isPrivate,
  signal,
  token,
}: {
  user: string
  repository: string
  reference: string
  isPrivate: boolean
  file: TreeResponseObject | ContentsReponseObject
  signal?: AbortSignal
  token?: string
}) {
  const fileRequest: FileRequest = {
    user,
    repository,
    reference,
    file,
    signal,
    token,
  }

  const localDownload = async () =>
    isPrivate ? fetchPrivateFile(fileRequest) : fetchPublicFile(fileRequest)

  return pRetry(localDownload, {
    retries: 3,
    onFailedAttempt: (error) => {
      console.error(
        `Error downloading ${file.path}. Attempt ${error.attemptNumber}. ${error.retriesLeft} retries left.`,
      )
    },
  })
}
