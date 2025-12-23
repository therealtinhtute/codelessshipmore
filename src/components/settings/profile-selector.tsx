"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAISettings } from "@/contexts/ai-settings-context"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconUser,
} from "@tabler/icons-react"
import type { ProfileRecord } from "@/lib/storage/types"

export function ProfileSelector() {
  const {
    currentProfile,
    profiles,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    isLoading,
  } = useAISettings()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileDescription, setProfileDescription] = useState("")
  const [editingProfileId, setEditingProfileId] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleCreateProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Profile name is required")
      return
    }

    try {
      const profile = await createProfile(profileName.trim(), profileDescription.trim())
      toast.success("Profile created", {
        description: `"${profile.name}" has been created`
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
    if (!profileName.trim() || !editingProfileId) return

    try {
      await updateProfile(editingProfileId, {
        name: profileName.trim(),
        description: profileDescription.trim()
      })
      toast.success("Profile updated")
      setIsEditDialogOpen(false)
      setProfileName("")
      setProfileDescription("")
      setEditingProfileId("")
    } catch (error) {
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    if (!confirm(`Are you sure you want to delete "${profileName}"? This will also delete all provider configurations for this profile.`)) {
      return
    }

    try {
      await deleteProfile(profileId)
      toast.success("Profile deleted", {
        description: `"${profileName}" has been deleted`
      })
    } catch (error) {
      toast.error("Failed to delete profile", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const openEditDialog = (profile: ProfileRecord) => {
    setEditingProfileId(profile.id)
    setProfileName(profile.name)
    setProfileDescription(profile.description || "")
    setIsEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/20">
        <div className="h-4 w-4 animate-pulse bg-muted rounded"></div>
        <div className="h-4 w-32 animate-pulse bg-muted rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile Info */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Current Profile
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <IconUser className="h-4 w-4 text-primary" />
            <span className="font-semibold">
              {currentProfile?.name || "No profile"}
            </span>
            {currentProfile?.isDefault && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                Default
              </span>
            )}
          </div>
          {currentProfile?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {currentProfile.description}
            </p>
          )}
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <IconChevronDown className="h-4 w-4" />
              Switch Profile
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
              Profiles ({profiles.length})
            </div>
            <DropdownMenuSeparator />

            {/* Profile List */}
            {profiles.map((profile) => (
              <div key={profile.id}>
                <DropdownMenuItem
                  className="flex-col items-start"
                  onClick={() => {
                    if (profile.id !== currentProfile?.id) {
                      switchProfile(profile.id)
                      toast.success("Profile switched", {
                        description: `Switched to "${profile.name}"`
                      })
                    }
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">
                      {profile.name}
                      {profile.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-2">
                          Default
                        </span>
                      )}
                    </span>
                    {profile.id === currentProfile?.id && (
                      <span className="text-xs text-primary">Active</span>
                    )}
                  </div>
                  {profile.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 w-full truncate">
                      {profile.description}
                    </p>
                  )}
                </DropdownMenuItem>

                {/* Profile Actions */}
                {profile.id !== currentProfile?.id && (
                  <div className="flex gap-1 px-1 pb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(profile)
                      }}
                    >
                      <IconEdit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {!profile.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProfile(profile.id, profile.name)
                        }}
                      >
                        <IconTrash className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            <DropdownMenuSeparator />

            {/* Create New Profile */}
            <DropdownMenuItem
              onClick={() => setIsCreateDialogOpen(true)}
              className="text-primary"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Create New Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Profile Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Create a new profile to organize your AI provider configurations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name *</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g., Work, Personal, Testing"
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
              <Label htmlFor="edit-profile-name">Name *</Label>
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
      <div className="text-xs text-muted-foreground">
        {profiles.length} profile{profiles.length !== 1 ? 's' : ''} available
      </div>
    </div>
  )
}