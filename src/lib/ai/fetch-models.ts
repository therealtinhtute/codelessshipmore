export interface ModelInfo {
  id: string
  object: string
  created?: number
  owned_by?: string
}

export interface ModelsResponse {
  object: string
  data: ModelInfo[]
}

export interface FetchModelsResult {
  success: boolean
  models: string[]
  message: string
}

export async function fetchModels(
  baseUrl: string,
  apiKey: string
): Promise<FetchModelsResult> {
  if (!baseUrl) {
    return { success: false, models: [], message: "Base URL is required" }
  }

  try {
    const url = baseUrl.endsWith("/")
      ? `${baseUrl}models`
      : `${baseUrl}/models`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      return {
        success: false,
        models: [],
        message: `Failed to fetch models: ${response.status} ${response.statusText}`
      }
    }

    const data: ModelsResponse = await response.json()

    if (!data.data || !Array.isArray(data.data)) {
      return {
        success: false,
        models: [],
        message: "Invalid response format"
      }
    }

    const models = data.data.map((m) => m.id).filter(Boolean)

    return {
      success: true,
      models,
      message: `Found ${models.length} model(s)`
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch models"
    return { success: false, models: [], message }
  }
}

/**
 * Fetch models from OpenAI-compatible /models endpoint
 * Used for CLIProxyAPI and other custom OpenAI-compatible providers
 */
export async function fetchCLIProxyAPIModels(
  baseUrl: string,
  apiKey: string
): Promise<FetchModelsResult> {
  if (!baseUrl) {
    return { success: false, models: [], message: "Base URL is required" }
  }

  try {
    // OpenAI-compatible format: {baseUrl}/models
    const url = baseUrl.endsWith("/")
      ? `${baseUrl}models`
      : `${baseUrl}/models`

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }

    // Only add Authorization header if apiKey is provided and not empty
    if (apiKey && apiKey.trim().length > 0) {
      headers["Authorization"] = `Bearer ${apiKey}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers
    })

    if (!response.ok) {
      return {
        success: false,
        models: [],
        message: `Failed to fetch models: ${response.status} ${response.statusText}`
      }
    }

    const data: ModelsResponse = await response.json()

    if (!data.data || !Array.isArray(data.data)) {
      return {
        success: false,
        models: [],
        message: "Invalid response format from /models endpoint"
      }
    }

    const models = data.data.map((m) => m.id).filter(Boolean)

    return {
      success: true,
      models,
      message: `Found ${models.length} model(s)`
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch models"
    return {
      success: false,
      models: [],
      message: `Error fetching models: ${message}`
    }
  }
}
