"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { useAISettings, type ProfileWithProviders } from "@/contexts/ai-settings-context"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconServer,
  IconKey,
  IconCheck,
  IconSettings,
} from "@tabler/icons-react"

interface ProfileListProps {
  onConfigureProfile?: (profileId: string) => void
}

export function ProfileList({ onConfigureProfile }: ProfileListProps = {}) {
  const {
    profilesWithProviders,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    currentProfile,
    isLoading,
  } = useAISettings()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileDescription, setProfileDescription] = useState("")
  const [editingProfile, setEditingProfile] = useState<ProfileWithProviders | null>(null)

  const handleCreateProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Profile name is required")
      return
    }

    try {
      const profile = await createProfile(profileName.trim(), profileDescription.trim())
      toast.success("Profile created", {
        description: `"${profile.name}" has been created. Configure providers for this profile to get started.`
      })
      setIsCreateDialogOpen(false)
      setProfileName("")
      setProfileDescription("")
    } catch (error) {
      toast.error("Failed to create profile", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleEditProfile = async () => {
    if (!profileName.trim() || !editingProfile) return

    try {
      await updateProfile(editingProfile.profile.id, {
        name: profileName.trim(),
        description: profileDescription.trim()
      })
      toast.success("Profile updated")
      setIsEditDialogOpen(false)
      setProfileName("")
      setProfileDescription("")
      setEditingProfile(null)
    } catch (error) {
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleDeleteProfile = async (profile: ProfileWithProviders) => {
    if (profile.profile.isDefault) {
      toast.error("Cannot delete the default profile")
      return
    }

    if (!confirm(`Are you sure you want to delete "${profile.profile.name}"? This will also delete all provider configurations for this profile.`)) {
      return
    }

    try {
      await deleteProfile(profile.profile.id)
      toast.success("Profile deleted", {
        description: `"${profile.profile.name}" has been deleted`
      })
    } catch (error) {
      toast.error("Failed to delete profile", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleSwitchProfile = async (profileId: string, profileName: string) => {
    if (currentProfile?.id === profileId) return

    try {
      await switchProfile(profileId)
      toast.success("Profile switched", {
        description: `Switched to "${profileName}"`
      })
    } catch (error) {
      toast.error("Failed to switch profile", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const openEditDialog = (profile: ProfileWithProviders) => {
    setEditingProfile(profile)
    setProfileName(profile.profile.name)
    setProfileDescription(profile.profile.description || "")
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Profiles</h2>
            <p className="text-sm text-muted-foreground">Manage your AI provider configurations</p>
          </div>
          <Button variant="outline" disabled>
            <IconPlus className="h-4 w-4 mr-2" />
            Create Profile
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-50">
              <CardHeader className="pb-3">
                <div className="h-5 w-32 animate-pulse bg-muted rounded"></div>
                <div className="h-4 w-48 animate-pulse bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse bg-muted rounded"></div>
                  <div className="h-4 w-32 animate-pulse bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Profiles</h2>
          <p className="text-sm text-muted-foreground">
            Configure AI providers for different use cases. Each profile can have multiple providers.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
              <DialogDescription>
                Create a new profile to organize your AI provider configurations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Profile Name *</Label>
                <Input
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g., Work, Personal, Development"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  {profileName.length}/50 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-description">Description</Label>
                <Textarea
                  id="profile-description"
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                  placeholder="Optional description for this profile"
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProfile} disabled={!profileName.trim()}>
                Create Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profiles Grid */}
      {profilesWithProviders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <IconUser className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first profile to start configuring AI providers
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <IconPlus className="h-4 w-4 mr-2" />
              Create First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profilesWithProviders.map((profileWithProviders) => (
            <Card
              key={profileWithProviders.profile.id}
              className={`relative transition-all hover:shadow-md ${
                currentProfile?.id === profileWithProviders.profile.id
                  ? 'ring-2 ring-primary shadow-md'
                  : ''
              }`}
            >
              {/* Active indicator */}
              {currentProfile?.id === profileWithProviders.profile.id && (
                <div className="absolute -top-2 -right-2">
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate flex items-center gap-2">
                      <IconUser className="h-4 w-4 text-primary shrink-0" />
                      {profileWithProviders.profile.name}
                      {profileWithProviders.profile.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    {profileWithProviders.profile.description && (
                      <CardDescription className="text-xs mt-1 line-clamp-2">
                        {profileWithProviders.profile.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Provider Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Providers</span>
                    <span className="font-medium">
                      {profileWithProviders.enabledProviderCount}/{profileWithProviders.providerCount}
                    </span>
                  </div>

                  {profileWithProviders.providerCount > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profileWithProviders.configuredProviders.slice(0, 3).map((provider) => (
                        <Badge
                          key={provider.id}
                          variant={provider.enabled ? "default" : "secondary"}
                          className="text-xs"
                        >
                          <IconServer className="h-3 w-3 mr-1" />
                          {provider.name}
                        </Badge>
                      ))}
                      {profileWithProviders.configuredProviders.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profileWithProviders.configuredProviders.length - 3} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      No providers configured
                    </div>
                  )}

                  {/* API Keys Status */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IconKey className="h-3 w-3" />
                    {profileWithProviders.configuredProviders.filter(p => p.hasApiKey).length}
                    {profileWithProviders.configuredProviders.filter(p => p.hasApiKey).length === 1 ? ' API key' : ' API keys'} configured
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant={currentProfile?.id === profileWithProviders.profile.id ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSwitchProfile(profileWithProviders.profile.id, profileWithProviders.profile.name)}
                  >
                    {currentProfile?.id === profileWithProviders.profile.id ? (
                      <>
                        <IconCheck className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      'Switch'
                    )}
                  </Button>

                  {onConfigureProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onConfigureProfile(profileWithProviders.profile.id)}
                    >
                      <IconSettings className="h-3 w-3" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(profileWithProviders)}
                  >
                    <IconEdit className="h-3 w-3" />
                  </Button>

                  {!profileWithProviders.profile.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteProfile(profileWithProviders)}
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update the profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-profile-name">Profile Name *</Label>
              <Input
                id="edit-profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Profile name"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {profileName.length}/50 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-profile-description">Description</Label>
              <Textarea
                id="edit-profile-description"
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                placeholder="Profile description"
                rows={3}
                maxLength={200}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProfile} disabled={!profileName.trim()}>
              Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Stats */}
      <div className="text-xs text-muted-foreground border-t pt-4">
        {profilesWithProviders.length} profile{profilesWithProviders.length !== 1 ? 's' : ''} •
        {profilesWithProviders.reduce((sum, p) => sum + p.providerCount, 0)} total providers configured •
        {profilesWithProviders.reduce((sum, p) => sum + p.enabledProviderCount, 0)} enabled
      </div>
    </div>
  )
}