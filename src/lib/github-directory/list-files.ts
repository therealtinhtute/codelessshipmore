import {
  getDirectoryContentViaContentsApi,
  getDirectoryContentViaTreesApi,
  type ContentsReponseObject,
  type ListGithubDirectoryOptions,
  type TreeResponseObject,
} from "list-github-dir-content"

type ApiOptions = ListGithubDirectoryOptions & { getFullData: true }

export type ListedFile = TreeResponseObject | ContentsReponseObject

export async function listDirectoryFiles(
  config: Omit<ApiOptions, "getFullData">,
  onTruncated?: () => void,
): Promise<ListedFile[]> {
  const repoListingConfig: ApiOptions = {
    ...config,
    getFullData: true,
  }

  const files = await getDirectoryContentViaTreesApi(repoListingConfig)

  if (!files.truncated) {
    return files
  }

  onTruncated?.()
  return getDirectoryContentViaContentsApi(repoListingConfig)
}
