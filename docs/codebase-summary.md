# Codebase Summary

## Overview
This document provides a comprehensive summary of the codelessshipmore project, a Next.js 16 developer utilities application with AI-powered features and multi-provider support.

## Project Structure

### Core Application Files
- **`/app/layout.tsx`**: Root layout with providers (AISettingsProvider, AuthProvider)
- **`/app/page.tsx`**: Home page showcasing 6 developer tools in a grid layout
- **`/app/**/page.tsx`**: Feature-specific pages for each tool

### Key Directories

#### `/components/`
- **`ui/`**: shadcn/ui components (sidebar, button, input, select, etc.)
- **`features/`**: Feature-specific components:
  - `enhance-prompt/`: Prompt enhancement UI
  - `json-viewer/`: JSON tree view and formatter
  - `properties-converter/`: YAML/Properties/ENV converter
  - `record-protobuf/`: Java record to Protobuf converter
  - `sql-placeholder/`: SQL parameter placeholder tool
- **`settings/`**: AI settings management UI:
  - `ai-settings.tsx`: Main settings panel
  - `profile-list.tsx`: Profile management
  - `profile-configuration.tsx`: Provider configuration
  - `provider-card.tsx`: Individual provider UI
  - `provider-list-view.tsx`: Provider list display
- **`auth/`**: Authentication components (passcode input, rate limiting)
- **`layout/`**: Header, navigation, sidebar components

#### `/contexts/`
- **`ai-settings-context.tsx`**: Central AI settings state management (4,497 tokens)
  - Profile CRUD operations
  - Provider configuration management
  - Active profile state
  - Storage integration
- **`auth-context.tsx`**: Authentication state and passcode handling

#### `/hooks/`
- **`use-ai.ts`**: AI integration hook providing generate(), chat(), streamGenerate() methods

#### `/lib/`
- **`ai/`**: AI utilities:
  - `providers.ts`: Provider definitions (OpenAI, Anthropic, Gemini, Cerebras, custom)
  - `encryption.ts`: AES-GCM encryption for API keys
  - `fetch-models.ts`: Model fetching utilities
  - `test-connection.ts`: Connection testing
- **`storage/`**: Storage layer (3,458 tokens for migration):
  - `storage-provider.ts`: Abstract base class
  - `local-storage-provider.ts`: localStorage implementation
  - `local-storage-migration.ts`: IndexedDB to localStorage migration
  - `types.ts`: Type definitions
- **`auth/`**: Authentication utilities
- Feature-specific utilities in `*-utils.ts` files

## Key Architectural Patterns

### 1. Profile-First AI Provider Management
AI providers are organized into isolated profiles (Work, Personal, etc.):
- Profiles contain multiple provider configurations
- Composite key format: `${profileId}:${providerId}`
- AES-GCM encryption for API keys in localStorage

### 2. Abstract Storage Pattern
- `StorageProvider` base class for flexibility
- `LocalStorageProvider` implementation with singleton pattern
- Automatic migration from IndexedDB to localStorage
- Backup/restore functionality

### 3. React Context Architecture
- `AISettingsContext`: Manages profiles, providers, and CRUD operations
- `AuthProvider`: Handles authentication state and passcode validation

### 4. Hook-Based AI Integration
- `useAI()` hook provides unified interface to all AI providers
- Automatic provider selection or explicit provider specification
- Centralized loading and error states

## AI Provider Support

### Built-in Providers
1. **OpenAI**: GPT-3.5, GPT-4, GPT-4o
2. **Anthropic**: Claude 3 Opus, Sonnet, Haiku
3. **Google Gemini**: Gemini Pro, Gemini Ultra
4. **Cerebras**: Cerebras Inference, Mixtral

### Custom Providers
- OpenAI-compatible endpoints
- Configurable base URL and API key
- Automatic model discovery

## Feature Components Overview

### 1. Prompt Enhancer (`/enhance-prompt`)
- AI-powered prompt improvement
- Configurable parameters (style, length, focus)
- Real-time enhancement with streaming support

### 2. JSON Viewer (`/json-viewer`)
- JSON validation and pretty-printing
- Interactive tree view with expand/collapse
- Syntax highlighting and error detection

### 3. Properties Converter (`/properties-converter`)
- Convert between YAML, Properties, and ENV formats
- Spring @Value support for properties files
- Format validation and transformation

### 4. Record to Protobuf (`/record-protobuf`)
- Java 17 records to Protocol Buffers conversion
- 5 conversion modes (FULL, PARTIAL, CUSTOM, etc.)
- Protobuf schema generation

### 5. SQL Placeholder (`/sql-placeholder`)
- Fill JDBC-style ? placeholders with parameter values
- Support for multiple parameter sets
- SQL formatting and validation

### 6. AI Settings (`/settings`)
- Profile management (create, edit, delete)
- Provider configuration UI
- API key management with encryption
- Connection testing

## Security Implementation

### Authentication
- Passcode-based with SHA-256 hashing
- Rate limiting: 5 attempts per 60 seconds
- sessionStorage for auth state

### Data Protection
- AES-GCM 256-bit encryption for API keys
- No server-side storage of sensitive data
- Client-side only architecture

## Development Commands
- `bun run dev` - Development server (http://localhost:3001)
- `bun run build` - Production build
- `bun run lint` - Linting
- `bun run start` - Production server

## Configuration
- Environment variables in `.env.local`
- Passcode hash: `NEXT_PUBLIC_PASSCODE_HASH`
- API keys stored encrypted in localStorage

## Key Technologies
- **Next.js 16**: App Router, Turbopack
- **TypeScript**: Strict mode enabled
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: Radix UI primitives
- **Vercel AI SDK**: Multi-provider AI integration
- **Bun**: Package manager and runtime

## File Statistics
- Total Files: 90 files
- Total Tokens: 92,737 tokens
- Total Characters: 400,595 chars

## Largest Files by Token Count
1. `src/components/ui/sidebar.tsx` - 5,443 tokens
2. `src/contexts/ai-settings-context.tsx` - 4,497 tokens
3. `src/components/features/enhance-prompt/prompt-enhancer.tsx` - 3,502 tokens
4. `src/lib/storage/local-storage-migration.ts` - 3,458 tokens
5. `src/components/settings/provider-list-view.tsx` - 3,444 tokens