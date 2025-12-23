import type {
  ProfileRecord,
  ProviderConfigRecord,
  CreateProfileInput,
} from "./types"

export abstract class StorageProvider {
  abstract isAvailable(): boolean

  abstract getQuotaInfo(): Promise<{
    usage: number;
    quota: number;
    percentUsed: number;
  }>

  // Profile operations
  abstract createProfile(input: CreateProfileInput): Promise<ProfileRecord>
  abstract updateProfile(
    id: string,
    data: Partial<Omit<ProfileRecord, "id" | "createdAt">>
  ): Promise<ProfileRecord>
  abstract deleteProfile(id: string): Promise<void>
  abstract getProfile(id: string): Promise<ProfileRecord | null>
  abstract getAllProfiles(): Promise<ProfileRecord[]>
  abstract getDefaultProfile(): Promise<ProfileRecord>

  // Provider config operations
  abstract saveProviderConfig(
    config: Omit<ProviderConfigRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ProviderConfigRecord>
  abstract updateProviderConfig(
    id: string,
    data: Partial<Omit<ProviderConfigRecord, "id" | "createdAt">>
  ): Promise<ProviderConfigRecord>
  abstract deleteProviderConfig(id: string): Promise<void>
  abstract getProviderConfigsByProfile(
    profileId: string
  ): Promise<ProviderConfigRecord[]>
  abstract getProviderConfig(
    profileId: string,
    providerId: string
  ): Promise<ProviderConfigRecord | null>

  // Metadata operations
  abstract setMetadata(key: string, value: unknown): Promise<void>
  abstract getMetadata(key: string): Promise<unknown>

  // Schema version operations
  abstract getSchemaVersion(): Promise<number>
  abstract setSchemaVersion(version: number): Promise<void>

  // Cleanup
  abstract close(): void
}