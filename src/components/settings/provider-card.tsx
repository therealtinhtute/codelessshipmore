"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  IconLoader2,
  IconCheck,
  IconX,
  IconPlugConnected,
  IconRefresh
} from "@tabler/icons-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ApiKeyInput } from "./api-key-input"
import { useAISettings, type ExtendedProviderId } from "@/contexts/ai-settings-context"
import { testConnection, type TestResult } from "@/lib/ai/test-connection"
import { fetchModels, type FetchModelsResult } from "@/lib/ai/fetch-models"
import { PROVIDERS, type ProviderId } from "@/lib/ai/providers"

interface ProviderCardProps {
  providerId: ExtendedProviderId
}

export function ProviderCard({ providerId }: ProviderCardProps) {
  const { settings, updateProvider, toggleProvider, getDecryptedApiKey } = useAISettings()
  const config = settings.providers[providerId]

  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [fetchedModels, setFetchedModels] = useState<string[]>([])
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [fetchModelsResult, setFetchModelsResult] = useState<FetchModelsResult | null>(null)

  // Determine if this is a built-in or custom provider
  const isBuiltIn = Object.values<ProviderId>(["openai", "anthropic", "google", "anthropic-custom", "cerebras"]).includes(providerId as ProviderId)
  const provider = isBuiltIn ? PROVIDERS[providerId as ProviderId] : null

  const isEnabled = config?.enabled || false

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    // Get decrypted API key
    const decryptedKey = await getDecryptedApiKey(providerId)
    const testConfig = {
      id: providerId as ProviderId,
      apiKey: decryptedKey,
      model: config!.model,
      baseUrl: config!.baseUrl,
      enabled: config!.enabled
    }

    const result = await testConnection(providerId as ProviderId, testConfig)
    setTestResult(result)

    if (result.success) {
      toast.success(`${provider?.name || 'Custom Provider'} connected`, {
        description: result.message
      })
    } else {
      toast.error(`${provider?.name || 'Custom Provider'} connection failed`, {
        description: result.message
      })
    }

    setIsTesting(false)
  }

  const handleFetchModels = async () => {
    setIsFetchingModels(true)
    setFetchModelsResult(null)

    // Get decrypted API key
    const decryptedKey = await getDecryptedApiKey(providerId)
    const baseUrl = config!.baseUrl || provider?.fixedBaseUrl

    const result = await fetchModels(baseUrl!, decryptedKey)
    setFetchModelsResult(result)

    if (result.success) {
      setFetchedModels(result.models)
      // Update the model in the first fetched model
      if (result.models.length > 0) {
        await updateProvider(providerId, { model: result.models[0] })
      }
      toast.success("Models fetched successfully", {
        description: `Found ${result.models.length} models`
      })
    } else {
      toast.error("Failed to fetch models", {
        description: result.message
      })
    }

    setIsFetchingModels(false)
  }

  const handleToggleEnabled = () => {
    toggleProvider(providerId)
  }

  if (!config) return null

  const availableModels = fetchedModels.length > 0 ? fetchedModels : (provider?.models || [])

  return (
    <Card className={`relative ${isEnabled ? 'border-primary' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {provider?.name || config.customName || providerId}
              {!isBuiltIn && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Custom
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {provider?.description || config.customName || 'Custom OpenAI-compatible provider'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEnabled && (
              <div className="flex items-center gap-1 text-green-600">
                <IconCheck className="h-4 w-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleEnabled}
              className={isEnabled ? 'text-green-600' : ''}
            >
              {isEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* API Key */}
          <div>
            <Label htmlFor={`api-key-${providerId}`}>API Key</Label>
            <ApiKeyInput
              value={config.apiKey}
              onChange={(apiKey) => updateProvider(providerId, { apiKey })}
              placeholder={provider?.placeholder || 'Enter API key'}
            />
          </div>

          {/* Base URL (for providers that support it) */}
          {(provider?.supportsCustomEndpoint || !isBuiltIn) && (
            <div>
              <Label htmlFor={`base-url-${providerId}`}>Base URL</Label>
              <Input
                id={`base-url-${providerId}`}
                value={config.baseUrl || provider?.fixedBaseUrl || ''}
                onChange={(e) => updateProvider(providerId, { baseUrl: e.target.value })}
                placeholder={provider?.fixedBaseUrl || 'https://api.example.com/v1'}
              />
              {provider?.fixedBaseUrl && (
                <p className="text-xs text-muted-foreground mt-1">
                  This provider uses a fixed base URL
                </p>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div>
            <Label htmlFor={`model-${providerId}`}>Model</Label>
            <div className="flex gap-2">
              <Select
                value={config.model || provider?.defaultModel || ''}
                onValueChange={(model) => updateProvider(providerId, { model })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {provider && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchModels}
                  disabled={isFetchingModels || !config.apiKey}
                  className="whitespace-nowrap"
                >
                  {isFetchingModels ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconRefresh className="h-4 w-4" />
                  )}
                  Fetch
                </Button>
              )}
            </div>
          </div>

          {/* Connection Test */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTesting || !config.apiKey}
              variant="outline"
              size="sm"
            >
              {isTesting ? (
                <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <IconPlugConnected className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>

            {testResult && (
              <div className={`flex items-center gap-1 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.success ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <IconX className="h-4 w-4" />
                )}
                <span>
                  {testResult.success ? 'Connected' : 'Failed'} ({testResult.latencyMs || 0}ms)
                </span>
              </div>
            )}
          </div>

          {/* Fetch Models Result */}
          {fetchModelsResult && !fetchModelsResult.success && (
            <div className="text-sm text-red-600 mt-2">
              <IconX className="h-4 w-4 inline mr-1" />
              {fetchModelsResult.message}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}