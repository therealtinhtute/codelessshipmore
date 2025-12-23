# IndexedDB Multi-Provider Storage Architecture

**Research Date:** 2025-12-22
**Focus:** Production-ready IndexedDB patterns for AI provider management with encrypted credentials

---

## 1. IndexedDB Schema Design Best Practices

### 1.1 Schema Pattern: Multi-Store with Composite Keys

```typescript
// Database structure
interface DBSchema {
  profiles: {
    key: string; // profileId
    value: Profile;
    indexes: { 'byCreatedAt': Date };
  };
  providers: {
    key: [string, string]; // [profileId, providerId] - composite key
    value: ProviderConfig;
    indexes: {
      'byProfile': string;
      'byEnabled': [string, boolean]; // compound index [profileId, enabled]
    };
  };
  metadata: {
    key: string;
    value: MetadataValue;
  };
}

interface Profile {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProviderConfig {
  profileId: string;
  providerId: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
  apiKey: EncryptedData; // encrypted blob
  metadata: Record<string, unknown>;
}
```

**Rationale:**
- Separate stores prevent schema conflicts
- Composite keys enable efficient filtering without secondary indexes
- Metadata store for version tracking and migration flags

### 1.2 Indexing Strategy

```typescript
// Optimal index creation during onupgradeneeded
db.createObjectStore('providers', { keyPath: ['profileId', 'providerId'] });
const providerStore = transaction.objectStore('providers');

// Index only what you query
providerStore.createIndex('byProfile', 'profileId', { unique: false });
providerStore.createIndex('byEnabled', ['profileId', 'enabled'], { unique: false });
```

**Key Principles:**
- Use composite keys over auto-increment when natural keys exist
- Index foreign keys (profileId) for joins
- Compound indexes for common query patterns (profile + enabled)
- AVOID over-indexing - each index = write overhead

### 1.3 Transaction Management

```typescript
class ProviderStore {
  async saveProvider(config: ProviderConfig): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(['providers'], 'readwrite');
    const store = tx.objectStore('providers');

    try {
      await store.put(config);
      await tx.done; // Wait for transaction completion
    } catch (error) {
      // Transaction auto-aborts on error
      if (error.name === 'QuotaExceededError') {
        throw new StorageQuotaError('Storage limit exceeded', error);
      }
      throw new StorageError('Failed to save provider', error);
    }
  }

  // Batch operations in single transaction
  async saveMultiple(configs: ProviderConfig[]): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(['providers'], 'readwrite');
    const store = tx.objectStore('providers');

    await Promise.all(configs.map(config => store.put(config)));
    await tx.done; // Single commit point
  }
}
```

**Best Practices:**
- Always specify transaction scope (stores + mode)
- Batch related operations in single transaction
- Handle specific error types (QuotaExceededError, ConstraintError)
- Use `readonly` mode when possible for performance

### 1.4 Quota Management

```typescript
async function checkStorageQuota(): Promise<QuotaInfo> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { usage: 0, quota: 0, available: 0, usagePercent: 0 };
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;

  return {
    usage,
    quota,
    available: quota - usage,
    usagePercent: (usage / quota) * 100
  };
}

// Monitor before large writes
async function canStoreData(estimatedSize: number): Promise<boolean> {
  const { available } = await checkStorageQuota();
  const SAFETY_MARGIN = 5 * 1024 * 1024; // 5MB buffer
  return available > (estimatedSize + SAFETY_MARGIN);
}
```

**Storage Limits (typical):**
- Chrome/Edge: ~60% of available disk space
- Firefox: 2GB max per origin (can request more)
- Safari: 1GB max, prompts at 200MB
- Use persistent storage API for critical data

---

## 2. Migration Patterns: localStorage → IndexedDB

### 2.1 Zero-Downtime Migration Strategy

```typescript
class StorageMigrator {
  private readonly MIGRATION_FLAG = 'idb_migration_complete';
  private readonly BACKUP_FLAG = 'ls_backup_retained';

  async migrate(): Promise<MigrationResult> {
    // 1. Check if already migrated
    if (this.isMigrationComplete()) {
      return { success: true, alreadyMigrated: true };
    }

    // 2. Load existing localStorage data
    const legacyData = this.loadLegacyData();
    if (!legacyData) {
      this.markMigrationComplete();
      return { success: true, noDataToMigrate: true };
    }

    // 3. Validate data structure
    const validated = this.validateLegacyData(legacyData);
    if (!validated.valid) {
      throw new MigrationError('Invalid legacy data', validated.errors);
    }

    // 4. Transform to new schema
    const transformed = this.transformToNewSchema(legacyData);

    try {
      // 5. Write to IndexedDB in transaction
      await this.writeToIndexedDB(transformed);

      // 6. Verify write success
      const verified = await this.verifyMigration(transformed);
      if (!verified) {
        throw new MigrationError('Verification failed');
      }

      // 7. Keep backup in localStorage for rollback window (7 days)
      localStorage.setItem(this.BACKUP_FLAG, JSON.stringify({
        data: legacyData,
        migratedAt: Date.now()
      }));

      // 8. Mark migration complete
      this.markMigrationComplete();

      return { success: true, recordsMigrated: transformed.length };
    } catch (error) {
      // Rollback: keep localStorage data intact
      console.error('Migration failed, keeping localStorage data', error);
      throw error;
    }
  }

  private isMigrationComplete(): boolean {
    return localStorage.getItem(this.MIGRATION_FLAG) === 'true';
  }

  private markMigrationComplete(): void {
    localStorage.setItem(this.MIGRATION_FLAG, 'true');
  }

  // Clean up backup after retention period
  async cleanupBackup(): Promise<void> {
    const backup = localStorage.getItem(this.BACKUP_FLAG);
    if (!backup) return;

    const { migratedAt } = JSON.parse(backup);
    const RETENTION_DAYS = 7;
    if (Date.now() - migratedAt > RETENTION_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(this.BACKUP_FLAG);
      // Optionally remove migrated keys
      localStorage.removeItem('ai_settings');
    }
  }
}
```

### 2.2 Version Management & Schema Evolution

```typescript
const DB_NAME = 'ai_providers_db';
const CURRENT_VERSION = 3;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, CURRENT_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;
      const transaction = request.transaction!;

      // Version 1: Initial schema
      if (oldVersion < 1) {
        db.createObjectStore('providers', { keyPath: 'id' });
      }

      // Version 2: Add profiles + migrate existing data
      if (oldVersion < 2) {
        const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });

        // Migrate: create default profile for existing providers
        const providerStore = transaction.objectStore('providers');
        const defaultProfile = {
          id: 'default',
          name: 'Default Profile',
          createdAt: new Date()
        };
        profileStore.add(defaultProfile);

        // Add profileId to existing providers
        const cursorRequest = providerStore.openCursor();
        cursorRequest.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result;
          if (cursor) {
            const value = cursor.value;
            value.profileId = 'default';
            cursor.update(value);
            cursor.continue();
          }
        };
      }

      // Version 3: Switch to composite keys
      if (oldVersion < 3) {
        // Cannot modify keyPath on existing store - recreate
        const oldStore = transaction.objectStore('providers');
        const allRecords: ProviderConfig[] = [];

        const cursorRequest = oldStore.openCursor();
        cursorRequest.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result;
          if (cursor) {
            allRecords.push(cursor.value);
            cursor.continue();
          } else {
            // All records collected, recreate store
            db.deleteObjectStore('providers');
            const newStore = db.createObjectStore('providers', {
              keyPath: ['profileId', 'providerId']
            });
            newStore.createIndex('byProfile', 'profileId');

            // Reinsert data
            allRecords.forEach(record => {
              newStore.add({
                ...record,
                providerId: record.id
              });
            });
          }
        };
      }
    };
  });
}
```

### 2.3 Rollback Strategy

```typescript
class MigrationRollback {
  async rollback(): Promise<void> {
    const backup = localStorage.getItem('ls_backup_retained');
    if (!backup) {
      throw new Error('No backup available for rollback');
    }

    const { data } = JSON.parse(backup);

    // 1. Clear IndexedDB
    const db = await openDatabase();
    const tx = db.transaction(['providers', 'profiles'], 'readwrite');
    await tx.objectStore('providers').clear();
    await tx.objectStore('profiles').clear();
    await tx.done;

    // 2. Restore localStorage
    localStorage.setItem('ai_settings', JSON.stringify(data));

    // 3. Clear migration flag
    localStorage.removeItem('idb_migration_complete');

    console.log('Rollback completed - localStorage restored');
  }
}
```

---

## 3. Multi-Provider Architecture Patterns

### 3.1 Profile Isolation Pattern

```typescript
class ProfileManager {
  async switchProfile(profileId: string): Promise<void> {
    const db = await openDatabase();

    // Load only data for active profile
    const tx = db.transaction(['providers'], 'readonly');
    const index = tx.objectStore('providers').index('byProfile');
    const providers = await index.getAll(profileId);

    // Update in-memory state
    this.activeProfile = profileId;
    this.cachedProviders = new Map(
      providers.map(p => [[p.profileId, p.providerId], p])
    );
  }

  // Query scoped to active profile
  async getActiveProviders(): Promise<ProviderConfig[]> {
    const db = await openDatabase();
    const tx = db.transaction(['providers'], 'readonly');
    const index = tx.objectStore('providers').index('byEnabled');

    // Compound index query: [profileId, enabled]
    const range = IDBKeyRange.only([this.activeProfile, true]);
    return await index.getAll(range);
  }
}
```

### 3.2 Custom Provider Extensibility

```typescript
interface ProviderRegistry {
  id: string;
  type: 'builtin' | 'custom';
  schema: JSONSchema; // For validation
  defaults: Partial<ProviderConfig>;
}

class ExtensibleProviderStore {
  private registry = new Map<string, ProviderRegistry>();

  registerProvider(def: ProviderRegistry): void {
    this.registry.set(def.id, def);
  }

  async createProvider(
    profileId: string,
    providerId: string,
    config: unknown
  ): Promise<void> {
    const def = this.registry.get(providerId);
    if (!def) throw new Error(`Unknown provider: ${providerId}`);

    // Validate against schema
    const validated = this.validate(config, def.schema);
    if (!validated.valid) {
      throw new ValidationError(validated.errors);
    }

    const providerConfig: ProviderConfig = {
      profileId,
      providerId,
      ...def.defaults,
      ...config as ProviderConfig
    };

    const db = await openDatabase();
    const tx = db.transaction(['providers'], 'readwrite');
    await tx.objectStore('providers').put(providerConfig);
    await tx.done;
  }
}
```

---

## 4. Performance Optimization

### 4.1 Query Optimization

```typescript
// ❌ BAD: Fetching all then filtering in JS
async getBadProviders(profileId: string): Promise<ProviderConfig[]> {
  const db = await openDatabase();
  const all = await db.getAll('providers');
  return all.filter(p => p.profileId === profileId && p.enabled);
}

// ✅ GOOD: Index-based query
async getGoodProviders(profileId: string): Promise<ProviderConfig[]> {
  const db = await openDatabase();
  const tx = db.transaction(['providers'], 'readonly');
  const index = tx.objectStore('providers').index('byEnabled');
  const range = IDBKeyRange.only([profileId, true]);
  return await index.getAll(range);
}
```

### 4.2 Async Operation Batching

```typescript
class BatchedStore {
  private writeQueue: ProviderConfig[] = [];
  private writeTimer: NodeJS.Timeout | null = null;

  // Debounced batch write
  queueWrite(config: ProviderConfig): void {
    this.writeQueue.push(config);

    if (this.writeTimer) clearTimeout(this.writeTimer);

    this.writeTimer = setTimeout(() => this.flush(), 100);
  }

  private async flush(): Promise<void> {
    if (this.writeQueue.length === 0) return;

    const batch = [...this.writeQueue];
    this.writeQueue = [];

    const db = await openDatabase();
    const tx = db.transaction(['providers'], 'readwrite');
    const store = tx.objectStore('providers');

    await Promise.all(batch.map(config => store.put(config)));
    await tx.done;
  }
}
```

### 4.3 Memory Management

```typescript
class CachedProviderStore {
  private cache = new Map<string, ProviderConfig>();
  private readonly MAX_CACHE_SIZE = 100;

  async getProvider(key: [string, string]): Promise<ProviderConfig | null> {
    const cacheKey = key.join(':');

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Fetch from IndexedDB
    const db = await openDatabase();
    const tx = db.transaction(['providers'], 'readonly');
    const provider = await tx.objectStore('providers').get(key);

    if (provider) {
      // LRU eviction
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(cacheKey, provider);
    }

    return provider || null;
  }

  invalidateCache(key?: [string, string]): void {
    if (key) {
      this.cache.delete(key.join(':'));
    } else {
      this.cache.clear();
    }
  }
}
```

---

## 5. Security Considerations

### 5.1 Encryption Compatibility

```typescript
// Store encryption metadata with data
interface EncryptedData {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
  algorithm: 'AES-GCM';
}

async function encryptApiKey(plaintext: string): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate encryption key from user password
  const password = await getUserPassword(); // Prompt or session-based
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return { ciphertext, iv, salt, algorithm: 'AES-GCM' };
}

// Store in IndexedDB
async function storeEncryptedKey(
  profileId: string,
  providerId: string,
  apiKey: string
): Promise<void> {
  const encrypted = await encryptApiKey(apiKey);

  const db = await openDatabase();
  const tx = db.transaction(['providers'], 'readwrite');
  const store = tx.objectStore('providers');

  const existing = await store.get([profileId, providerId]);
  await store.put({
    ...existing,
    apiKey: encrypted // ArrayBuffer stored directly
  });
  await tx.done;
}
```

### 5.2 Key Derivation for Migration

```typescript
// Maintain encryption when migrating from localStorage
async function migrateEncryptedData(
  legacyEncrypted: EncryptedData,
  newStorageKey: [string, string]
): Promise<void> {
  // 1. Decrypt with old key
  const plaintext = await decrypt(legacyEncrypted);

  // 2. Re-encrypt with same password (different salt/iv)
  const newEncrypted = await encryptApiKey(plaintext);

  // 3. Store in IndexedDB
  await storeEncryptedKey(...newStorageKey, plaintext);

  // Plaintext never persisted, only in memory briefly
}
```

---

## Summary & Recommendations

**Adopt:**
1. Composite key pattern `[profileId, providerId]` for natural multi-tenancy
2. Compound indexes for common query patterns (avoid over-indexing)
3. Zero-downtime migration with 7-day backup retention
4. Schema versioning via `onupgradeneeded` with data migrations
5. WebCrypto API for encryption (PBKDF2 + AES-GCM)

**Avoid:**
1. Auto-increment keys when natural keys exist
2. Loading all records then filtering in JavaScript
3. Opening multiple transactions for related operations
4. Storing plaintext API keys (even temporarily)

**Production Checklist:**
- [ ] Quota monitoring with safety margins
- [ ] Transaction error handling (QuotaExceededError, ConstraintError)
- [ ] Migration verification + rollback capability
- [ ] LRU cache for hot data
- [ ] Encryption key derivation from session/password (never hardcoded)

**Unresolved Questions:**
1. Preferred profile switching UX (reload vs in-memory state swap)?
2. Custom provider schema validation library (Zod, Ajv)?
3. Maximum profile count before UX changes needed?
