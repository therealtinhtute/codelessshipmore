
/**
 * Encrypted data structure for API keys
 * Re-exported from encryption module
 */
export interface EncryptedData {
  iv: string; // Base64 encoded initialization vector
  data: string; // Base64 encoded encrypted data
}

/**
 * Profile record stored in IndexedDB
 */
export interface ProfileRecord {
  id: string; // UUID primary key
  name: string; // Max 50 chars
  description?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  isDefault: boolean; // Only one profile can be default
}

/**
 * Provider configuration record stored in IndexedDB
 */
export interface ProviderConfigRecord {
  id: string; // UUID primary key
  profileId: string; // FK to ProfileRecord.id
  providerId: string; // "openai", "anthropic", "custom-xyz"
  providerType: "builtin" | "custom";

  // Configuration
  apiKey: EncryptedData | null;
  model: string;
  baseUrl?: string;
  enabled: boolean;

  // Custom provider specific
  customName?: string;
  customModels?: string[];

  createdAt: number;
  updatedAt: number;
}

/**
 * Application metadata (version, active profile, etc.)
 */
export interface AppMetadata {
  key: string; // Primary key: "schema_version", "active_profile_id", etc.
  value: unknown;
  updatedAt: number;
}

/**
 * IndexedDB database schema for idb
 */
export interface AISettingsDBSchema {
  profiles: {
    key: string;
    value: ProfileRecord;
    indexes: {
      "by-isDefault": boolean;
    };
  };
  provider_configs: {
    key: string;
    value: ProviderConfigRecord;
    indexes: {
      "by-profileId": string;
      "by-providerId": string;
      "by-profileId-providerId": [string, string];
    };
  };
  app_metadata: {
    key: string;
    value: AppMetadata;
  };
}

/**
 * Input for creating a new profile
 */
export interface CreateProfileInput {
  name: string;
  description?: string;
}

/**
 * Input for creating a custom provider
 */
export interface CustomProviderInput {
  name: string;
  baseUrl: string;
  models: string[];
  apiKeyPlaceholder?: string;
}

/**
 * Legacy localStorage settings structure for migration
 */
export interface LegacySettings {
  providers: Record<
    string,
    {
      id: string;
      apiKey: EncryptedData | null;
      baseUrl?: string;
      model: string;
      enabled: boolean;
    }
  >;
  activeProvider: string | null;
}
