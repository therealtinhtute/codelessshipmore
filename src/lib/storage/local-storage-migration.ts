import { LocalStorageProvider } from "./local-storage-provider"
import type { ProfileRecord } from "./types"

interface IndexedDBProvider {
  isAvailable: () => boolean
  getAllProfiles: () => Promise<ProfileRecord[]>
  getProviderConfigsByProfile: (profileId: string) => Promise<ProviderConfig[]>
  getMetadata: (key: string) => Promise<unknown>
  getSchemaVersion: () => Promise<number>
  deleteProviderConfig: (id: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  getProfile: (id: string) => Promise<ProfileRecord | null>
  getDefaultProfile: () => Promise<ProfileRecord>
}

interface ProviderConfig {
  id: string
  profileId: string
  providerId: string
  providerType: "builtin" | "custom"
  apiKey: { iv: string; data: string } | null
  model: string
  baseUrl?: string
  enabled: boolean
  customName?: string
  customModels?: string[]
  createdAt: number
  updatedAt: number
}

// Temporary IndexedDB access for migration
let ProviderDB: IndexedDBProvider | null = null

try {
  // Try to import IndexedDB only if available
  if (typeof indexedDB !== "undefined") {
    // Basic IndexedDB operations for migration
    ProviderDB = {
      isAvailable: () => true,
      getAllProfiles: async (): Promise<ProfileRecord[]> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["profiles"], "readonly")
              const store = transaction.objectStore("profiles")
              const getAllRequest = store.getAll()
              getAllRequest.onerror = () => reject(getAllRequest.error)
              getAllRequest.onsuccess = () => resolve(getAllRequest.result)
            } catch (error) {
              reject(error)
            }
          }
        })
      },
      getProviderConfigsByProfile: async (profileId: string): Promise<ProviderConfig[]> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["provider_configs"], "readonly")
              const store = transaction.objectStore("provider_configs")
              const index = store.index("by-profileId")
              const getRequest = index.getAll(profileId)
              getRequest.onerror = () => reject(getRequest.error)
              getRequest.onsuccess = () => resolve(getRequest.result)
            } catch (error) {
              reject(error)
            }
          }
        })
      },
      getMetadata: async (key: string): Promise<unknown> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["app_metadata"], "readonly")
              const store = transaction.objectStore("app_metadata")
              const getRequest = store.get(key)
              getRequest.onerror = () => reject(getRequest.error)
              getRequest.onsuccess = () => {
                const result = getRequest.result
                resolve(result ? result.value : null)
              }
            } catch (error) {
              reject(error)
            }
          }
        })
      },
      getSchemaVersion: async (): Promise<number> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["app_metadata"], "readonly")
              const store = transaction.objectStore("app_metadata")
              const getRequest = store.get("schema_version")
              getRequest.onerror = () => reject(getRequest.error)
              getRequest.onsuccess = () => {
                const result = getRequest.result
                resolve(result?.value || 0)
              }
            } catch (error) {
              reject(error)
            }
          }
        })
      },
      deleteProviderConfig: async (id: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["provider_configs"], "readwrite")
              const store = transaction.objectStore("provider_configs")
              const deleteRequest = store.delete(id)
              deleteRequest.onerror = () => reject(deleteRequest.error)
              deleteRequest.onsuccess = () => {
                transaction.oncomplete = () => resolve()
              }
            } catch (error) {
              reject(error)
            }
          }
        })
      },
      deleteProfile: async (id: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["profiles"], "readwrite")
              const store = transaction.objectStore("profiles")
              const deleteRequest = store.delete(id)
              deleteRequest.onerror = () => reject(deleteRequest.error)
              deleteRequest.onsuccess = () => {
                transaction.oncomplete = () => resolve()
              }
            } catch (error) {
              reject(error)
            }
          }
        })
      },
      getProfile: async (id: string): Promise<ProfileRecord | null> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["profiles"], "readonly")
              const store = transaction.objectStore("profiles")
              const getRequest = store.get(id)
              getRequest.onerror = () => reject(getRequest.error)
              getRequest.onsuccess = () => resolve(getRequest.result || null)
            } catch (error) {
              reject(error)
            }
          }
        })
      },
      getDefaultProfile: async (): Promise<ProfileRecord> => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("ai-settings-db", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            try {
              const db = request.result
              const transaction = db.transaction(["profiles"], "readonly")
              const store = transaction.objectStore("profiles")
              const index = store.index("by-isDefault")
              const getRequest = index.get(IDBKeyRange.only(true))
              getRequest.onerror = () => reject(getRequest.error)
              getRequest.onsuccess = () => {
                const result = getRequest.result
                if (result) {
                  resolve(result)
                } else {
                  reject(new Error("No default profile found"))
                }
              }
            } catch (error) {
              reject(error)
            }
          }
        })
      }
    }
  }
} catch {
  console.warn("IndexedDB not available for migration")
}

export class LocalStorageMigration {
  private static instance: LocalStorageMigration | null = null
  private localStorageProvider: LocalStorageProvider

  private constructor() {
    this.localStorageProvider = LocalStorageProvider.getInstance()
  }

  static getInstance(): LocalStorageMigration {
    if (!LocalStorageMigration.instance) {
      LocalStorageMigration.instance = new LocalStorageMigration()
    }
    return LocalStorageMigration.instance
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(): Promise<boolean> {
    try {
      // Check if localStorage has data
      const currentVersion = await this.localStorageProvider.getSchemaVersion()
      if (currentVersion >= 2) {
        return false
      }

      // Check if IndexedDB is available and has data to migrate
      if (!ProviderDB) {
        await this.localStorageProvider.setSchemaVersion(2)
        return false
      }

      const profiles = await ProviderDB.getAllProfiles()
      if (profiles.length === 0) {
        // No data to migrate, just set version
        await this.localStorageProvider.setSchemaVersion(2)
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking migration status:", error)
      return false
    }
  }

  /**
   * Migrate data from IndexedDB to localStorage
   */
  async migrate(): Promise<{ success: boolean; message: string; migratedItems: number }> {
    if (!this.localStorageProvider.isAvailable()) {
      return {
        success: false,
        message: "localStorage is not available",
        migratedItems: 0,
      }
    }

    if (!ProviderDB) {
      return {
        success: false,
        message: "IndexedDB is not available",
        migratedItems: 0,
      }
    }

    try {
      console.log("Starting IndexedDB to localStorage migration...")

      let migratedItems = 0

      // Migrate profiles
      const profiles = await ProviderDB.getAllProfiles()
      console.log(`Found ${profiles.length} profiles to migrate`)

      for (const profile of profiles) {
        await this.localStorageProvider.saveProfile(profile)
        migratedItems++
      }

      // Migrate provider configs
      const allProfiles = await ProviderDB.getAllProfiles()
      let providerConfigsMigrated = 0

      for (const profile of allProfiles) {
        const configs = await ProviderDB.getProviderConfigsByProfile(profile.id)
        console.log(`Migrating ${configs.length} provider configs for profile ${profile.name}`)

        for (const config of configs) {
          await this.localStorageProvider.saveProviderConfig({
            profileId: config.profileId,
            providerId: config.providerId,
            providerType: config.providerType as "builtin" | "custom",
            apiKey: config.apiKey, // API keys are already encrypted
            model: config.model,
            baseUrl: config.baseUrl,
            enabled: config.enabled,
            customName: config.customName,
            customModels: config.customModels,
          })
          migratedItems++
          providerConfigsMigrated++
        }
      }

      // Migrate metadata
      try {
        const activeProfileId = await ProviderDB.getMetadata("active_profile_id")
        if (activeProfileId) {
          await this.localStorageProvider.setMetadata("active_profile_id", activeProfileId)
          migratedItems++
        }

        const schemaVersion = await ProviderDB.getSchemaVersion()
        await this.localStorageProvider.setMetadata("schema_version", schemaVersion)
        migratedItems++
      } catch (error) {
        console.warn("Error migrating metadata:", error)
      }

      // Update schema version
      await this.localStorageProvider.setSchemaVersion(2)

      console.log(`Migration completed successfully. Migrated ${migratedItems} items.`)

      return {
        success: true,
        message: `Successfully migrated ${profiles.length} profiles and ${providerConfigsMigrated} provider configurations`,
        migratedItems,
      }
    } catch (error) {
      console.error("Migration failed:", error)
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        migratedItems: 0,
      }
    }
  }

  /**
   * Clear IndexedDB after successful migration
   */
  async clearIndexedDB(): Promise<void> {
    if (!ProviderDB) {
      console.warn("IndexedDB not available, skipping cleanup")
      return
    }

    try {
      console.log("Clearing IndexedDB after migration...")

      // Get all profiles to delete
      const profiles = await ProviderDB.getAllProfiles()

      // Delete all provider configs first
      for (const profile of profiles) {
        const configs = await ProviderDB.getProviderConfigsByProfile(profile.id)
        for (const config of configs) {
          await ProviderDB.deleteProviderConfig(config.id)
        }
      }

      // Delete all profiles (except default if it exists)
      for (const profile of profiles) {
        if (!profile.isDefault) {
          try {
            await ProviderDB.deleteProfile(profile.id)
          } catch (error) {
            console.warn(`Could not delete profile ${profile.id}:`, error)
          }
        }
      }

      console.log("IndexedDB cleanup completed")
    } catch (error) {
      console.error("Error clearing IndexedDB:", error)
      throw error
    }
  }

  /**
   * Perform full migration with cleanup
   */
  async migrateAndCleanup(): Promise<{ success: boolean; message: string }> {
    const migrationResult = await this.migrate()

    if (!migrationResult.success) {
      return migrationResult
    }

    try {
      await this.clearIndexedDB()
      return {
        success: true,
        message: `${migrationResult.message} IndexedDB has been cleaned up.`,
      }
    } catch (error) {
      return {
        success: true,
        message: `${migrationResult.message} Warning: Could not clear IndexedDB: ${error}`,
      }
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    needsMigration: boolean
    localStorageAvailable: boolean
    localStorageItems: number
    indexedDBAvailable: boolean
    indexedDBItems: number
  }> {
    const localStorageAvailable = this.localStorageProvider.isAvailable()
    const indexedDBAvailable = ProviderDB ? ProviderDB.isAvailable() : false
    const needsMigration = await this.isMigrationNeeded()

    let localStorageItems = 0
    let indexedDBItems = 0

    if (localStorageAvailable) {
      try {
        const profiles = await this.localStorageProvider.getAllProfiles()
        localStorageItems += profiles.length

        for (const profile of profiles) {
          const configs = await this.localStorageProvider.getProviderConfigsByProfile(profile.id)
          localStorageItems += configs.length
        }
      } catch (error) {
        console.warn("Error counting localStorage items:", error)
      }
    }

    if (indexedDBAvailable && ProviderDB) {
      try {
        const profiles = await ProviderDB.getAllProfiles()
        indexedDBItems += profiles.length

        for (const profile of profiles) {
          const configs = await ProviderDB.getProviderConfigsByProfile(profile.id)
          indexedDBItems += configs.length
        }
      } catch (error) {
        console.warn("Error counting IndexedDB items:", error)
      }
    }

    return {
      needsMigration,
      localStorageAvailable,
      localStorageItems,
      indexedDBAvailable,
      indexedDBItems,
    }
  }

  /**
   * Export IndexedDB data before migration
   */
  async exportIndexedDBData(): Promise<string> {
    if (!ProviderDB) {
      throw new Error("IndexedDB is not available")
    }

    try {
      const profiles = await ProviderDB.getAllProfiles()
      const providerConfigs: Record<string, ProviderConfig> = {}

      for (const profile of profiles) {
        const configs = await ProviderDB.getProviderConfigsByProfile(profile.id)
        configs.forEach((config: ProviderConfig) => {
          const key = `${profile.id}:${config.providerId}`
          providerConfigs[key] = config
        })
      }

      const metadata: Record<string, unknown> = {}
      try {
        metadata.active_profile_id = await ProviderDB.getMetadata("active_profile_id")
        metadata.schema_version = await ProviderDB.getSchemaVersion()
      } catch (error) {
        console.warn("Error exporting metadata:", error)
      }

      return JSON.stringify({
        profiles,
        providers: providerConfigs,
        metadata,
        exportedAt: new Date().toISOString(),
      }, null, 2)
    } catch (error) {
      throw new Error(`Failed to export IndexedDB data: ${error}`)
    }
  }
}