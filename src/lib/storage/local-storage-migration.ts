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

const DB_NAME = "ai-settings-db"
const DB_VERSION = 1

// Cached database connection
let cachedDB: IDBDatabase | null = null
let schemaValidated = false
let schemaValid = false

/**
 * Get cached DB connection or open a new one
 */
async function getDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return null
  if (cachedDB) return cachedDB

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.warn("Failed to open IndexedDB:", request.error)
      resolve(null)
    }

    request.onblocked = () => {
      console.warn("IndexedDB blocked by another tab")
      resolve(null)
    }

    request.onsuccess = () => {
      cachedDB = request.result
      resolve(cachedDB)
    }
  })
}

/**
 * Close the cached database connection
 */
function closeDB(): void {
  if (cachedDB) {
    cachedDB.close()
    cachedDB = null
  }
}

/**
 * Check if the IndexedDB database has the expected schema
 * Returns false if the database doesn't exist or is missing object stores
 */
async function hasValidIndexedDBSchema(): Promise<boolean> {
  if (typeof indexedDB === "undefined") return false
  if (schemaValidated) return schemaValid

  const db = await getDB()
  if (!db) {
    schemaValidated = true
    schemaValid = false
    return false
  }

  // Check if all required object stores exist
  const requiredStores = ["profiles", "provider_configs", "app_metadata"]
  const existingStores = Array.from(db.objectStoreNames)
  const hasAllStores = requiredStores.every(store => existingStores.includes(store))

  schemaValidated = true
  schemaValid = hasAllStores

  if (!hasAllStores) {
    console.warn("IndexedDB exists but has invalid schema. Skipping migration.")
  }

  return hasAllStores
}

/**
 * Execute a function with a database transaction
 */
async function withTransaction<T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> {
  const db = await getDB()
  if (!db) return null

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeNames, mode)
      const store = transaction.objectStore(storeNames[0])
      const request = callback(store)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      transaction.onerror = () => reject(transaction.error)
    } catch (error) {
      reject(error)
    }
  })
}

// IndexedDB operations provider
const ProviderDB: IndexedDBProvider = {
  isAvailable: () => schemaValid,

  getAllProfiles: async (): Promise<ProfileRecord[]> => {
    if (!schemaValid) return []

    const result = await withTransaction<ProfileRecord[]>(["profiles"], "readonly", (store) => store.getAll())
    return result || []
  },

  getProviderConfigsByProfile: async (profileId: string): Promise<ProviderConfig[]> => {
    if (!schemaValid) return []

    return new Promise((resolve, reject) => {
      getDB().then(db => {
        if (!db) {
          resolve([])
          return
        }

        try {
          const transaction = db.transaction(["provider_configs"], "readonly")
          const store = transaction.objectStore("provider_configs")
          const index = store.index("by-profileId")
          const request = index.getAll(profileId)

          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result || [])
        } catch (error) {
          reject(error)
        }
      })
    })
  },

  getMetadata: async (key: string): Promise<unknown> => {
    if (!schemaValid) return null

    const result = await withTransaction<{ value: unknown }>(["app_metadata"], "readonly", (store) => store.get(key))
    return result?.value ?? null
  },

  getSchemaVersion: async (): Promise<number> => {
    if (!schemaValid) return 0

    const result = await withTransaction<{ value: number }>(
      ["app_metadata"],
      "readonly",
      (store) => store.get("schema_version")
    )
    return result?.value || 0
  },

  deleteProviderConfig: async (id: string): Promise<void> => {
    if (!schemaValid) return

    await withTransaction(["provider_configs"], "readwrite", (store) => store.delete(id))
  },

  deleteProfile: async (id: string): Promise<void> => {
    if (!schemaValid) return

    await withTransaction(["profiles"], "readwrite", (store) => store.delete(id))
  },

  getProfile: async (id: string): Promise<ProfileRecord | null> => {
    if (!schemaValid) return null

    const result = await withTransaction<ProfileRecord>(["profiles"], "readonly", (store) => store.get(id))
    return result || null
  },

  getDefaultProfile: async (): Promise<ProfileRecord> => {
    if (!schemaValid) {
      throw new Error("IndexedDB schema is invalid")
    }

    return new Promise((resolve, reject) => {
      getDB().then(db => {
        if (!db) {
          reject(new Error("IndexedDB not available"))
          return
        }

        try {
          const transaction = db.transaction(["profiles"], "readonly")
          const store = transaction.objectStore("profiles")
          const index = store.index("by-isDefault")
          const request = index.get(IDBKeyRange.only(true))

          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            const result = request.result
            if (result) {
              resolve(result)
            } else {
              reject(new Error("No default profile found"))
            }
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
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

      // Validate schema before checking
      const isSchemaValid = await hasValidIndexedDBSchema()

      // Check if IndexedDB is available and has data to migrate
      if (!isSchemaValid) {
        // No valid IndexedDB to migrate from, mark as migrated
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
      // If there's any error, assume no migration needed and set version
      try {
        await this.localStorageProvider.setSchemaVersion(2)
      } catch {
        // Ignore setSchemaVersion errors
      }
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

    // Verify schema is valid before attempting migration
    const isSchemaValid = await hasValidIndexedDBSchema()

    if (!isSchemaValid) {
      return {
        success: false,
        message: "IndexedDB is not available or has invalid schema",
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

      // Migrate provider configs - fetch all configs in parallel to avoid N+1
      const allConfigsPromises = profiles.map(profile =>
        ProviderDB.getProviderConfigsByProfile(profile.id).then(configs =>
          configs.map(config => ({ config, profileName: profile.name }))
        )
      )

      const allConfigsNested = await Promise.all(allConfigsPromises)
      const allConfigs = allConfigsNested.flat()

      console.log(`Found ${allConfigs.length} total provider configs to migrate`)

      for (const { config, profileName } of allConfigs) {
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
        message: `Successfully migrated ${profiles.length} profiles and ${allConfigs.length} provider configurations`,
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
    // Verify schema before attempting cleanup
    const isSchemaValid = await hasValidIndexedDBSchema()

    if (!isSchemaValid) {
      console.warn("IndexedDB not available or has invalid schema, skipping cleanup")
      return
    }

    try {
      console.log("Clearing IndexedDB after migration...")

      // Get all profiles and configs
      const profiles = await ProviderDB.getAllProfiles()

      // Collect all provider configs to delete
      const configsPromises = profiles.map(profile =>
        ProviderDB.getProviderConfigsByProfile(profile.id)
      )
      const allConfigsNested = await Promise.all(configsPromises)
      const allConfigIds = allConfigsNested.flat().map(config => config.id)

      // Delete all provider configs in parallel
      await Promise.all(allConfigIds.map(id => ProviderDB.deleteProviderConfig(id)))

      // Delete all profiles (except default if it exists)
      await Promise.all(
        profiles
          .filter(profile => !profile.isDefault)
          .map(profile => ProviderDB.deleteProfile(profile.id).catch(error => {
            console.warn(`Could not delete profile ${profile.id}:`, error)
          }))
      )

      // Close the database connection after cleanup
      closeDB()

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

    // Validate schema once
    const isSchemaValid = await hasValidIndexedDBSchema()

    const indexedDBAvailable = isSchemaValid ? ProviderDB.isAvailable() : false
    const needsMigration = await this.isMigrationNeeded()

    // Count localStorage items
    let localStorageItems = 0
    if (localStorageAvailable) {
      try {
        const profiles = await this.localStorageProvider.getAllProfiles()
        localStorageItems += profiles.length

        const configPromises = profiles.map(profile =>
          this.localStorageProvider.getProviderConfigsByProfile(profile.id)
        )
        const allConfigs = await Promise.all(configPromises)
        localStorageItems += allConfigs.flat().length
      } catch (error) {
        console.warn("Error counting localStorage items:", error)
      }
    }

    // Count IndexedDB items
    let indexedDBItems = 0
    if (indexedDBAvailable) {
      try {
        const profiles = await ProviderDB.getAllProfiles()
        indexedDBItems += profiles.length

        const configPromises = profiles.map(profile =>
          ProviderDB.getProviderConfigsByProfile(profile.id)
        )
        const allConfigs = await Promise.all(configPromises)
        indexedDBItems += allConfigs.flat().length
      } catch (error) {
        console.warn("Error counting IndexedDB items:", error)
        indexedDBItems = 0
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
    // Verify schema before attempting export
    const isSchemaValid = await hasValidIndexedDBSchema()

    if (!isSchemaValid) {
      throw new Error("IndexedDB is not available or has invalid schema")
    }

    try {
      const profiles = await ProviderDB.getAllProfiles()

      // Fetch all configs in parallel
      const configsPromises = profiles.map(profile =>
        ProviderDB.getProviderConfigsByProfile(profile.id).then(configs =>
          configs.map(config => ({ profileId: profile.id, config }))
        )
      )

      const allConfigsNested = await Promise.all(configsPromises)
      const allConfigs = allConfigsNested.flat()

      const providerConfigs: Record<string, ProviderConfig> = {}
      for (const { profileId, config } of allConfigs) {
        const key = `${profileId}:${config.providerId}`
        providerConfigs[key] = config
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
