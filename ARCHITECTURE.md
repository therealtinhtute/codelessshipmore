# Architecture Documentation

## Overview

CodelessShipMore is a Next.js application that provides AI-powered features with a focus on multi-profile AI provider management. The application uses localStorage for client-side data storage with encryption for sensitive information.

## Core Architecture

### Frontend Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **State Management**: React Context API with hooks
- **Build Tool**: Turbopack

### AI Integration
- **AI SDK**: Vercel AI SDK
- **Providers**: OpenAI, Anthropic, Google Gemini, Custom OpenAI-compatible
- **Encryption**: AES-GCM for API keys

## Storage Architecture

### localStorage Implementation

We migrated from IndexedDB to localStorage for simplicity and reliability:

#### Data Structure
```typescript
// localStorage keys
{
  "ai-profiles": {
    "profile-id": {
      id: string,
      name: string,
      description?: string,
      createdAt: number,
      updatedAt: number,
      isDefault: boolean
    }
  },
  "ai-providers": {
    "profile-id:provider-id": {
      profileId: string,
      providerId: string,
      providerType: "builtin" | "custom",
      apiKey: "encrypted-string" | null,
      model: string,
      baseUrl?: string,
      enabled: boolean,
      customName?: string,
      customModels?: string[]
    }
  },
  "ai-metadata": {
    "key": {
      key: string,
      value: any,
      updatedAt: number
    }
  }
}
```

### Storage Provider Pattern

```typescript
abstract class StorageProvider {
  // Profile operations
  abstract createProfile(input: CreateProfileInput): Promise<ProfileRecord>
  abstract getProfile(id: string): Promise<ProfileRecord | null>
  abstract getAllProfiles(): Promise<ProfileRecord[]>
  abstract updateProfile(id: string, data: Partial<ProfileRecord>): Promise<ProfileRecord>
  abstract deleteProfile(id: string): Promise<void>

  // Provider operations
  abstract saveProviderConfig(config: ProviderConfigInput): Promise<ProviderConfigRecord>
  abstract getProviderConfigsByProfile(profileId: string): Promise<ProviderConfigRecord[]>

  // Metadata operations
  abstract setMetadata(key: string, value: any): Promise<void>
  abstract getMetadata(key: string): Promise<any>
}
```

## Component Architecture

### AI Settings Context

The `AISettingsContext` provides a centralized state management system for AI settings:

```typescript
interface AISettingsContextType {
  // Profile management
  currentProfile: ProfileRecord | null
  profiles: ProfileRecord[]
  profilesWithProviders: ProfileWithProviders[]
  createProfile: (name: string, description?: string) => Promise<ProfileRecord>
  updateProfile: (id: string, data: Partial<ProfileRecord>) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  switchProfile: (id: string) => Promise<void>

  // Provider management
  settings: ProfileProviderSettings
  addProvider: (providerId: ProviderId) => Promise<void>
  updateProvider: (id: ExtendedProviderId, config: Partial<ProviderConfig>) => Promise<void>
  toggleProvider: (id: ExtendedProviderId) => Promise<void>
  getDecryptedApiKey: (id: ExtendedProviderId) => Promise<string>

  // Custom provider creation
  createCustomProvider: (input: CustomProviderInput) => Promise<void>
}
```

### UI Components

#### Profile Management
- **ProfileList**: Displays all profiles with their configured providers
- **ProfileConfiguration**: Detailed provider configuration for a specific profile
- **ProviderCard**: Individual provider configuration card

#### Settings Flow
1. **Profile List View**: Shows all profiles with provider summaries
2. **Configuration View**: Detailed provider setup for selected profile
3. **Quick Actions**: Fast access to current profile configuration

## Security Architecture

### Encryption
- **Algorithm**: AES-GCM (256-bit)
- **Key Generation**: Web Crypto API
- **Storage**: Encrypted API keys stored in localStorage
- **Decryption**: On-demand when needed

### Data Isolation
- **Profile Separation**: Each profile has isolated provider configurations
- **No Server Storage**: All data remains client-side
- **Encrypted at Rest**: API keys are never stored in plain text

## Migration System

### IndexedDB to localStorage Migration

Automatic migration handles:
- Data format transformation
- API key preservation (encrypted)
- Profile and provider mapping
- Metadata transfer
- Cleanup of old IndexedDB data

### Migration Process
1. Detect IndexedDB data presence
2. Transform data format
3. Migrate to localStorage
4. Validate migration success
5. Clean up IndexedDB (optional)

## Error Handling

### Fallback Mode
When localStorage is unavailable:
- Show user-friendly error message
- Suggest browser compatibility solutions
- Provide alternative paths (non-private browsing)

### Validation
- Input validation for all operations
- Type safety with TypeScript
- Error boundaries around storage operations
- Graceful degradation for edge cases

## Performance Optimizations

### Storage Operations
- Synchronous reads from localStorage
- Batched write operations
- Minimal data serialization overhead
- Efficient data structures

### UI Performance
- Lazy loading of provider configurations
- Debounced save operations
- Optimistic updates where appropriate
- Loading states for async operations

## Browser Compatibility

### Requirements
- Modern browser with localStorage support
- Web Crypto API for encryption
- ES2020+ JavaScript features

### Known Limitations
- Private browsing mode may disable localStorage
- Storage quota limitations (~5-10MB)
- No cross-device synchronization (intentional)

## Future Considerations

### Potential Enhancements
- Cloud sync options (opt-in)
- Import/export functionality
- Advanced provider configurations
- Usage analytics and reporting

### Scalability
- Current architecture supports unlimited profiles and providers
- localStorage quota monitoring
- Data compression for large configurations
- Archival strategies for old data