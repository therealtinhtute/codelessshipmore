# Context API & Profile State Management Patterns

**Date**: 2025-12-22
**Focus**: Complex nested state, profile switching, multi-select, form management

---

## 1. Context API Patterns for Complex State

### 1.1 Prevent Rerenders - Split State & Dispatch

**Pattern**: Separate state from dispatch functions to prevent unnecessary rerenders.

```tsx
const ProfileStateContext = createContext<Profile[]>(null);
const ProfileDispatchContext = createContext<Dispatch>(null);

function ProfileProvider({ children }) {
  const [profiles, dispatch] = useReducer(profileReducer, []);

  return (
    <ProfileStateContext.Provider value={profiles}>
      <ProfileDispatchContext.Provider value={dispatch}>
        {children}
      </ProfileDispatchContext.Provider>
    </ProfileStateContext.Provider>
  );
}

// Only rerenders when state changes
const useProfiles = () => useContext(ProfileStateContext);

// Never rerenders (dispatch is stable)
const useProfileDispatch = () => useContext(ProfileDispatchContext);
```

**Why**: Components using only dispatch won't rerender when state changes. No `useMemo` needed.

### 1.2 Memoize Complex Context Values

```tsx
function ProviderConfigProvider({ children }) {
  const [configs, setConfigs] = useState({});

  const value = useMemo(() => ({
    configs,
    updateConfig: (id, config) => setConfigs(prev => ({ ...prev, [id]: config }))
  }), [configs]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}
```

**Rule**: Only memoize when (1) many consumers, (2) frequent changes, (3) measured performance issue.

### 1.3 Split Contexts by Update Frequency

```tsx
// Static/infrequent updates
const ProfileMetaContext = createContext();

// Frequent updates
const ActiveProviderContext = createContext();

function AppProviders({ children }) {
  const [profiles] = useState(loadProfiles);
  const [activeProvider, setActiveProvider] = useState(null);

  return (
    <ProfileMetaContext.Provider value={profiles}>
      <ActiveProviderContext.Provider value={{ activeProvider, setActiveProvider }}>
        {children}
      </ActiveProviderContext.Provider>
    </ProfileMetaContext.Provider>
  );
}
```

**Why**: Components only rerender when their specific context changes.

---

## 2. Async State Updates with IndexedDB

### 2.1 Race Condition Prevention

```tsx
function useIndexedDBData(db, storeName, key) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!db) return;

    let cancelled = false;
    const transaction = db.transaction([storeName], 'readonly');
    const request = transaction.objectStore(storeName).get(key);

    request.onsuccess = () => {
      if (!cancelled) setData(request.result);
    };

    return () => { cancelled = true; };
  }, [db, storeName, key]);

  return data;
}
```

### 2.2 Operation Queue Pattern

```tsx
class IndexedDBQueue {
  queue = Promise.resolve();

  async write(operation) {
    this.queue = this.queue.then(() => operation());
    return this.queue;
  }
}

const dbQueue = new IndexedDBQueue(db, 'profiles');
await dbQueue.write(() => updateProfile(profile));
```

**Why**: Prevents write conflicts during rapid state changes.

### 2.3 Optimistic vs Pessimistic Updates

**Optimistic** (instant UI, background sync):
```tsx
const updateProvider = async (id, config) => {
  setProviders(prev => prev.map(p => p.id === id ? { ...p, config } : p));
  try {
    await db.put('providers', { id, config });
  } catch (err) {
    setProviders(loadFromDB); // Rollback
    showError('Save failed');
  }
};
```

**Pessimistic** (wait for DB, then update UI):
```tsx
const updateProvider = async (id, config) => {
  setLoading(true);
  try {
    await db.put('providers', { id, config });
    setProviders(await db.getAll('providers'));
  } finally {
    setLoading(false);
  }
};
```

**Use optimistic for**: Profile switching, provider toggling
**Use pessimistic for**: Critical config changes, profile creation

---

## 3. Profile Switching UX

### 3.1 Instant Switch Pattern

```tsx
function ProfileSwitcher() {
  const dispatch = useProfileDispatch();
  const [switching, setSwitching] = useState(false);

  const switchProfile = async (profileId) => {
    setSwitching(true);
    dispatch({ type: 'SET_ACTIVE', id: profileId });

    requestIdleCallback(async () => {
      await loadProfileData(profileId);
      setSwitching(false);
    });
  };

  return (
    <div>
      {profiles.map(p => (
        <button
          onClick={() => switchProfile(p.id)}
          className={p.active ? 'active' : ''}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
```

### 3.2 Skeleton Screens During Load

```tsx
function ProviderList() {
  const profile = useActiveProfile();
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    setProviders(null); // Reset on profile change
    loadProviders(profile.id).then(setProviders);
  }, [profile.id]);

  if (!providers) return <ProviderListSkeleton />;

  return providers.map(p => <ProviderCard key={p.id} {...p} />);
}

function ProviderListSkeleton() {
  return Array(3).fill(0).map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  ));
}
```

### 3.3 Debouncing Profile Switches

```tsx
function useDebounceProfileSwitch(delay = 300) {
  const timeoutRef = useRef();

  return (profileId, callback) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(profileId), delay);
  };
}
```

**When to use**: Keyboard navigation, slider controls. **Not needed** for click-based switching.

---

## 4. Multi-Provider Selection

### 4.1 Controlled Multi-Select State

```tsx
function ProviderMultiSelect() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev =>
      prev.size === providers.length ? new Set() : new Set(providers.map(p => p.id))
    );
  };

  return (
    <>
      <Checkbox checked={selected.size === providers.length} onChange={toggleAll} />
      {providers.map(p => (
        <Checkbox
          key={p.id}
          checked={selected.has(p.id)}
          onChange={() => toggle(p.id)}
        />
      ))}
    </>
  );
}
```

### 4.2 Active vs Enabled State

**Pattern**: Separate selection (UI) from active state (business logic).

```tsx
type Provider = {
  id: string;
  enabled: boolean; // Persisted to DB
  selected?: boolean; // UI-only state
};

// Bulk enable
const enableSelected = () => {
  const updates = providers
    .filter(p => p.selected)
    .map(p => ({ ...p, enabled: true }));

  dispatch({ type: 'BULK_UPDATE', providers: updates });
  saveToIndexedDB(updates);
};
```

### 4.3 Drag-and-Drop Reordering (Archived Pattern)

**Note**: react-beautiful-dnd is archived. Use `@dnd-kit/core` or Pragmatic drag-drop.

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';

function ProviderList() {
  const [providers, setProviders] = useState([]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setProviders(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={providers}>
        {providers.map(p => <SortableItem key={p.id} {...p} />)}
      </SortableContext>
    </DndContext>
  );
}
```

---

## 5. Form State Management

### 5.1 React Hook Form Pattern

```tsx
import { useForm } from 'react-hook-form';

function ProviderForm({ onSubmit, defaultValues }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields }
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', {
          required: 'Name required',
          minLength: { value: 3, message: 'Min 3 chars' }
        })}
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register('apiKey', {
          validate: v => /^sk-/.test(v) || 'Invalid key format'
        })}
      />

      <button disabled={!isDirty}>Save</button>
    </form>
  );
}
```

### 5.2 Auto-save with Debounce

```tsx
function AutoSaveForm({ profileId }) {
  const { watch, getValues } = useForm();
  const watchedValues = watch();
  const debouncedSave = useDebouncedCallback(
    async (data) => {
      await saveToIndexedDB(profileId, data);
      toast.success('Saved');
    },
    1000
  );

  useEffect(() => {
    debouncedSave(getValues());
  }, [watchedValues]);

  return <form>...</form>;
}
```

### 5.3 Dirty State Tracking

```tsx
function UnsavedChangesPrompt() {
  const { formState: { isDirty } } = useForm();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
```

### 5.4 Manual Save with Confirmation

```tsx
function ManualSaveForm() {
  const [saved, setSaved] = useState(true);
  const { handleSubmit, formState: { isDirty } } = useForm();

  const onSubmit = async (data) => {
    await saveProfile(data);
    setSaved(true);
    toast.success('Profile saved');
  };

  useEffect(() => {
    if (isDirty) setSaved(false);
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2">
        <button type="submit" disabled={saved}>Save</button>
        {!saved && <span className="text-amber-600">Unsaved changes</span>}
      </div>
    </form>
  );
}
```

---

## Best Practices Summary

**Context API**:
- Split state/dispatch for performance
- Memoize only when measured as slow
- Split contexts by update frequency

**IndexedDB**:
- Use cancellation flags for race conditions
- Queue writes to prevent conflicts
- Optimistic updates for perceived speed

**Profile Switching**:
- Instant UI update, lazy data load
- Skeleton screens during transitions
- Debounce only for rapid input (keyboard nav)

**Multi-Select**:
- Use Set for O(1) lookups
- Separate UI selection from persisted state
- Modern DnD: `@dnd-kit` over archived react-beautiful-dnd

**Forms**:
- React Hook Form for validation + dirty tracking
- Auto-save: debounce + watch
- Manual save: disable button when clean, warn on navigation

---

## Unresolved Questions

1. **Conflict resolution**: How to handle IndexedDB writes when multiple tabs modify same profile?
2. **Migration strategy**: How to version IndexedDB schema for profile structure changes?
3. **Performance threshold**: At what profile/provider count does Context split become necessary?
4. **Accessibility**: Screen reader announcements during profile switches?
