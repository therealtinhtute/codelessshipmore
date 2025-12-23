"use client"

import { useState, useCallback } from "react"
import { createOpenAI } from "@ai-sdk/openai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText, streamText, type CoreMessage } from "ai"
import { useAISettings, type ExtendedProviderId } from "@/contexts/ai-settings-context"
import type { ProviderId } from "@/lib/ai/providers"

interface UseAIOptions {
  providerId?: ExtendedProviderId
}

interface GenerateOptions {
  prompt: string
  maxOutputTokens?: number
  temperature?: number
}

interface ChatOptions {
  messages: CoreMessage[]
  maxOutputTokens?: number
  temperature?: number
}

export function useAI(options: UseAIOptions = {}) {
  const { settings, getDecryptedApiKey } = useAISettings()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the active provider (first enabled, or explicitly provided)
  const activeProvider = options.providerId || settings.enabledProviders[0] || null

  const getProvider = useCallback(
    async (overrideId?: ExtendedProviderId) => {
      const providerId = overrideId || options.providerId || activeProvider
      if (!providerId) {
        throw new Error("No AI provider configured")
      }

      const config = settings.providers[providerId]
      if (!config) {
        throw new Error(`Provider ${providerId} not found`)
      }

      if (!config.enabled) {
        throw new Error(`Provider ${providerId} is not enabled`)
      }

      const apiKey = await getDecryptedApiKey(providerId)
      if (!apiKey) {
        throw new Error(`No API key configured for ${providerId}`)
      }

      // Handle custom providers
      const isBuiltIn = Object.values<ProviderId>(["openai", "anthropic", "google", "anthropic-custom", "cerebras"]).includes(providerId as ProviderId)

      if (!isBuiltIn) {
        // Custom provider - use OpenAI compatible
        if (!config.baseUrl) {
          throw new Error("Base URL required for custom provider")
        }
        const custom = createOpenAICompatible({
          name: config.customName || providerId,
          baseURL: config.baseUrl,
          apiKey
        })
        return custom(config.model)
      }

      // Built-in providers
      const id = providerId as ProviderId
      switch (id) {
        case "openai": {
          const openai = createOpenAI({
            apiKey,
            baseURL: config.baseUrl || undefined
          })
          return openai(config.model)
        }
        case "anthropic": {
          const anthropic = createAnthropic({ apiKey })
          return anthropic(config.model)
        }
        case "google": {
          const google = createGoogleGenerativeAI({ apiKey })
          return google(config.model)
        }
        case "anthropic-custom": {
          if (!config.baseUrl) {
            throw new Error("Base URL required for custom endpoint")
          }
          const anthropic = createAnthropic({
            apiKey,
            baseURL: config.baseUrl
          })
          return anthropic(config.model)
        }
        case "cerebras": {
          const cerebras = createOpenAICompatible({
            name: "cerebras",
            baseURL: "https://api.cerebras.ai/v1",
            apiKey
          })
          return cerebras(config.model)
        }
        default:
          throw new Error("Unknown provider")
      }
    },
    [settings, options.providerId, getDecryptedApiKey, activeProvider]
  )

  const generate = useCallback(
    async (opts: GenerateOptions): Promise<string> => {
      setIsLoading(true)
      setError(null)

      try {
        const model = await getProvider()
        const result = await generateText({
          model,
          prompt: opts.prompt,
          temperature: opts.temperature
        })
        return result.text
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed"
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [getProvider]
  )

  const chat = useCallback(
    async (opts: ChatOptions): Promise<string> => {
      setIsLoading(true)
      setError(null)

      try {
        const model = await getProvider()
        const result = await generateText({
          model,
          messages: opts.messages,
          temperature: opts.temperature
        })
        return result.text
      } catch (err) {
        const message = err instanceof Error ? err.message : "Chat failed"
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [getProvider]
  )

  const streamGenerate = useCallback(
    async function* (opts: GenerateOptions): AsyncGenerator<string> {
      setIsLoading(true)
      setError(null)

      try {
        const model = await getProvider()
        const result = streamText({
          model,
          prompt: opts.prompt,
          temperature: opts.temperature
        })

        for await (const chunk of result.textStream) {
          yield chunk
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Streaming failed"
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [getProvider]
  )

  return {
    generate,
    chat,
    streamGenerate,
    isLoading,
    error,
    activeProvider,
    enabledProviders: settings.enabledProviders,
    isConfigured: settings.enabledProviders.length > 0
  }
}