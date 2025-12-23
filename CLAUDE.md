# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` instead of npm, yarn, or pnpm for all package management and script execution.

## Development Commands

- **Dev server**: `bun run dev` (runs on http://localhost:3001)
- **Build**: `bun run build`
- **Lint**: `bun run lint`
- **Start production**: `bun run start`

## Architecture Overview

### Stack
- **Framework**: Next.js 16 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **AI Integration**: Vercel AI SDK with multi-provider support
- **State Management**: React Context API (`AISettingsContext`)

### Key Architectural Patterns

#### 1. Profile-Based AI Provider Management
The app uses a profile-first architecture where users organize AI providers into profiles (Work, Personal, etc.):

- **Profiles**: Isolated containers for provider configurations
- **Providers**: OpenAI, Anthropic, Google Gemini, Cerebras, and custom OpenAI-compatible endpoints
- **Storage**: localStorage with AES-GCM encryption for API keys
- **Context**: `AISettingsContext` (`src/contexts/ai-settings-context.tsx`) manages all state

#### 2. Storage Layer
Located in `src/lib/storage/`:

- **Abstract Pattern**: `StorageProvider` base class for flexibility
- **Implementation**: `LocalStorageProvider` with encrypted API keys
- **Migration**: Automatic migration from IndexedDB to localStorage
- **Data Structure**: Flat key-value with composite keys (`profile-id:provider-id`)

Storage operations:
```typescript
// Profile operations
createProfile(input: CreateProfileInput): Promise<ProfileRecord>
getAllProfiles(): Promise<ProfileRecord[]>
updateProfile(id: string, data: Partial<ProfileRecord>): Promise<ProfileRecord>
deleteProfile(id: string): Promise<void>

// Provider operations
saveProviderConfig(config: ProviderConfigInput): Promise<ProviderConfigRecord>
getProviderConfigsByProfile(profileId: string): Promise<ProviderConfigRecord[]>
```

#### 3. AI Integration Hook
`useAI()` hook (`src/hooks/use-ai.ts`) provides:

- **Methods**: `generate()`, `chat()`, `streamGenerate()`
- **Provider Selection**: Automatic or explicit provider selection
- **Multi-Provider Support**: Works with built-in and custom providers
- **Error Handling**: Centralized loading and error states

Usage:
```typescript
const { generate, chat, streamGenerate, isLoading, error } = useAI()
// Or specify provider: useAI({ providerId: 'openai' })
```

#### 4. Encryption System
`src/lib/ai/encryption.ts` handles API key security:

- **Algorithm**: AES-GCM (256-bit)
- **Key Derivation**: Web Crypto API
- **Storage**: Encrypted strings in localStorage
- **Decryption**: On-demand via `getDecryptedApiKey()`

### File Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── enhance-prompt/           # AI prompt enhancement feature
│   ├── json-viewer/              # JSON visualization tool
│   ├── properties-converter/     # Properties file converter
│   ├── record-protobuf/          # Protobuf record tool
│   ├── settings/                 # AI provider settings UI
│   └── sql-placeholder/          # SQL placeholder tool
├── components/
│   ├── features/                 # Feature-specific components
│   ├── settings/                 # AI settings components
│   │   ├── profile-list.tsx      # Profile list view
│   │   ├── profile-configuration.tsx  # Provider config UI
│   │   ├── provider-card.tsx     # Individual provider card
│   │   └── provider-list-view.tsx # Provider list display
│   └── ui/                       # shadcn/ui components
├── contexts/
│   ├── ai-settings-context.tsx   # Central AI settings state
│   └── auth-context.tsx          # Authentication context
├── hooks/
│   └── use-ai.ts                 # AI integration hook
└── lib/
    ├── ai/                       # AI utilities
    │   ├── encryption.ts         # API key encryption
    │   ├── fetch-models.ts       # Model fetching utilities
    │   ├── providers.ts          # Provider definitions
    │   └── test-connection.ts    # Connection testing
    └── storage/                  # Storage layer
        ├── storage-provider.ts   # Abstract base class
        ├── local-storage-provider.ts  # localStorage implementation
        ├── local-storage-migration.ts # Migration logic
        └── types.ts              # Storage type definitions
```

## Path Aliases

Use `@/*` to import from `src/`:
```typescript
import { useAI } from '@/hooks/use-ai'
import { AISettingsProvider } from '@/contexts/ai-settings-context'
```

## Important Conventions

### 1. AI Provider Integration
When adding new AI providers or features:
- Add provider definition to `src/lib/ai/providers.ts`
- Update `useAI()` hook's provider switch statement
- Ensure encryption for API keys
- Add to `AISettingsContext` if needed

### 2. Storage Operations
- Always use the storage provider abstraction
- Never store API keys in plain text
- Profile IDs must be unique across the system
- Composite keys format: `${profileId}:${providerId}`

### 3. Context Usage
The app uses `AISettingsProvider` wrapper in `src/app/layout.tsx`. All AI-related components must be inside this provider to access:
- Current profile and profile list
- Provider configurations
- Profile/provider CRUD operations

### 4. Component Development
- UI components use shadcn/ui patterns (Radix UI + Tailwind)
- Feature components live in `src/components/features/`
- Settings components in `src/components/settings/`
- Always use client components (`"use client"`) for AI hooks

## Security Considerations

- **API Keys**: Always encrypt before storing (use `src/lib/ai/encryption.ts`)
- **Validation**: Validate all user inputs for provider configurations
- **Client-Side Only**: All storage is client-side (no server persistence)
- **Private Browsing**: App gracefully handles localStorage unavailability

## Migration & Backward Compatibility

The app includes automatic migration from IndexedDB to localStorage. See `src/lib/storage/local-storage-migration.ts` for details. Migration runs automatically on first load with existing IndexedDB data.
