# Phase 04: Integration

## Overview
**Date:** 2025-12-22 | **Priority:** Medium | **Status:** Blocked | **Time:** 60 min
**Depends on:** Phase 03

Update useAI hook to support multiple active providers.

## Changes

### 1. Multi-Provider Strategy (40 min)
Modify `/src/hooks/use-ai.ts`:
- Get all enabled providers from context
- Use first enabled provider by default
- Add optional providerId parameter to generate()
- Add fallback logic if provider fails

### 2. Provider Selection Logic (20 min)
```typescript
// Strategy: First enabled provider
const activeProviders = Object.values(settings.providers)
  .filter(p => p.enabled)
  .sort((a, b) => a.id.localeCompare(b.id))

const provider = providerId
  ? settings.providers[providerId]
  : activeProviders[0]
```

## Success Criteria
- [ ] useAI hook works with multiple enabled providers
- [ ] Can specify provider for specific operations
- [ ] Graceful fallback when provider unavailable
- [ ] No breaking changes to existing usage

## Related Files
- Modify: `/src/hooks/use-ai.ts`
