import type {
  ProfileRecord,
  ProviderConfigRecord,
  AppMetadata,
  CreateProfileInput,
} from "./types"
import { StorageProvider } from "./storage-provider"

const STORAGE_KEYS = {
  PROFILES: "ai-profiles",
  PROVIDERS: "ai-providers",
  METADATA: "ai-metadata",
} as const

interface LocalStorageData {
  profiles: Record<string, ProfileRecord>
  providers: Record<string, ProviderConfigRecord>
  metadata: Record<string, AppMetadata>
}

export class LocalStorageProvider extends StorageProvider {
  private static instance: LocalStorageProvider | null = null

  static getInstance(): LocalStorageProvider {
    if (!LocalStorageProvider.instance) {
      LocalStorageProvider.instance = new LocalStorageProvider()
    }
    return LocalStorageProvider.instance
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = "__storage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage quota information
   */
  async getQuotaInfo(): Promise<{
    usage: number;
    quota: number;
    percentUsed: number;
  }> {
    if (!navigator.storage?.estimate) {
      return { usage: 0, quota: 0, percentUsed: 0 }
    }

    try {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0

      return { usage, quota, percentUsed }
    } catch {
      return { usage: 0, quota: 0, percentUsed: 0 }
    }
  }

  /**
   * Get all data from localStorage
   */
  private getAllData(): LocalStorageData {
    try {
      const profilesJson = localStorage.getItem(STORAGE_KEYS.PROFILES)
      const providersJson = localStorage.getItem(STORAGE_KEYS.PROVIDERS)
      const metadataJson = localStorage.getItem(STORAGE_KEYS.METADATA)

      return {
        profiles: profilesJson ? JSON.parse(profilesJson) : {},
        providers: providersJson ? JSON.parse(providersJson) : {},
        metadata: metadataJson ? JSON.parse(metadataJson) : {},
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return { profiles: {}, providers: {}, metadata: {} }
    }
  }

  /**
   * Save data to localStorage
   */
  private saveData(key: keyof typeof STORAGE_KEYS, data: Record<string, unknown> | unknown[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data))
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        throw new Error("Storage quota exceeded. Please clear some data.")
      }
      throw new Error(`Failed to save data to localStorage: ${error}`)
    }
  }

  // ==================== Profile Operations ====================

  async createProfile(input: CreateProfileInput): Promise<ProfileRecord> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    const profile: ProfileRecord = {
      id: crypto.randomUUID(),
      name: input.name.trim().slice(0, 50),
      description: input.description?.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
    }

    data.profiles[profile.id] = profile
    this.saveData("PROFILES", data.profiles)

    return profile
  }

  async updateProfile(
    id: string,
    data: Partial<Omit<ProfileRecord, "id" | "createdAt">>
  ): Promise<ProfileRecord> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const profilesData = this.getAllData()
    const existing = profilesData.profiles[id]
    if (!existing) throw new Error(`Profile ${id} not found`)

    const updated: ProfileRecord = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    }

    profilesData.profiles[id] = updated
    this.saveData("PROFILES", profilesData.profiles)

    return updated
  }

  async deleteProfile(id: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    const profile = data.profiles[id]
    if (!profile) throw new Error(`Profile ${id} not found`)
    if (profile.isDefault) {
      throw new Error("Cannot delete default profile")
    }

    // Delete all provider configs for this profile
    const profileProviderKeys = Object.keys(data.providers).filter(
      (key) => data.providers[key].profileId === id
    )
    profileProviderKeys.forEach((key) => {
      delete data.providers[key]
    })

    // Delete profile
    delete data.profiles[id]

    // Save changes
    this.saveData("PROFILES", data.profiles)
    this.saveData("PROVIDERS", data.providers)
  }

  async getProfile(id: string): Promise<ProfileRecord | null> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    return data.profiles[id] || null
  }

  async getAllProfiles(): Promise<ProfileRecord[]> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    return Object.values(data.profiles)
  }

  async saveProfile(profile: ProfileRecord): Promise<ProfileRecord> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    data.profiles[profile.id] = profile
    this.saveData("PROFILES", data.profiles)
    return profile
  }

  async getDefaultProfile(): Promise<ProfileRecord> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    const profile = Object.values(data.profiles).find((p) => p.isDefault)

    if (!profile) {
      // Create default profile if it doesn't exist
      const defaultProfile: ProfileRecord = {
        id: crypto.randomUUID(),
        name: "Default",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDefault: true,
      }

      data.profiles[defaultProfile.id] = defaultProfile
      this.saveData("PROFILES", data.profiles)
      return defaultProfile
    }

    return profile
  }

  // ==================== Provider Config Operations ====================

  async saveProviderConfig(
    config: Omit<ProviderConfigRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ProviderConfigRecord> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    const compositeKey = `${config.profileId}:${config.providerId}`
    const existing = data.providers[compositeKey]

    const record: ProviderConfigRecord = existing
      ? {
          ...existing,
          ...config,
          updatedAt: Date.now(),
        }
      : {
          id: crypto.randomUUID(),
          ...config,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

    data.providers[compositeKey] = record
    this.saveData("PROVIDERS", data.providers)

    return record
  }

  async updateProviderConfig(
    id: string,
    data: Partial<Omit<ProviderConfigRecord, "id" | "createdAt">>
  ): Promise<ProviderConfigRecord> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const providersData = this.getAllData()
    const existing = providersData.providers[id]
    if (!existing) throw new Error(`Provider config ${id} not found`)

    const updated: ProviderConfigRecord = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    }

    providersData.providers[id] = updated
    this.saveData("PROVIDERS", providersData.providers)

    return updated
  }

  async deleteProviderConfig(id: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    if (!data.providers[id]) {
      throw new Error(`Provider config ${id} not found`)
    }

    delete data.providers[id]
    this.saveData("PROVIDERS", data.providers)
  }

  async getProviderConfigsByProfile(
    profileId: string
  ): Promise<ProviderConfigRecord[]> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    return Object.values(data.providers).filter(
      (config) => config.profileId === profileId
    )
  }

  async getProviderConfig(
    profileId: string,
    providerId: string
  ): Promise<ProviderConfigRecord | null> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    const compositeKey = `${profileId}:${providerId}`
    return data.providers[compositeKey] || null
  }

  // ==================== Metadata Operations ====================

  async setMetadata(key: string, value: unknown): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    const metadata: AppMetadata = {
      key,
      value,
      updatedAt: Date.now(),
    }

    data.metadata[key] = metadata
    this.saveData("METADATA", data.metadata)
  }

  async getMetadata(key: string): Promise<unknown> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    const data = this.getAllData()
    return data.metadata[key]?.value
  }

  async getSchemaVersion(): Promise<number> {
    const version = await this.getMetadata("schema_version")
    return (typeof version === "number" ? version : 0) || 0
  }

  async setSchemaVersion(version: number): Promise<void> {
    await this.setMetadata("schema_version", version)
  }

  // ==================== Utility Methods ====================

  /**
   * Clear all AI settings data
   */
  async clearAll(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILES)
      localStorage.removeItem(STORAGE_KEYS.PROVIDERS)
      localStorage.removeItem(STORAGE_KEYS.METADATA)
    } catch (error) {
      throw new Error(`Failed to clear localStorage data: ${error}`)
    }
  }

  /**
   * Export all data as JSON
   */
  async exportData(): Promise<string> {
    const data = this.getAllData()
    return JSON.stringify(data, null, 2)
  }

  /**
   * Import data from JSON
   */
  async importData(jsonData: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    try {
      const data: LocalStorageData = JSON.parse(jsonData)

      // Validate data structure
      if (!data.profiles || !data.providers || !data.metadata) {
        throw new Error("Invalid data format")
      }

      this.saveData("PROFILES", data.profiles)
      this.saveData("PROVIDERS", data.providers)
      this.saveData("METADATA", data.metadata)
    } catch (error) {
      throw new Error(`Failed to import data: ${error}`)
    }
  }

  /**
   * Close the storage provider (no-op for localStorage)
   */
  close(): void {
    // localStorage doesn't need closing
  }
}