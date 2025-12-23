import { LocalStorageProvider } from "./local-storage-provider"

export class BackupRestore {
  private static instance: BackupRestore | null = null
  private storageProvider: LocalStorageProvider

  private constructor() {
    this.storageProvider = LocalStorageProvider.getInstance()
  }

  static getInstance(): BackupRestore {
    if (!BackupRestore.instance) {
      BackupRestore.instance = new BackupRestore()
    }
    return BackupRestore.instance
  }

  /**
   * Export all AI settings data as JSON
   */
  async exportData(): Promise<{ data: string; filename: string }> {
    if (!this.storageProvider.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    try {
      const data = await this.storageProvider.exportData()
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `ai-settings-backup-${timestamp}.json`

      return { data, filename }
    } catch (error) {
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Import data from JSON
   */
  async importData(jsonData: string): Promise<{ success: boolean; message: string }> {
    if (!this.storageProvider.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    try {
      // Validate JSON format
      const parsed = JSON.parse(jsonData)

      // Basic structure validation
      if (!parsed.profiles || !Array.isArray(Object.values(parsed.profiles))) {
        throw new Error("Invalid data format: missing profiles")
      }

      if (!parsed.providers || !Array.isArray(Object.values(parsed.providers))) {
        throw new Error("Invalid data format: missing providers")
      }

      // Confirm import with user
      const profileCount = Object.keys(parsed.profiles).length
      const providerCount = Object.keys(parsed.providers).length

      // Import data
      await this.storageProvider.importData(jsonData)

      return {
        success: true,
        message: `Successfully imported ${profileCount} profiles and ${providerCount} provider configurations. Reload the page to see changes.`,
      }
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  /**
   * Clear all AI settings data
   */
  async clearAllData(): Promise<void> {
    if (!this.storageProvider.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    try {
      await this.storageProvider.clearAll()
    } catch (error) {
      throw new Error(`Failed to clear data: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Get current data size information
   */
  async getDataInfo(): Promise<{
    profileCount: number
    providerCount: number
    dataSize: string
    quotaInfo: { usage: number; quota: number; percentUsed: number }
  }> {
    if (!this.storageProvider.isAvailable()) {
      throw new Error("localStorage is not available")
    }

    try {
      const profiles = await this.storageProvider.getAllProfiles()
      const profileCount = profiles.length

      let providerCount = 0
      for (const profile of profiles) {
        const configs = await this.storageProvider.getProviderConfigsByProfile(profile.id)
        providerCount += configs.length
      }

      const quotaInfo = await this.storageProvider.getQuotaInfo()
      const dataSize = new Blob([await this.storageProvider.exportData()]).size
      const dataSizeFormatted = this.formatBytes(dataSize)

      return {
        profileCount,
        providerCount,
        dataSize: dataSizeFormatted,
        quotaInfo,
      }
    } catch (error) {
      throw new Error(`Failed to get data info: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  /**
   * Download data as file
   */
  downloadData(data: string, filename: string): void {
    try {
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Read file from file input
   */
  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error("Failed to read file"))
        }
      }
      reader.onerror = () => reject(new Error("File reading error"))
      reader.readAsText(file)
    })
  }
}