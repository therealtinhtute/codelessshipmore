# TypeScript IndexedDB Research Report

**Date:** 2025-12-22
**Topic:** IndexedDB TypeScript Libraries, Patterns, Testing & Compatibility

---

## 1. TypeScript IndexedDB Libraries Comparison

### idb (Jake Archibald)
**Bundle Size:** ~1.19kB (brotli) | Minimal overhead
**Pros:**
- Minimal API surface, mirrors native IndexedDB closely
- Promise-based wrapper over native API
- Full TypeScript generics support via `DBSchema` interface
- Async iteration support (`for await...of` over cursors)
- Transaction shortcuts: `tx.store`, `tx.done` promise
- Database shortcuts: `db.get()`, `db.put()`, etc.
- Modern browser target (no IE baggage)

**Cons:**
- Transaction auto-close limitation: Cannot `await` external operations (fetch, etc.) mid-transaction
- Minimal abstraction - still requires IndexedDB knowledge
- No query builder or ORM features
- Manual schema migrations

**TypeScript Pattern:**
```typescript
interface MyDB extends DBSchema {
  'users': {
    key: string;
    value: User;
    indexes: { 'email': string };
  };
}

const db = await openDB<MyDB>('app-db', 1, {
  upgrade(db) {
    db.createObjectStore('users');
  }
});

const user = await db.get('users', 'user-123'); // Type: User | undefined
```

### Dexie.js
**Bundle Size:** ~30kB (minified) | Feature-rich
**Pros:**
- Intuitive query API (closer to SQL/MongoDB)
- Built-in schema versioning & migrations
- Table abstraction with chainable queries
- Optional cloud sync (Dexie Cloud)
- React/Vue/Angular hooks/integrations
- TypeScript support with Table<T> generics
- Better developer experience for complex queries

**Cons:**
- Larger bundle (30KB+ vs 1.2KB for idb)
- Additional abstraction layer to learn
- Cloud features require paid tier for production
- More opinionated API (less IndexedDB-native)

**TypeScript Pattern:**
```typescript
class AppDatabase extends Dexie {
  users!: Table<User, string>;

  constructor() {
    super('app-db');
    this.version(1).stores({
      users: '++id, email, createdAt'
    });
  }
}

const db = new AppDatabase();
const users = await db.users.where('email').equals('x@y.com').toArray();
```

### localForage
**Bundle Size:** ~8.8kB (gzip), ~7.8kB (brotli)
**Pros:**
- localStorage-like API (simple key-value)
- Auto-fallback: IndexedDB → WebSQL → localStorage
- Supports Blobs, TypedArrays, ArrayBuffers
- Node-style callbacks or Promises
- Multiple instances (`createInstance()`)

**Cons:**
- No relational/indexed queries (key-value only)
- TypeScript support requires import config (`allowSyntheticDefaultImports`)
- No schema management
- Limited to simple use cases
- localStorage fallback has storage limits (~5-10MB)

**Recommendation:** Use for simple key-value persistence, not complex structured data.

---

## 2. Custom Wrapper Patterns

### Generic Type-Safe Store Pattern
```typescript
interface StoreConfig<T, K extends IDBValidKey = IDBValidKey> {
  name: string;
  keyPath?: string | string[];
  indexes?: Array<{ name: string; keyPath: string; unique?: boolean }>;
}

class TypedStore<T, K extends IDBValidKey = string> {
  constructor(
    private db: IDBDatabase,
    private config: StoreConfig<T, K>
  ) {}

  async get(key: K): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.config.name, 'readonly');
      const store = tx.objectStore(this.config.name);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async put(value: T, key?: K): Promise<K> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.config.name, 'readwrite');
      const store = tx.objectStore(this.config.name);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(req.result as K);
      req.onerror = () => reject(req.error);
    });
  }
}
```

### Error Handling Pattern
```typescript
class DBError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'DBError';
  }
}

async function safeTransaction<T>(
  db: IDBDatabase,
  stores: string[],
  mode: IDBTransactionMode,
  fn: (tx: IDBTransaction) => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);

    tx.onerror = () => reject(new DBError(
      'Transaction failed',
      'TRANSACTION_ERROR',
      tx.error || undefined
    ));

    tx.onabort = () => reject(new DBError(
      'Transaction aborted',
      'TRANSACTION_ABORTED'
    ));

    fn(tx).then(resolve).catch(reject);
  });
}
```

---

## 3. Testing IndexedDB

### Unit Testing with fake-indexeddb
**Installation:** `bun add -d fake-indexeddb`

**Setup (Jest):**
```javascript
// jest.config.js
{
  "setupFiles": ["fake-indexeddb/auto"]
}
```

**With jsdom (requires polyfill):**
```javascript
import "core-js/stable/structured-clone";
import "fake-indexeddb/auto";
```

**Test Isolation:**
```typescript
import { IDBFactory } from 'fake-indexeddb';

beforeEach(() => {
  // Reset IndexedDB between tests
  indexedDB = new IDBFactory();
});
```

**Testing Library Wrappers (Dexie example):**
```typescript
import "fake-indexeddb/auto";
import Dexie from "dexie";

test('should store and retrieve user', async () => {
  const db = new Dexie('test-db');
  db.version(1).stores({ users: '++id, email' });

  await db.users.add({ email: 'test@example.com' });
  const user = await db.users.where('email').equals('test@example.com').first();

  expect(user.email).toBe('test@example.com');
});
```

**Quality:** fake-indexeddb passes 82.8% (1369/1653) of Web Platform Tests (Nov 2025).

### E2E Migration Testing Strategy
```typescript
// Test migration flow
test('should migrate from v1 to v2 schema', async () => {
  // Create v1 database
  let db = await openDB('app', 1, {
    upgrade(db) {
      db.createObjectStore('users');
    }
  });
  await db.put('users', { name: 'Alice' }, 'user-1');
  db.close();

  // Migrate to v2
  db = await openDB('app', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        const store = db.transaction.objectStore('users');
        store.createIndex('name', 'name');
      }
    }
  });

  const user = await db.getFromIndex('users', 'name', 'Alice');
  expect(user).toEqual({ name: 'Alice' });
});
```

---

## 4. Browser Compatibility

### Support Matrix
- **Chrome/Edge:** Full support (all versions since 2013)
- **Firefox:** Full support (all versions since 2013)
- **Safari:** Full support (iOS 8+, macOS 10.10+)
- **IndexedDB v2:** getAll(), getAllKeys(), binary keys (2017+)

### Private Browsing Mode Behavior
- **Firefox Private:** IndexedDB disabled completely (throws errors)
- **Safari Private:** IndexedDB available but quota ~0MB (fails on write)
- **Chrome Incognito:** IndexedDB works, data cleared on session end

### Fallback Strategy
```typescript
async function initStorage() {
  // Detection
  if (!('indexedDB' in window)) {
    return useLocalStorageFallback();
  }

  // Private mode detection (Safari)
  try {
    const testDB = await openDB('__test__', 1);
    await testDB.put('test', 'value', 'key');
    testDB.close();
    await deleteDB('__test__');
    return useIndexedDB();
  } catch (err) {
    console.warn('IndexedDB unavailable (private mode?)', err);
    return useLocalStorageFallback();
  }
}
```

### Storage Quotas
- **Persistent storage:** Request via `navigator.storage.persist()`
- **Check quota:** `navigator.storage.estimate()`
- **Eviction:** IndexedDB data may be evicted when disk space low (varies by browser)

---

## Recommendations

**Simple key-value storage:** localForage (8KB, auto-fallback)
**Lightweight wrapper with full control:** idb (1.2KB, TypeScript-first)
**Complex queries & migrations:** Dexie.js (30KB, developer-friendly)
**Custom solution:** Build on idb for minimal overhead with type safety

**Testing:** Use fake-indexeddb for unit tests, always test migrations E2E
**Production:** Implement private browsing detection & localStorage fallback

---

## Sources
- [idb GitHub](https://github.com/jakearchibald/idb)
- [Dexie.js Official](https://dexie.org)
- [localForage GitHub](https://github.com/localForage/localForage)
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [fake-indexeddb GitHub](https://github.com/dumbmatter/fakeIndexedDB)
