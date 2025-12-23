# AI Settings Codebase Map
**Date**: 2025-12-22
**Purpose**: Complete file mapping for multi-profile IndexedDB migration

## Summary
Found 19 core files related to AI settings across contexts, hooks, components, utilities, and pages.

---

## 1. Core Context & State Management

### `/src/contexts/ai-settings-context.tsx` (195 lines)
**Description**: Main AI settings context providing state management for all providers

**Key Exports**:
- `AISettingsContext` - React context
- `AISettingsProvider` - Context provider component
- `useAISettings()` - Hook to access AI settings

**Key Functions**:
- `loadSettings()` - Loads settings from localStorage
- `updateProvider()` - Updates individual provider config
- `setActiveProvider()` - Sets the active AI provider
- `getDecryptedApiKey()` - Decrypts and returns API key
- `saveSettings()` - Saves encrypted settings to localStorage

**State Structure**:
- `settings: AISettings` - Current settings object
- `encryptedKeys: Record<ProviderId, EncryptedData | null>` - Encrypted API keys
- `isLoading: boolean` - Loading state

**Storage**:
- Uses `localStorage` with key `"ai_settings"`
- Stores `StoredSettings` interface with encrypted API keys

**Dependencies**:
- `@/lib/ai/providers` (types)
- `@/lib/ai/encryption` (encrypt/decrypt)

---

## 2. Provider Definitions & Types

### `/src/lib/ai/providers.ts` (135 lines)
**Description**: Provider definitions, types, and default settings

**Key Exports**:
- `ProviderId` - Type: `"openai" | "anthropic" | "google" | "anthropic-custom" | "cerebras"`
- `ProviderDefinition` - Interface for provider metadata
- `PROVIDERS` - Record of all provider definitions
- `PROVIDER_LIST` - Array of provider definitions
- `ProviderConfig` - Interface for provider configuration
- `AISettings` - Interface for complete settings structure
- `DEFAULT_SETTINGS` - Default settings object

**Provider Details**:
- OpenAI: Supports custom endpoints, models: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
- Anthropic: Fixed endpoint, models: claude-sonnet-4, claude-3.5-sonnet, claude-opus, claude-haiku
- Google: Fixed endpoint, models: gemini-2.0-flash-exp, gemini-1.5-pro/flash/flash-8b
- Anthropic Custom: Custom endpoints for Claude
- Cerebras: Fixed endpoint (https://api.cerebras.ai/v1), models: llama-3.3-70b, llama3.1-70b/8b, deepseek-r1-distill-llama-70b

**Dependencies**: None (pure types and data)

---

## 3. Storage & Encryption

### `/src/lib/ai/encryption.ts` (83 lines)
**Description**: Encryption utilities for API keys using Web Crypto API

**Key Exports**:
- `EncryptedData` - Interface: `{ iv: string, data: string }`
- `encrypt(plaintext: string)` - Encrypts string to EncryptedData
- `decrypt(encrypted: EncryptedData)` - Decrypts EncryptedData to string
- `encryptAndStore(key, value)` - Encrypts and stores in localStorage
- `retrieveAndDecrypt(key)` - Retrieves and decrypts from localStorage

**Implementation**:
- Uses AES-GCM encryption
- Static encryption key: `"codelessshipmore-ai-settings-v1"` padded to 32 bytes
- Generates random IV for each encryption
- Base64 encoding for storage

**Dependencies**: None (uses native Web Crypto API)

**Security Note**: Uses fixed encryption key (not ideal for production)

---

## 4. AI Hooks

### `/src/hooks/use-ai.ts` (176 lines)
**Description**: Hook for AI operations (generation, chat, streaming)

**Key Exports**:
- `useAI(options?: { providerId?: ProviderId })`

**Returns**:
- `generate(opts)` - Generate text from prompt
- `chat(opts)` - Chat with messages
- `streamGenerate(opts)` - Streaming text generation
- `isLoading: boolean`
- `error: string | null`
- `activeProvider: ProviderId | null`
- `isConfigured: boolean`

**Key Functions**:
- `getProvider()` - Creates AI SDK provider instance based on config
- Supports all 5 providers with appropriate SDKs

**Dependencies**:
- `@ai-sdk/openai`
- `@ai-sdk/openai-compatible`
- `@ai-sdk/anthropic`
- `@ai-sdk/google`
- `ai` (Vercel AI SDK)
- `@/contexts/ai-settings-context`
- `@/lib/ai/providers`

---

## 5. AI Utilities

### `/src/lib/ai/test-connection.ts` (88 lines)
**Description**: Test AI provider connections

**Key Exports**:
- `TestResult` - Interface: `{ success: boolean, message: string, latencyMs?: number }`
- `testConnection(providerId, config)` - Tests provider connection

**Implementation**:
- Creates provider instance
- Sends test prompt: "Say 'ok' in one word."
- Measures latency
- Returns success/failure with message

**Dependencies**:
- Same SDK dependencies as `use-ai.ts`
- `@/lib/ai/providers`

### `/src/lib/ai/fetch-models.ts` (71 lines)
**Description**: Fetch available models from OpenAI-compatible endpoints

**Key Exports**:
- `ModelInfo` - Interface for model metadata
- `ModelsResponse` - Interface for API response
- `FetchModelsResult` - Interface: `{ success: boolean, models: string[], message: string }`
- `fetchModels(baseUrl, apiKey)` - Fetches models from endpoint

**Implementation**:
- Calls `/models` endpoint (OpenAI-compatible)
- Parses and extracts model IDs
- Returns array of model names

**Dependencies**: None (uses native fetch)

---

## 6. UI Components

### `/src/components/settings/ai-settings.tsx` (70 lines)
**Description**: Main AI settings page component

**Key Features**:
- Renders all provider cards
- Save button with loading state
- Success notification
- Security warning message

**Key Functions**:
- `handleSave()` - Saves settings via context

**Dependencies**:
- `@/contexts/ai-settings-context`
- `@/lib/ai/providers`
- `@/components/ui/button`
- `./provider-card`

### `/src/components/settings/provider-card.tsx` (278 lines)
**Description**: Individual provider configuration card

**Key Features**:
- Enable/disable provider
- Set as active provider
- API key input (masked)
- Custom endpoint configuration
- Model selection
- Test connection button
- Fetch models from endpoint
- Visual feedback for active provider

**State Management**:
- Local state for test results, fetched models
- Updates parent context via `updateProvider()` and `setActiveProvider()`

**Key Functions**:
- `handleTestConnection()` - Tests provider connection
- `handleToggleEnabled()` - Enables/disables provider
- `handleSetActive()` - Sets as active provider
- `handleFetchModels()` - Fetches models from endpoint

**Dependencies**:
- `@/contexts/ai-settings-context`
- `@/lib/ai/providers`
- `@/lib/ai/test-connection`
- `@/lib/ai/fetch-models`
- `@/components/ui/*` (card, button, input, select, label)
- `./api-key-input`

### `/src/components/settings/api-key-input.tsx` (54 lines)
**Description**: Masked API key input with show/hide toggle

**Key Features**:
- Password-style masking with dots
- Eye icon to toggle visibility
- Monospace font for keys

**Props**:
- `value: string`
- `onChange: (value: string) => void`
- `placeholder?: string`
- `disabled?: boolean`

**Dependencies**:
- `@/components/ui/input`
- `@/components/ui/button`
- `@tabler/icons-react`

---

## 7. Pages & Integration

### `/src/app/settings/page.tsx` (30 lines)
**Description**: Settings page route

**Features**:
- Wraps AISettings in AuthGate
- Provides AISettingsProvider
- Page container with title/description

**Dependencies**:
- `@/components/layout/page-container`
- `@/components/auth/auth-gate`
- `@/contexts/ai-settings-context`
- `@/components/settings/ai-settings`

### `/src/app/layout.tsx` (58 lines)
**Description**: Root layout with global providers

**Key Integration**:
- Wraps entire app in `AISettingsProvider` (line 46-50)
- Makes AI settings available throughout app

**Provider Hierarchy**:
```
ThemeProvider
  └─ AuthProvider
      └─ AISettingsProvider
          └─ AppSidebar
              └─ children
```

**Dependencies**:
- `@/contexts/ai-settings-context`
- `@/contexts/auth-context`
- `@/components/theme-provider`
- `@/components/layout/sidebar`

---

## 8. Feature Implementation Examples

### `/src/components/features/enhance-prompt/prompt-enhancer.tsx` (408 lines)
**Description**: AI prompt enhancement feature using AI settings

**Key Usage**:
- Uses `useAI()` hook for generation
- Uses `useAISettings()` for provider selection
- Provider and model selection UI
- Dynamic provider filtering (only shows enabled providers)

**Key Features**:
- Target use case selection
- Output format customization
- Enhancement principles
- Tone selection
- Real-time AI enhancement

**Dependencies**:
- `@/hooks/use-ai`
- `@/contexts/ai-settings-context`
- `@/lib/ai/providers`
- `@/components/ui/*`

---

## 9. Related UI Components

### `/src/components/ui/card.tsx`
Standard shadcn/ui card component used in provider cards

### `/src/components/ui/input.tsx`
Standard shadcn/ui input component used in API key fields

### `/src/components/ui/input-group.tsx`
Input group component for grouped inputs

### `/src/components/ui/button.tsx`
Standard shadcn/ui button component

### `/src/components/ui/select.tsx`
Standard shadcn/ui select component for model selection

### `/src/components/ui/label.tsx`
Standard shadcn/ui label component

### `/src/components/ui/textarea.tsx`
Standard shadcn/ui textarea component

---

## 10. File Dependency Graph

```
Root Layout (app/layout.tsx)
  └─ AISettingsProvider (contexts/ai-settings-context.tsx)
      ├─ providers.ts (types)
      ├─ encryption.ts (storage)
      └─ Used by:
          ├─ Settings Page (app/settings/page.tsx)
          │   └─ AISettings (components/settings/ai-settings.tsx)
          │       └─ ProviderCard (components/settings/provider-card.tsx)
          │           ├─ ApiKeyInput (components/settings/api-key-input.tsx)
          │           ├─ test-connection.ts (utils)
          │           └─ fetch-models.ts (utils)
          │
          └─ Feature Pages
              └─ PromptEnhancer (components/features/enhance-prompt/prompt-enhancer.tsx)
                  └─ useAI (hooks/use-ai.ts)
                      └─ AI SDK providers
```

---

## 11. Storage Schema (Current - localStorage)

### Key: `"ai_settings"`

```typescript
interface StoredSettings {
  providers: Record<ProviderId, {
    id: ProviderId
    baseUrl?: string
    model: string
    enabled: boolean
    apiKey: EncryptedData | null  // { iv: string, data: string }
  }>
  activeProvider: ProviderId | null
}
```

**Example**:
```json
{
  "providers": {
    "openai": {
      "id": "openai",
      "baseUrl": "",
      "model": "gpt-4o-mini",
      "enabled": true,
      "apiKey": {
        "iv": "base64_encoded_iv",
        "data": "base64_encoded_encrypted_key"
      }
    },
    "anthropic": { ... }
  },
  "activeProvider": "openai"
}
```

---

## 12. Test Files

**Status**: No test files found for AI settings functionality

**Missing Test Coverage**:
- `contexts/ai-settings-context.test.tsx`
- `hooks/use-ai.test.ts`
- `lib/ai/encryption.test.ts`
- `lib/ai/test-connection.test.ts`
- `lib/ai/fetch-models.test.ts`
- `components/settings/provider-card.test.tsx`

---

## 13. Migration Considerations for IndexedDB Multi-Profile

### Current Architecture Analysis

**Strengths**:
- Well-separated concerns (context, utilities, components)
- Type-safe with TypeScript
- Encrypted storage for API keys
- Flexible provider system

**Limitations**:
- localStorage-based (size limits, no async)
- Single profile only
- No profile metadata (names, creation dates)
- No profile switching UI
- No import/export functionality

### Required Changes for Multi-Profile Migration

#### New Files Needed:
1. `src/lib/storage/indexeddb.ts` - IndexedDB wrapper
2. `src/lib/storage/profile-manager.ts` - Profile CRUD operations
3. `src/contexts/profile-context.tsx` - Profile state management
4. `src/components/settings/profile-selector.tsx` - Profile UI
5. `src/components/settings/profile-manager.tsx` - Create/delete/rename profiles

#### Files Requiring Modification:
1. `src/contexts/ai-settings-context.tsx`
   - Replace localStorage with IndexedDB
   - Add profile ID parameter
   - Load settings for specific profile
   - Save to profile-specific record

2. `src/lib/ai/providers.ts`
   - Add profile-specific types
   - Profile metadata interface

3. `src/components/settings/ai-settings.tsx`
   - Add profile selector
   - Profile-aware save/load

4. `src/app/settings/page.tsx`
   - Wrap in ProfileProvider
   - Add profile management UI

#### New Types Required:
```typescript
interface Profile {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  isDefault: boolean
}

interface ProfileSettings {
  profileId: string
  settings: AISettings
}
```

#### IndexedDB Schema:
```typescript
Database: "codelessshipmore"
Version: 1

Object Stores:
  1. "profiles"
     - keyPath: "id"
     - indexes: none
     
  2. "settings"
     - keyPath: "profileId"
     - indexes: none
```

---

## 14. Critical Files Summary

**Must Modify for Migration**:
1. `src/contexts/ai-settings-context.tsx` - Core state management
2. `src/components/settings/ai-settings.tsx` - Main settings UI
3. `src/app/settings/page.tsx` - Settings page integration

**Create New**:
1. IndexedDB storage layer
2. Profile management context
3. Profile UI components

**Keep Unchanged**:
1. `src/lib/ai/providers.ts` - Provider definitions (minimal changes)
2. `src/lib/ai/encryption.ts` - Encryption utilities (same encryption)
3. `src/hooks/use-ai.ts` - AI operations hook (profile-agnostic)
4. `src/components/settings/provider-card.tsx` - Provider card UI (profile-agnostic)
5. `src/components/settings/api-key-input.tsx` - API key input (unchanged)
6. `src/lib/ai/test-connection.ts` - Connection testing (unchanged)
7. `src/lib/ai/fetch-models.ts` - Model fetching (unchanged)

---

## 15. Unresolved Questions

1. **Profile Export Format**: JSON, encrypted binary, or custom format?
2. **Default Profile Behavior**: Auto-create on first load or require manual creation?
3. **Profile Deletion**: Soft delete or hard delete? Keep history?
4. **Profile Limits**: Maximum number of profiles per user?
5. **Profile Switching**: Require save before switch or auto-save?
6. **Migration Strategy**: Auto-migrate localStorage data to first profile?
7. **Profile Names**: Unique constraint or allow duplicates?
8. **Active Profile Persistence**: Store in localStorage or IndexedDB?

---

**Total Files Found**: 19 core files
**Lines of Code**: ~2,100 lines across AI settings functionality
**Test Coverage**: 0% (no tests found)
