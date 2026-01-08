# System Architecture

## Overview

The codelessshipmore application is built using a modern, modular architecture that prioritizes scalability, maintainability, and security. This document provides a comprehensive overview of the system architecture, including component relationships, data flow, and design patterns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Home      │  │  Settings  │  │  Features   │             │
│  │   Page      │  │  Panel      │  │  Pages      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Component Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   shadcn/ui │  │  Features  │  │   Settings │             │
│  │  Components │  │  Components│  │  Components│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Context & Hooks                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ AISettings  │  │   Auth      │  │   Custom   │             │
│  │  Context    │  │  Context    │  │   Hooks     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   AI        │  │   Storage   │  │   Feature  │             │
│  │  Providers  │  │  Providers  │  │   Utils    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  localStorage│  │  sessionStorage│  │  Encrypted  │             │
│  │  (Profiles) │  │   (Auth)    │  │  (API Keys) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Core Architectural Patterns

### 1. Profile-First Architecture

The application organizes AI providers into isolated profiles, allowing users to separate work and personal configurations.

```
User Profile Structure:
┌─────────────────────────────────────────────────────────┐
│                    Profile "Work"                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   OpenAI     │  │  Anthropic  │  │  Custom     │     │
│  │   Provider   │  │   Provider  │  │  Endpoint   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│          │               │               │              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ API Key (enc)││ API Key (enc)││ API Key (enc)│     │
│  │ Models: gpt-4││ Models: claude││ Custom URL   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Key Components**:
- **ProfileRecord**: Stores profile metadata and configuration
- **ProviderConfigRecord**: Individual provider settings
- **Composite Key Pattern**: `${profileId}:${providerId}` for storage

### 2. Abstract Storage Pattern

The storage layer uses an abstraction pattern to enable future backend changes while maintaining a consistent interface.

```typescript
// Abstract Base Class
abstract class StorageProvider {
  abstract setItem(key: string, value: string): Promise<void>
  abstract getItem(key: string): Promise<string | null>
  abstract removeItem(key: string): Promise<void>
  abstract getAllKeys(): Promise<string[]>
}

// Concrete Implementation
class LocalStorageProvider extends StorageProvider {
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }

  // ... other implementations
}
```

**Storage Structure**:
```
localStorage Schema:
┌─────────────────────────┐
│      ai-profiles        │  // Array of ProfileRecord
├─────────────────────────┤
│  ai-providers:work:openai │  // ProviderConfigRecord
│  ai-providers:work:anthropic│ // ProviderConfigRecord
│  ai-providers:personal:gemini│ // ProviderConfigRecord
├─────────────────────────┤
│      ai-metadata       │  // App metadata (schema version)
└─────────────────────────┘
```

### 3. Provider Abstraction Layer

The AI integration layer provides a unified interface to multiple AI providers through a common abstraction.

```typescript
interface AIProvider {
  name: string
  baseUrl: string
  models: Model[]
  authenticate(): Promise<string>
  generate(prompt: string, options: GenerateOptions): Promise<GenerateResult>
  chat(messages: Message[], options: ChatOptions): Promise<ChatResult>
  streamGenerate(prompt: string, options: GenerateOptions): AsyncIterable<StreamChunk>
}
```

**Provider Implementations**:
1. **OpenAI Provider**: REST API with gpt-3.5, gpt-4, gpt-4o
2. **Anthropic Provider**: Anthropic API with Claude models
3. **Gemini Provider**: Google AI Studio integration
4. **Cerebras Provider**: Cerebras Cloud API
5. **Custom Provider**: OpenAI-compatible endpoints

### 4. Context-Driven State Management

The application uses React Context for centralized state management with custom hooks for component access.

```typescript
// Context Definition
const AISettingsContext = createContext<AISettingsContextType | null>(null)

// Custom Hook
export function useAI() {
  const context = useContext(AISettingsContext)
  if (!context) {
    throw new Error('useAI must be used within AISettingsProvider')
  }
  return context
}

// Component Usage
function MyComponent() {
  const { generate, isLoading, error } = useAI()

  const handleGenerate = async () => {
    const result = await generate('Prompt text')
    // Handle result
  }
}
```

## Data Flow Architecture

### 1. User Interaction Flow

```
User Action → Component Event → Hook Call → Context Update → Storage Operation → UI Update
```

**Example Flow - AI Generation**:
1. User clicks "Enhance" in Prompt Enhancer
2. Component calls `useAI().generate(prompt)`
3. Hook queries active profile from context
4. Context retrieves encrypted API key from storage
5. Hook calls AI provider with decrypted credentials
6. Provider returns streaming response
7. Hook updates loading state and results
8. Component displays enhanced prompt

### 2. Authentication Flow

```
Passcode Input → Hash → Rate Limit Check → Session Storage → Auth Context → Route Protection
```

**Security Layers**:
- Client-side SHA-256 hashing
- Rate limiting (5 attempts/60 seconds)
- Session-based authentication
- Protected routes for sensitive features

### 3. Storage Migration Flow

```
Detect IndexedDB → Migrate Data → Validate Schema → Update localStorage → Cleanup Old Storage
```

**Migration Process**:
1. Application starts, detects old IndexedDB storage
2. Reads all profile and provider data
3. Encrypts API keys with new AES-GCM scheme
4. Stores data in localStorage with new schema
5. Removes old IndexedDB data
6. Updates metadata to prevent re-migration

## Component Architecture

### 1. Feature Components

Each feature follows a consistent pattern with separation of concerns:

```
Feature Page (route)
├── Feature Header (title, description)
├── Feature Controls (inputs, buttons)
├── Feature Display (results, output)
└── Feature Settings (configuration)
```

**Example: JSON Viewer**
```
json-viewer/page.tsx
├── JsonViewerHeader.tsx (title, description)
├── JsonControls.tsx (input, format button)
├── JsonTreeView.tsx (interactive tree view)
└── JsonSettings.tsx (theme, indentation)
```

### 2. Settings Components

The settings UI is organized hierarchically:

```
Settings Panel
├── Profile Management
│   ├── Profile List (profiles overview)
│   ├── Profile Creation (add new profile)
│   └── Profile Configuration (edit profile)
├── Provider Management
│   ├── Provider List (providers in profile)
│   ├── Provider Configuration (add/edit provider)
│   └── Provider Testing (connection test)
└── Global Settings
    ├── Theme Preferences
    ├── Export/Import
    └── About
```

### 3. UI Component Library

The application uses shadcn/ui components with custom extensions:

```
Base Components (shadcn/ui)
├── Button
├── Input
├── Select
├── Dialog
├── Card
└── Sidebar

Custom Components
├── ProviderCard (enhanced for AI providers)
├── ProfileListItem (with management actions)
├── JsonTree (custom JSON visualization)
└── CodeEditor (with syntax highlighting)
```

## Security Architecture

### 1. Data Encryption

**API Key Encryption**:
- Algorithm: AES-GCM 256-bit
- Key Derivation: Web Crypto API with PBKDF2
- Storage: Encrypted strings in localStorage
- Decryption: On-demand via `getDecryptedApiKey()`

```typescript
// Encryption Flow
const encryptKey = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
)

const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: iv },
  encryptKey,
  encoder.encode(apiKey)
)
```

### 2. Authentication Security

**Passcode Handling**:
- SHA-256 hashing with salt
- Client-side only processing
- No server-side authentication
- Rate limiting with sliding window

```typescript
// Authentication Flow
const hashedPasscode = await sha256(passcode + salt)
const storedHash = sessionStorage.getItem('passcode_hash')
if (hashedPasscode === storedHash) {
  // Authentication successful
}
```

### 3. Input Validation

**Validation Layers**:
1. TypeScript type checking
2. Runtime validation with Zod schemas
3. Sanitization before storage
4. Output encoding for XSS prevention

## Performance Architecture

### 1. Optimization Strategies

**Code Splitting**:
- Route-based splitting with Next.js
- Feature lazy loading
- Vendor chunk optimization

**Memoization**:
- React.memo for component equality
- useMemo for expensive computations
- useCallback for stable function references

**Virtualization**:
- Large JSON trees virtualized
- Scroll performance optimization
- Intersection Observer for lazy loading

### 2. Caching Strategy

**Storage Caching**:
- In-memory cache for frequently accessed data
- localStorage persistence for profiles
- Cache invalidation on updates

**API Caching**:
- In-memory cache for AI model lists
- Request deduplication
- Stale-while-revalidate pattern

## Error Handling Architecture

### 1. Error Boundaries

**Boundary Structure**:
- Root error boundary for entire app
- Feature-specific boundaries
- Graceful degradation for non-critical features

### 2. Error Classification

**Error Types**:
1. **Network Errors**: Retriable with exponential backoff
2. **Authentication Errors**: Clear user guidance
3. **Validation Errors**: Inline field validation
4. **Provider Errors**: Fallback to alternative providers

### 3. User Experience

**Error States**:
- Loading spinners for async operations
- Error messages with actionable solutions
- Retry mechanisms for transient failures
- Offline mode detection

## Monitoring and Analytics

### 1. Performance Monitoring

**Metrics Tracked**:
- Page load times
- Component render performance
- AI response times
- Error rates

### 2. Error Tracking

**Implementation**:
- Client-side error logging
- Error boundary capture
- User session tracking
- Performance metrics

## Deployment Architecture

### 1. Build Process

**Build Pipeline**:
```bash
bun install          # Dependencies
bun run lint          # Code quality
bun run test          # Test suite
bun run build         # Production build
bun run start         # Production server
```

### 2. Environment Configuration

**Development**:
- Hot reload enabled
- Debug logging active
- Mock API responses
- Local storage only

**Production**:
- Optimized builds
- Error monitoring
- Caching enabled
- Minified assets

## Future Architecture Extensions

### 1. Microservices Ready

The abstraction layers enable future migration to:
- Backend service for user management
- API gateway for AI provider aggregation
- Database for persistent storage
- CDN for asset delivery

### 2. Plugin Architecture

The modular design supports:
- Feature plugins for new utilities
- Provider plugins for AI services
- Theme plugins for UI customization
- Extension points for custom functionality

### 3. Scalability Considerations

Current architecture supports:
- Horizontal scaling for AI requests
- Load balancing for multiple instances
- Database sharding for user data
- Caching layers for performance

## Conclusion

The codelessshipmore architecture demonstrates a modern, scalable approach to building developer tools with AI integration. The combination of React Context for state management, abstract storage patterns for flexibility, and a robust security model creates a solid foundation for current and future feature development. The modular design ensures maintainability while the performance optimizations provide a smooth user experience.