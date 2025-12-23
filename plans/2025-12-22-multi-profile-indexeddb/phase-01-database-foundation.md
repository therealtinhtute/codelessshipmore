# Phase 01: Database Foundation

## Overview

**Date:** 2025-12-22
**Priority:** Critical
**Status:** In Progress
**Estimated Time:** 180 minutes
**Dependencies:** None

Build IndexedDB infrastructure with TypeScript wrapper, migration logic, and versioning system.

## Context Links

- Research: [IndexedDB Best Practices](../reports/researcher-251222-indexeddb-multi-provider-storage.md)
- Research: [TypeScript Wrappers](../reports/researcher-251222-indexeddb-typescript.md)
- Codebase: [AI Settings Context](../../src/contexts/ai-settings-context.tsx)
- Codebase: [Encryption Utils](../../src/lib/ai/encryption.ts)
- Codebase: [Provider Types](../../src/lib/ai/providers.ts)

## Key Insights

1. **Library Choice:** Use `idb` (1.2KB) for minimal overhead with full TypeScript support
2. **Schema Pattern:** Composite key `[profileId, providerId]` for natural multi-tenancy
3. **Migration:** Zero-downtime with backup retention (7-day rollback window)
4. **Security:** Maintain existing AES-GCM encryption, ArrayBuffer storage supported
5. **Performance:** Index-based queries 10-100x faster than JS filtering

## Requirements

### Functional
- Create IndexedDB database "ai-settings-db" with 3 stores
- Migrate existing localStorage data to IndexedDB
- Support version upgrades with migration runner
- Maintain encryption compatibility

### Non-Functional
- Migration completes in <2s for typical dataset
- Support quota >10MB
- Handle IndexedDB unavailability gracefully
- Zero data loss during migration

## Architecture

### Database Schema v1

```typescript
// Store: profiles
interface ProfileRecord {
  id: string              // UUID, primary key
  name: string            // max 50 chars
  description?: string
  createdAt: number
  updatedAt: number
  isDefault: boolean
}

// Store: provider_configs
interface ProviderConfigRecord {
  id: string                      // UUID, primary key
  profileId: string               // FK to profiles
  providerId: string              // "openai", "custom-xyz"
  providerType: "builtin" | "custom"

  // Config
  apiKey: EncryptedData | null
  model: string
  baseUrl?: string
  enabled: boolean

  // Custom providers
  customName?: string
  customModels?: string[]

  createdAt: number
  updatedAt: number
}

// Store: app_metadata
interface AppMetadata {
  key: string     // "schema_version", "active_profile_id"
  value: any
  updatedAt: number
}
```

### Indexes
- `profiles`: by `id` (primary), by `isDefault`
- `provider_configs`: by `id` (primary), by `profileId`, by `[profileId, providerId]`
- `app_metadata`: by `key` (primary)

### Migration Flow

```
1. Check IndexedDB.open("ai-settings-db")
2. Get app_metadata["schema_version"]
3. If null:
   a. Read localStorage["ai_settings"]
   b. Transform to v1 schema
   c. Create default profile
   d. Write provider_configs with profileId
   e. Set schema_version = 1
4. If schema_version < CURRENT_VERSION:
   a. Run migrations sequentially
   b. Update schema_version
5. Return DB instance
```

## Related Code Files

**To Create:**
- `/src/lib/storage/indexeddb.ts` - IndexedDB wrapper
- `/src/lib/storage/migration.ts` - Migration logic
- `/src/lib/storage/types.ts` - Storage types

**To Modify:**
- None yet (isolated from existing code)

**To Reference:**
- `/src/contexts/ai-settings-context.tsx` (line 19: STORAGE_KEY)
- `/src/lib/ai/encryption.ts` (encryption/decryption functions)
- `/src/lib/ai/providers.ts` (ProviderConfig type)

## Implementation Steps

### 1. Install Dependencies (5 min)
```bash
bun add idb
bun add -d @types/node fake-indexeddb
```

### 2. Create Storage Types (15 min)
Create `/src/lib/storage/types.ts`:
- Define ProfileRecord, ProviderConfigRecord, AppMetadata
- Define DBSchema for idb
- Export EncryptedData from encryption.ts

### 3. Create IndexedDB Wrapper (60 min)
Create `/src/lib/storage/indexeddb.ts`:
- Initialize database with stores and indexes
- Implement profile CRUD operations
- Implement provider config CRUD operations
- Implement metadata get/set
- Add error handling and quota checks

### 4. Create Migration Logic (45 min)
Create `/src/lib/storage/migration.ts`:
- Read localStorage["ai_settings"]
- Transform to ProfileRecord + ProviderConfigRecord[]
- Handle encrypted API keys (maintain format)
- Validate data before writing
- Set initial metadata

### 5. Create Version Management (20 min)
Add to `/src/lib/storage/migration.ts`:
- Migration runner infrastructure
- Version tracking in app_metadata
- Future migration placeholder (v1 → v2)

### 6. Add Quota Monitoring (15 min)
Add to `/src/lib/storage/indexeddb.ts`:
- Check navigator.storage.estimate()
- Warn when >80% quota used
- Graceful degradation on quota exceeded

### 7. Add Fallback Detection (20 min)
Add to `/src/lib/storage/indexeddb.ts`:
- Detect IndexedDB support
- Detect private browsing mode
- Return fallback flag for localStorage mode

## Todo List

- [ ] Install idb and fake-indexeddb
- [ ] Create types.ts with all interfaces
- [ ] Create indexeddb.ts with ProviderDB class
- [ ] Implement profile CRUD operations
- [ ] Implement provider config CRUD operations
- [ ] Implement metadata operations
- [ ] Create migration.ts with migration logic
- [ ] Test migration with sample localStorage data
- [ ] Add version management
- [ ] Add quota monitoring
- [ ] Add fallback detection
- [ ] Write unit tests for ProviderDB
- [ ] Write migration tests
- [ ] Test quota exceeded scenario
- [ ] Test private browsing fallback

## Success Criteria

- [x] ProviderDB class compiles with no TypeScript errors
- [ ] All CRUD operations return correctly typed data
- [ ] Migration transforms localStorage correctly
- [ ] Encrypted API keys work after migration
- [ ] Migration completes in <2s (measured)
- [ ] Quota check returns accurate percentage
- [ ] Fallback detection works in private mode
- [ ] Unit tests pass with >90% coverage

## Risk Assessment

**High Risk:**
- **Data loss during migration** → Keep localStorage backup, validate before delete
- **Encryption incompatibility** → Test with real encrypted keys, maintain exact format

**Medium Risk:**
- **Quota exceeded** → Monitor usage, warn users early, implement cleanup
- **IndexedDB unavailable** → Detect early, fallback to localStorage gracefully

**Low Risk:**
- **Performance regression** → Index-based queries are faster than current approach

## Security Considerations

1. **API Key Protection:**
   - Maintain existing AES-GCM encryption
   - No plaintext keys in IndexedDB
   - Use ArrayBuffer storage (supported)

2. **Input Validation:**
   - Validate profile names (max 50 chars, no special chars)
   - Validate UUIDs before storage
   - Sanitize custom provider URLs

3. **Access Control:**
   - No cross-profile data leakage
   - Validate profileId on all queries

## Next Steps

After Phase 01 completion:
1. Update AISettingsContext to use ProviderDB
2. Add profile state management
3. Build profile selector UI
