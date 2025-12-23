"use client"

import { useState } from "react"
import { IconLoader2, IconAlertTriangle, IconSettings } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { ProfileList } from "./profile-list"
import { ProfileConfiguration } from "./profile-configuration"
import { useAISettings } from "@/contexts/ai-settings-context"
import { Badge } from "@/components/ui/badge"

export function AISettings() {
  const {
    currentProfile,
    isLoading,
    isFallbackMode,
  } = useAISettings()
  const [selectedProfileForConfig, setSelectedProfileForConfig] = useState<string | null>(null)

  if (isFallbackMode) {
    return (
      <div className="text-center py-12">
        <IconAlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Storage Unavailable</h3>
        <p className="text-muted-foreground">
          localStorage is not available. Please enable cookies and local storage in your browser settings.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Note: Private browsing mode may disable localStorage. Try using a regular browser window.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedProfileForConfig ? (
        <ProfileConfiguration
          profileId={selectedProfileForConfig}
          onBack={() => setSelectedProfileForConfig(null)}
        />
      ) : (
        <>
          {/* Profile List - Profile First Flow */}
          <ProfileList onConfigureProfile={setSelectedProfileForConfig} />

          {/* Quick Actions */}
          {currentProfile && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Current profile: <Badge variant="secondary">{currentProfile.name}</Badge>
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProfileForConfig(currentProfile.id)}
                >
                  <IconSettings className="h-4 w-4 mr-2" />
                  Configure Current Profile
                </Button>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <IconAlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              API keys are encrypted and stored in your browser using localStorage. They are never sent to our servers.
            </p>
          </div>
        </>
      )}
    </div>
  )
}