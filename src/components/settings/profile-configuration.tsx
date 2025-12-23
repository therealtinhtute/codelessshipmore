"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ProviderListView } from "./provider-list-view"
import { useAISettings, type ExtendedProviderId } from "@/contexts/ai-settings-context"
import { PROVIDER_LIST, PROVIDERS, type ProviderId } from "@/lib/ai/providers"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconPlus,
  IconArrowLeft,
  IconDeviceFloppy,
  IconLoader2,
  IconServer,
  IconKey,
} from "@tabler/icons-react"

interface ProfileConfigurationProps {
  profileId: string
  onBack: () => void
}

export function ProfileConfiguration({ profileId, onBack }: ProfileConfigurationProps) {
  const {
    currentProfile,
    settings,
    isLoading,
    saveSettings,
    createCustomProvider,
    addProvider,
  } = useAISettings()

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isCustomProviderDialogOpen, setIsCustomProviderDialogOpen] = useState(false)
  const [customProviderName, setCustomProviderName] = useState("")
  const [customProviderBaseUrl, setCustomProviderBaseUrl] = useState("")
  const [customProviderModels, setCustomProviderModels] = useState("")
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<ProviderId | "">("")

  // Check if this is the current profile
  const isCurrentProfile = currentProfile?.id === profileId

  const handleSave = async () => {
    if (!isCurrentProfile) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await saveSettings()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error("Failed to save settings")
    }

    setIsSaving(false)
  }

  const handleAddProvider = async () => {
    if (!selectedProviderId) {
      toast.error("Please select a provider")
      return
    }

    try {
      await addProvider(selectedProviderId)
      toast.success("Provider added", {
        description: `${PROVIDERS[selectedProviderId].name} has been added to this profile`
      })
      setIsAddProviderDialogOpen(false)
      setSelectedProviderId("")
    } catch (error) {
      toast.error("Failed to add provider", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleCreateCustomProvider = async () => {
    if (!customProviderName.trim() || !customProviderBaseUrl.trim()) {
      toast.error("Name and base URL are required")
      return
    }

    // Validate URL format
    try {
      new URL(customProviderBaseUrl.trim())
      if (!customProviderBaseUrl.trim().startsWith("https://")) {
        toast.error("Base URL must use HTTPS")
        return
      }
    } catch {
      toast.error("Please enter a valid URL")
      return
    }

    // Parse models
    const models = customProviderModels
      .split(",")
      .map(m => m.trim())
      .filter(m => m.length > 0)

    if (models.length === 0) {
      toast.error("At least one model is required")
      return
    }

    try {
      await createCustomProvider({
        name: customProviderName.trim(),
        baseUrl: customProviderBaseUrl.trim(),
        models: models
      })

      toast.success("Custom provider created", {
        description: `"${customProviderName}" has been added to your profile`
      })

      setIsCustomProviderDialogOpen(false)
      setCustomProviderName("")
      setCustomProviderBaseUrl("")
      setCustomProviderModels("")
    } catch (error) {
      toast.error("Failed to create custom provider", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const getProviderIds = (): ExtendedProviderId[] => {
    if (!isCurrentProfile) return []

    // Only return providers that are actually configured for this profile
    const ids: ExtendedProviderId[] = []

    // Get configured providers from settings
    Object.entries(settings.providers || {}).forEach(([id, config]) => {
      const providerId = id as ExtendedProviderId
      if (config) {
        ids.push(providerId)
      }
    })

    return ids
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" disabled>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Profiles
          </Button>
        </div>

        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4 opacity-50">
                <div className="h-5 w-32 animate-pulse bg-muted rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse bg-muted rounded"></div>
                  <div className="h-4 w-32 animate-pulse bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isCurrentProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Profiles
          </Button>
        </div>

        <div className="text-center py-12">
          <IconServer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Switch to This Profile</h3>
          <p className="text-muted-foreground mb-4">
            Switch to this profile to configure its AI providers
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Profiles
          </Button>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Configure: {currentProfile?.name}
              {currentProfile?.isDefault && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Default
                </span>
              )}
            </h2>
            {currentProfile?.description && (
              <p className="text-sm text-muted-foreground">{currentProfile.description}</p>
            )}
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconDeviceFloppy className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconServer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Configured Providers</span>
          </div>
          <div className="text-2xl font-bold">{settings.enabledProviders.length}</div>
          <p className="text-xs text-muted-foreground">
            of {Object.keys(settings.providers).length} total providers
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconKey className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">API Keys</span>
          </div>
          <div className="text-2xl font-bold">
            {Object.values(settings.providers).filter(p => p?.apiKey && p.apiKey.length > 0).length}
          </div>
          <p className="text-xs text-muted-foreground">
            providers with API keys
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconLoader2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Ready to Use</span>
          </div>
          <div className="text-2xl font-bold">
            {settings.enabledProviders.filter(id => {
              const provider = settings.providers[id]
              return provider?.enabled && provider?.apiKey && provider?.apiKey.length > 0
            }).length}
          </div>
          <p className="text-xs text-muted-foreground">
            enabled with API keys
          </p>
        </div>
      </div>

      {/* Provider Configuration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">AI Providers</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure providers for this profile. Multiple providers can be enabled simultaneously.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddProviderDialogOpen} onOpenChange={setIsAddProviderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Built-in Provider</DialogTitle>
                  <DialogDescription>
                    Add a built-in AI provider to this profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-select">Select Provider *</Label>
                    <Select value={selectedProviderId} onValueChange={(value: ProviderId) => setSelectedProviderId(value)}>
                      <SelectTrigger id="provider-select">
                        <SelectValue placeholder="Choose a provider to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_LIST.filter(provider => !settings.providers[provider.id]).map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddProviderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProvider} disabled={!selectedProviderId}>
                    Add Provider
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isCustomProviderDialogOpen} onOpenChange={setIsCustomProviderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconPlus className="h-4 w-4 mr-2" />
                Add Custom Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Provider</DialogTitle>
                <DialogDescription>
                  Add an OpenAI-compatible provider to your profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-name">Provider Name *</Label>
                  <Input
                    id="custom-name"
                    value={customProviderName}
                    onChange={(e) => setCustomProviderName(e.target.value)}
                    placeholder="e.g., Groq, Together AI"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-base-url">Base URL *</Label>
                  <Input
                    id="custom-base-url"
                    value={customProviderBaseUrl}
                    onChange={(e) => setCustomProviderBaseUrl(e.target.value)}
                    placeholder="https://api.example.com/v1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be a valid HTTPS URL ending with /v1 or similar
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-models">Available Models *</Label>
                  <Textarea
                    id="custom-models"
                    value={customProviderModels}
                    onChange={(e) => setCustomProviderModels(e.target.value)}
                    placeholder="llama-3-8b-8192, llama-3-70b-8192"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of model names
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCustomProviderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustomProvider}
                  disabled={!customProviderName.trim() || !customProviderBaseUrl.trim() || !customProviderModels.trim()}
                >
                  Add Provider
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <ProviderListView providerIds={getProviderIds()} />
      </div>

      {/* Save Success Indicator */}
      {saveSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          Settings saved successfully!
        </div>
      )}
    </div>
  )
}