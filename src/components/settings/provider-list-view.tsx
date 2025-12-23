"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  IconCheck,
  IconX,
  IconTrash,
  IconLoader2,
  IconPlugConnected,
  IconRefresh,
  IconKey,
  IconServer,
  IconSettings
} from "@tabler/icons-react"
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

interface ProviderListViewProps {
  providerIds: ExtendedProviderId[]
}

export function ProviderListView({ providerIds }: ProviderListViewProps) {
  const {
    settings,
    updateProvider,
    toggleProvider,
    deleteProvider,
    getDecryptedApiKey
  } = useAISettings()

  const [testResults, setTestResults] = useState<Record<ExtendedProviderId, TestResult | null>>({} as Record<ExtendedProviderId, TestResult | null>)
  const [testingStates, setTestingStates] = useState<Record<ExtendedProviderId, boolean>>({} as Record<ExtendedProviderId, boolean>)
  const [fetchedModels, setFetchedModels] = useState<Record<ExtendedProviderId, string[]>>({} as Record<ExtendedProviderId, string[]>)
  const [fetchingStates, setFetchingStates] = useState<Record<ExtendedProviderId, boolean>>({} as Record<ExtendedProviderId, boolean>)
  const [fetchModelsResults, setFetchModelsResults] = useState<Record<ExtendedProviderId, FetchModelsResult | null>>({} as Record<ExtendedProviderId, FetchModelsResult | null>)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<ExtendedProviderId | null>(null)
  const [isDeleting, setIsDeleting] = useState<Record<ExtendedProviderId, boolean>>({} as Record<ExtendedProviderId, boolean>)
  const [expandedProviders, setExpandedProviders] = useState<Set<ExtendedProviderId>>(new Set())

  const handleTestConnection = async (providerId: ExtendedProviderId) => {
    setTestingStates(prev => ({ ...prev, [providerId]: true }))
    setTestResults(prev => ({ ...prev, [providerId]: null }))

    const config = settings.providers[providerId]
    if (!config) return

    try {
      const decryptedKey = await getDecryptedApiKey(providerId)
      const testConfig = {
        id: providerId as ProviderId,
        apiKey: decryptedKey,
        model: config.model,
        baseUrl: config.baseUrl,
        enabled: config.enabled
      }

      const result = await testConnection(providerId as ProviderId, testConfig)
      setTestResults(prev => ({ ...prev, [providerId]: result }))

      const isBuiltIn = Object.values<ProviderId>(["openai", "anthropic", "google", "anthropic-custom", "cerebras"]).includes(providerId as ProviderId)
      const provider = isBuiltIn ? PROVIDERS[providerId as ProviderId] : null

      if (result.success) {
        toast.success(`${provider?.name || 'Custom Provider'} connected`, {
          description: result.message
        })
      } else {
        toast.error(`${provider?.name || 'Custom Provider'} connection failed`, {
          description: result.message
        })
      }
    } catch (error) {
      console.error("Test connection failed:", error)
      setTestResults(prev => ({
        ...prev,
        [providerId]: {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
          latencyMs: 0
        }
      }))
    }

    setTestingStates(prev => ({ ...prev, [providerId]: false }))
  }

  const handleFetchModels = async (providerId: ExtendedProviderId) => {
    setFetchingStates(prev => ({ ...prev, [providerId]: true }))
    setFetchModelsResults(prev => ({ ...prev, [providerId]: null }))

    const config = settings.providers[providerId]
    if (!config) return

    try {
      const decryptedKey = await getDecryptedApiKey(providerId)
      const isBuiltIn = Object.values<ProviderId>(["openai", "anthropic", "google", "anthropic-custom", "cerebras"]).includes(providerId as ProviderId)
      const provider = isBuiltIn ? PROVIDERS[providerId as ProviderId] : null
      const baseUrl = config.baseUrl || provider?.fixedBaseUrl

      const result = await fetchModels(baseUrl!, decryptedKey)
      setFetchModelsResults(prev => ({ ...prev, [providerId]: result }))
      setFetchedModels(prev => ({ ...prev, [providerId]: result.models }))

      if (result.success && result.models.length > 0) {
        await updateProvider(providerId, { model: result.models[0] })
      }

      if (result.success) {
        toast.success("Models fetched successfully", {
          description: `Found ${result.models.length} models`
        })
      } else {
        toast.error("Failed to fetch models", {
          description: result.message
        })
      }
    } catch (error) {
      console.error("Fetch models failed:", error)
    }

    setFetchingStates(prev => ({ ...prev, [providerId]: false }))
  }

  const handleDeleteProvider = async (providerId: ExtendedProviderId) => {
    setIsDeleting(prev => ({ ...prev, [providerId]: true }))

    try {
      await deleteProvider(providerId)
      setDeleteDialogOpen(null)
      toast.success("Provider deleted", {
        description: "The provider has been removed from this profile"
      })
    } catch (error) {
      toast.error("Failed to delete provider", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }

    setIsDeleting(prev => ({ ...prev, [providerId]: false }))
  }

  const getProviderInfo = (providerId: ExtendedProviderId) => {
    const isBuiltIn = Object.values<ProviderId>(["openai", "anthropic", "google", "anthropic-custom", "cerebras"]).includes(providerId as ProviderId)
    const provider = isBuiltIn ? PROVIDERS[providerId as ProviderId] : null
    const config = settings.providers[providerId]

    return {
      isBuiltIn,
      provider,
      config,
      name: provider?.name || config?.customName || providerId,
      description: provider?.description || config?.customName || 'Custom OpenAI-compatible provider',
      isEnabled: config?.enabled || false,
      hasApiKey: !!config?.apiKey && config.apiKey.length > 0
    }
  }

  if (providerIds.length === 0) {
    return (
      <Card className="p-12 text-center">
        <IconServer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Providers Configured</h3>
        <p className="text-muted-foreground mb-4">
          Add built-in or custom providers to this profile to get started
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {providerIds.map((providerId) => {
        const { isBuiltIn, provider, config, name, description, isEnabled, hasApiKey } = getProviderInfo(providerId)
        const testResult = testResults[providerId]
        const isTesting = testingStates[providerId]
        const models = fetchedModels[providerId] || []
        const isFetchingModels = fetchingStates[providerId]
        const fetchModelsResult = fetchModelsResults[providerId]
        const isExpanded = expandedProviders.has(providerId)

        return (
          <Card key={providerId} className={`${isEnabled ? 'border-primary/50 bg-primary/5' : ''}`}>
            <div className="p-4">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{name}</span>
                      {!isBuiltIn && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                      {isEnabled && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProvider(providerId)}
                    className={isEnabled ? 'text-green-600' : ''}
                  >
                    {isEnabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedProviders(prev => {
                      const newSet = new Set(prev)
                      if (newSet.has(providerId)) {
                        newSet.delete(providerId)
                      } else {
                        newSet.add(providerId)
                      }
                      return newSet
                    })}
                  >
                    <IconSettings className="h-4 w-4" />
                  </Button>
                  <Dialog
                    open={deleteDialogOpen === providerId}
                    onOpenChange={(open) => setDeleteDialogOpen(open ? providerId : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Provider</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete &quot;{name}&quot;? This action cannot be undone and will remove all configuration including API keys.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDialogOpen(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteProvider(providerId)}
                          disabled={isDeleting[providerId]}
                        >
                          {isDeleting[providerId] ? (
                            <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Delete Provider
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* API Key */}
                  <div>
                    <Label htmlFor={`api-key-${providerId}`}>API Key</Label>
                    <div className="mt-1">
                      <ApiKeyInput
                        value={config?.apiKey || ''}
                        onChange={(apiKey) => updateProvider(providerId, { apiKey })}
                        placeholder={provider?.placeholder || 'Enter API key'}
                      />
                      {hasApiKey && (
                        <div className="flex items-center gap-1 text-green-600 mt-2">
                          <IconKey className="h-3 w-3" />
                          <span className="text-xs">API key configured</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Base URL (for providers that support it) */}
                  {(provider?.supportsCustomEndpoint || !isBuiltIn) && (
                    <div>
                      <Label htmlFor={`base-url-${providerId}`}>Base URL</Label>
                      <Input
                        id={`base-url-${providerId}`}
                        value={config?.baseUrl || provider?.fixedBaseUrl || ''}
                        onChange={(e) => updateProvider(providerId, { baseUrl: e.target.value })}
                        placeholder={provider?.fixedBaseUrl || 'https://api.example.com/v1'}
                        className="mt-1"
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
                    <div className="flex gap-2 mt-1">
                      <Select
                        value={config?.model || provider?.defaultModel || ''}
                        onValueChange={(model) => updateProvider(providerId, { model })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {(models.length > 0 ? models : (provider?.models || [])).map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {provider && !provider.fixedBaseUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFetchModels(providerId)}
                          disabled={isFetchingModels || !config?.apiKey}
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
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => handleTestConnection(providerId)}
                      disabled={isTesting || !config?.apiKey}
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
                    <div className="text-sm text-red-600">
                      <IconX className="h-4 w-4 inline mr-1" />
                      {fetchModelsResult.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}