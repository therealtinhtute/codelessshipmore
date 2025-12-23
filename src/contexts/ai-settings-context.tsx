"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode
} from "react"
import {
  type ProviderConfig,
  type ProviderId,
  PROVIDERS
} from "@/lib/ai/providers"
import { encrypt, decrypt, type EncryptedData } from "@/lib/ai/encryption"
import { LocalStorageProvider } from "@/lib/storage/local-storage-provider"
import { LocalStorageMigration } from "@/lib/storage/local-storage-migration"
import { type ProfileRecord } from "@/lib/storage/types"
import { type CustomProviderInput } from "@/lib/storage/types"

// Extended ProviderId for custom providers
export type ExtendedProviderId = ProviderId | (string & { __brand: "CustomProvider" });

// Profile with provider information for UI
export interface ProfileWithProviders {
  profile: ProfileRecord;
  configuredProviders: Array<{
    id: ExtendedProviderId;
    name: string;
    model: string;
    enabled: boolean;
    isCustom: boolean;
    hasApiKey: boolean;
  }>;
  hasAnyEnabledProvider: boolean;
  providerCount: number;
  enabledProviderCount: number;
}

// Provider settings with profile context
export interface ProfileProviderSettings {
  profileId: string;
  providers: Partial<Record<ExtendedProviderId, ProviderConfig & { providerType: "builtin" | "custom"; customName?: string; customModels?: string[] }>>;
  enabledProviders: ExtendedProviderId[];
}

// Context interface with profile management
interface AISettingsContextType {
  // Profile management
  currentProfile: ProfileRecord | null;
  profiles: ProfileRecord[];
  profilesWithProviders: ProfileWithProviders[];
  createProfile: (name: string, description?: string) => Promise<ProfileRecord>;
  updateProfile: (id: string, data: Partial<Pick<ProfileRecord, "name" | "description">>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  switchProfile: (id: string) => Promise<void>;

  // Provider management (scoped to current profile)
  settings: ProfileProviderSettings;
  isLoading: boolean;
  addProvider: (providerId: ProviderId) => Promise<void>;
  updateProvider: (id: ExtendedProviderId, config: Partial<ProviderConfig>) => Promise<void>;
  toggleProvider: (id: ExtendedProviderId) => Promise<void>;
  deleteProvider: (id: ExtendedProviderId) => Promise<void>;
  getDecryptedApiKey: (id: ExtendedProviderId) => Promise<string>;
  saveSettings: () => Promise<void>;

  // Custom provider creation
  createCustomProvider: (input: CustomProviderInput) => Promise<void>;

  // Fallback mode
  isFallbackMode: boolean;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(
  undefined
)

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<ProfileRecord | null>(null);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [profilesWithProviders, setProfilesWithProviders] = useState<ProfileWithProviders[]>([]);
  const [settings, setSettings] = useState<ProfileProviderSettings>({
    profileId: "",
    providers: {},
    enabledProviders: []
  });
  const [encryptedKeys, setEncryptedKeys] = useState<Partial<Record<ExtendedProviderId, EncryptedData | null>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // Initialize storage provider
  const [storageProvider] = useState(() => LocalStorageProvider.getInstance());
  const [migration] = useState(() => LocalStorageMigration.getInstance());

  const initializeData = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      // Check if localStorage is available
      if (!storageProvider.isAvailable()) {
        console.warn("localStorage not available, using fallback mode");
        setIsFallbackMode(true);
        setIsLoading(false);
        return;
      }

      // Run migration from IndexedDB if needed
      const migrationStatus = await migration.getMigrationStatus()
      if (migrationStatus.needsMigration && migrationStatus.indexedDBItems > 0) {
        console.log("Migrating data from IndexedDB to localStorage...")
        const migrationResult = await migration.migrateAndCleanup()
        if (migrationResult.success) {
          console.log(migrationResult.message)
        } else {
          console.error("Migration failed:", migrationResult.message)
        }
      }

      // Load profiles
      const profileList = await storageProvider.getAllProfiles()
      setProfiles(profileList)

      // Load profiles with providers
      const profilesWithProvidersData: ProfileWithProviders[] = []
      for (const profile of profileList) {
        const configs = await storageProvider.getProviderConfigsByProfile(profile.id)
        const configuredProviders = configs.map(config => {
          const providerId = config.providerId as ExtendedProviderId
          const isCustom = config.providerType === "custom"

          return {
            id: providerId,
            name: isCustom ? config.customName || providerId : PROVIDERS[providerId as ProviderId]?.name || providerId,
            model: config.model,
            enabled: config.enabled,
            isCustom,
            hasApiKey: !!config.apiKey
          }
        })

        const enabledProviders = configuredProviders.filter(p => p.enabled)

        profilesWithProvidersData.push({
          profile,
          configuredProviders,
          hasAnyEnabledProvider: enabledProviders.length > 0,
          providerCount: configuredProviders.length,
          enabledProviderCount: enabledProviders.length
        })
      }
      setProfilesWithProviders(profilesWithProvidersData)

      // Load or create active profile
      const activeProfileId = await storageProvider.getMetadata("active_profile_id")
      let profile: ProfileRecord

      if (activeProfileId && typeof activeProfileId === 'string') {
        const found = await storageProvider.getProfile(activeProfileId)
        if (found) {
          profile = found
        } else {
          profile = await storageProvider.getDefaultProfile()
        }
      } else {
        profile = await storageProvider.getDefaultProfile()
      }

      setCurrentProfile(profile)

      // Load provider configs for active profile
      const configs = await storageProvider.getProviderConfigsByProfile(profile.id)
      const providers: Partial<Record<ExtendedProviderId, ProviderConfig & { providerType: "builtin" | "custom"; customName?: string; customModels?: string[] }>> = {}
      const enabled: ExtendedProviderId[] = []
      const keys: Partial<Record<ExtendedProviderId, EncryptedData | null>> = {}

      for (const config of configs) {
        const providerId = config.providerId as ExtendedProviderId

        let baseProvider: ProviderConfig & { providerType: "builtin" | "custom"; customName?: string; customModels?: string[] }
        if (config.providerType === "custom") {
          baseProvider = {
            id: providerId as ProviderId,
            apiKey: "",
            model: config.model,
            baseUrl: config.baseUrl,
            enabled: config.enabled,
            providerType: "custom",
            customName: config.customName,
            customModels: config.customModels
          }
        } else {
          const providerDef = PROVIDERS[config.providerId as ProviderId]
          if (!providerDef) continue
          baseProvider = {
            id: config.providerId as ProviderId,
            apiKey: "",
            model: config.model || providerDef.defaultModel,
            baseUrl: config.baseUrl,
            enabled: config.enabled,
            providerType: "builtin"
          }
        }

        providers[providerId] = baseProvider

        if (config.enabled) {
          enabled.push(providerId)
        }

        if (config.apiKey) {
          keys[providerId] = config.apiKey
        }
      }

      setSettings({
        profileId: profile.id,
        providers,
        enabledProviders: enabled
      })
      setEncryptedKeys(keys)

      await storageProvider.setMetadata("active_profile_id", profile.id)

    } catch (error) {
      console.error("Failed to initialize AI settings:", error);
      setIsFallbackMode(true);
    }

    setIsLoading(false);
  }, [storageProvider, migration]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const loadProfiles = useCallback(async () => {
    try {
      const profileList = await storageProvider.getAllProfiles();
      setProfiles(profileList);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      throw error;
    }
  }, [storageProvider]);

  const loadProfilesWithProviders = useCallback(async () => {
    try {
      const profileList = await storageProvider.getAllProfiles();
      const profilesWithProvidersData: ProfileWithProviders[] = [];

      for (const profile of profileList) {
        const configs = await storageProvider.getProviderConfigsByProfile(profile.id);
        const configuredProviders = configs.map(config => {
          const providerId = config.providerId as ExtendedProviderId;
          const isCustom = config.providerType === "custom";

          return {
            id: providerId,
            name: isCustom ? config.customName || providerId : PROVIDERS[providerId as ProviderId]?.name || providerId,
            model: config.model,
            enabled: config.enabled,
            isCustom,
            hasApiKey: !!config.apiKey
          };
        });

        const enabledProviders = configuredProviders.filter(p => p.enabled);

        profilesWithProvidersData.push({
          profile,
          configuredProviders,
          hasAnyEnabledProvider: enabledProviders.length > 0,
          providerCount: configuredProviders.length,
          enabledProviderCount: enabledProviders.length
        });
      }

      setProfilesWithProviders(profilesWithProvidersData);
    } catch (error) {
      console.error("Failed to load profiles with providers:", error);
      throw error;
    }
  }, [storageProvider]);

  const loadProviderConfigs = useCallback(async (profileId: string) => {
    try {
      // Validate profile ID before proceeding
      if (!profileId || typeof profileId !== 'string') {
        console.error("Invalid profile ID provided to loadProviderConfigs:", profileId);
        throw new Error("Invalid profile ID");
      }

      const configs = await storageProvider.getProviderConfigsByProfile(profileId);
      const providers: Partial<Record<ExtendedProviderId, ProviderConfig & { providerType: "builtin" | "custom"; customName?: string; customModels?: string[] }>> = {};
      const enabled: ExtendedProviderId[] = [];
      const keys: Partial<Record<ExtendedProviderId, EncryptedData | null>> = {};

      // Process each config
      for (const config of configs) {
        const providerId = config.providerId as ExtendedProviderId;

        // Get provider definition or create custom one
        let baseProvider: ProviderConfig & { providerType: "builtin" | "custom"; customName?: string; customModels?: string[] };
        if (config.providerType === "custom") {
          baseProvider = {
            id: providerId as ProviderId, // Custom providers won't work with built-in functions
            apiKey: "",
            model: config.model,
            baseUrl: config.baseUrl,
            enabled: config.enabled,
            providerType: "custom",
            customName: config.customName,
            customModels: config.customModels
          };
        } else {
          const providerDef = PROVIDERS[config.providerId as ProviderId];
          if (!providerDef) continue; // Skip unknown providers
          baseProvider = {
            id: config.providerId as ProviderId,
            apiKey: "",
            model: config.model || providerDef.defaultModel,
            baseUrl: config.baseUrl,
            enabled: config.enabled,
            providerType: "builtin"
          };
        }

        providers[providerId] = baseProvider;

        if (config.enabled) {
          enabled.push(providerId);
        }

        if (config.apiKey) {
          keys[providerId] = config.apiKey;
        }
      }

      setSettings({
        profileId,
        providers,
        enabledProviders: enabled
      });
      setEncryptedKeys(keys);

      // Store active profile ID
      await storageProvider.setMetadata("active_profile_id", profileId);
    } catch (error) {
      console.error("Failed to load provider configs:", error);
      throw error;
    }
  }, [storageProvider]);

  // Profile management methods
  const createProfile = async (name: string, description?: string): Promise<ProfileRecord> => {
    try {
      const profile = await storageProvider.createProfile({
        name: name.trim().slice(0, 50),
        description: description?.trim()
      });
      await loadProfiles();
      await loadProfilesWithProviders();
      return profile;
    } catch (error) {
      console.error("Failed to create profile:", error);
      throw error;
    }
  };

  const updateProfile = async (id: string, data: Partial<Pick<ProfileRecord, "name" | "description">>) => {
    try {
      await storageProvider.updateProfile(id, data);
      await loadProfiles();
      await loadProfilesWithProviders();

      // Update current profile if it's the one being updated
      if (currentProfile?.id === id) {
        setCurrentProfile(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await storageProvider.deleteProfile(id);
      await loadProfiles();
      await loadProfilesWithProviders();

      // If we deleted the current profile, switch to default
      if (currentProfile?.id === id) {
        const defaultProfile = await storageProvider.getDefaultProfile();
        await switchProfile(defaultProfile.id);
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
      throw error;
    }
  };

  const switchProfile = async (id: string) => {
    try {
      const profile = await storageProvider.getProfile(id);
      if (!profile) throw new Error(`Profile ${id} not found`);

      setCurrentProfile(profile);
      await loadProviderConfigs(id);
    } catch (error) {
      console.error("Failed to switch profile:", error);
      throw error;
    }
  };

  // Provider management methods
  const addProvider = useCallback(
    async (providerId: ProviderId) => {
      if (!currentProfile) throw new Error("No current profile");

      try {
        // Check if provider already exists
        if (settings.providers[providerId]) {
          throw new Error(`Provider ${providerId} already exists`);
        }

        // Get provider definition
        const providerDef = PROVIDERS[providerId];
        if (!providerDef) {
          throw new Error(`Unknown provider: ${providerId}`);
        }

        // Create provider config
        const providerConfig: ProviderConfig & { providerType: "builtin" | "custom"; customName?: string; customModels?: string[] } = {
          id: providerId,
          apiKey: "",
          model: providerDef.defaultModel,
          baseUrl: providerDef.fixedBaseUrl || "",
          enabled: false,
          providerType: "builtin"
        };

        // Save to IndexedDB
        await storageProvider.saveProviderConfig({
          profileId: currentProfile.id,
          providerId,
          providerType: "builtin",
          apiKey: null,
          model: providerConfig.model,
          baseUrl: providerConfig.baseUrl,
          enabled: false
        });

        // Reload providers for this profile
        await loadProviderConfigs(currentProfile.id);
        await loadProfilesWithProviders();
      } catch (error) {
        console.error("Failed to add provider:", error);
        throw error;
      }
    },
    [currentProfile, settings.providers, storageProvider, loadProfilesWithProviders, loadProviderConfigs]
  );

  const updateProvider = useCallback(
    async (id: ExtendedProviderId, config: Partial<ProviderConfig>) => {
      if (!currentProfile) throw new Error("No current profile");

      try {
        const existing = settings.providers[id];
        if (!existing) throw new Error(`Provider ${id} not found`);

        // Handle API key encryption
        let encryptedKey = encryptedKeys[id];
        if (config.apiKey && config.apiKey.length > 0) {
          encryptedKey = await encrypt(config.apiKey);
          setEncryptedKeys(prev => ({
            ...prev,
            [id]: encryptedKey
          }));
        }

        // Save to IndexedDB
        await storageProvider.saveProviderConfig({
          profileId: currentProfile.id,
          providerId: id,
          providerType: existing.providerType,
          apiKey: encryptedKey || null,
          model: config.model || existing.model,
          baseUrl: config.baseUrl || existing.baseUrl,
          enabled: config.enabled !== undefined ? config.enabled : existing.enabled
        });

        // Update state
        setSettings(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [id]: {
              ...existing,
              ...config
            }
          }
        }));

        // Update enabled providers list
        if (config.enabled !== undefined) {
          setSettings(prev => ({
            ...prev,
            enabledProviders: config.enabled
              ? [...prev.enabledProviders, id]
              : prev.enabledProviders.filter(p => p !== id)
          }));
        }
      } catch (error) {
        console.error("Failed to update provider:", error);
        throw error;
      }
    },
    [currentProfile, settings.providers, encryptedKeys, storageProvider]
  );

  const toggleProvider = useCallback(
    async (id: ExtendedProviderId) => {
      const provider = settings.providers[id];
      if (!provider) throw new Error(`Provider ${id} not found`);

      await updateProvider(id, { enabled: !provider.enabled });
    },
    [settings.providers, updateProvider]
  );

  const getDecryptedApiKey = useCallback(
    async (id: ExtendedProviderId): Promise<string> => {
      const encrypted = encryptedKeys[id];
      if (!encrypted) return settings.providers[id]?.apiKey || "";

      try {
        return await decrypt(encrypted);
      } catch (error) {
        console.error("Failed to decrypt API key:", error);
        return "";
      }
    },
    [encryptedKeys, settings.providers]
  );

  const saveSettings = useCallback(async () => {
    // Settings are auto-saved in updateProvider
    // This method is kept for backward compatibility
    console.log("Settings are automatically saved");
  }, []);

  const deleteProvider = async (id: ExtendedProviderId) => {
    if (!currentProfile) throw new Error("No current profile");

    try {
      // Delete provider config from storage
      await storageProvider.deleteProviderConfig(`${currentProfile.id}:${id}`);

      // Update local state
      setSettings(prev => {
        const newProviders = { ...prev.providers };
        delete newProviders[id];

        const newEnabledProviders = prev.enabledProviders.filter(p => p !== id);

        return {
          ...prev,
          providers: newProviders,
          enabledProviders: newEnabledProviders
        };
      });

      // Clear encrypted key
      setEncryptedKeys(prev => {
        const newKeys = { ...prev };
        delete newKeys[id];
        return newKeys;
      });

      // Reload profiles with providers to update counts
      await loadProfilesWithProviders();
    } catch (error) {
      console.error("Failed to delete provider:", error);
      throw error;
    }
  };

  const createCustomProvider = async (input: CustomProviderInput) => {
    if (!currentProfile) throw new Error("No current profile");

    try {
      const providerId = `custom-${crypto.randomUUID()}` as ExtendedProviderId;

      // Create provider config
      await storageProvider.saveProviderConfig({
        profileId: currentProfile.id,
        providerId,
        providerType: "custom",
        apiKey: null,
        model: input.models[0] || "",
        baseUrl: input.baseUrl,
        enabled: false,
        customName: input.name,
        customModels: input.models
      });

      // Reload providers
      await loadProviderConfigs(currentProfile.id);
      await loadProfilesWithProviders();
    } catch (error) {
      console.error("Failed to create custom provider:", error);
      throw error;
    }
  };

  return (
    <AISettingsContext.Provider
      value={{
        // Profile management
        currentProfile,
        profiles,
        profilesWithProviders,
        createProfile,
        updateProfile,
        deleteProfile,
        switchProfile,

        // Provider management
        settings,
        isLoading,
        addProvider,
        updateProvider,
        toggleProvider,
        deleteProvider,
        getDecryptedApiKey,
        saveSettings,

        // Custom provider creation
        createCustomProvider,

        // Fallback mode
        isFallbackMode
      }}
    >
      {children}
    </AISettingsContext.Provider>
  )
}

export function useAISettings(): AISettingsContextType {
  const context = useContext(AISettingsContext)
  if (context === undefined) {
    throw new Error("useAISettings must be used within an AISettingsProvider")
  }
  return context
}