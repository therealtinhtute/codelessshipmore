function isGitHubApiUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url)
    return hostname === "api.github.com" || pathname.startsWith("/api/v3/")
  } catch {
    return false
  }
}

export async function authenticatedFetch(
  url: string,
  {
    signal,
    method,
    token,
  }: { signal?: AbortSignal; method?: "HEAD" | "GET"; token?: string } = {},
): Promise<Response> {
  const response = await fetch(url, {
    method: method ?? "GET",
    signal,
    ...(token && isGitHubApiUrl(url)
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {}),
  })

  switch (response.status) {
    case 401: {
      throw new Error("Invalid token")
    }
    case 403:
    case 429: {
      if (response.headers.get("X-RateLimit-Remaining") === "0") {
        throw new Error("Rate limit exceeded")
      }
      break
    }
    default:
  }

  return response
}
