# Phase 02: Context Refactor

## Overview
**Date:** 2025-12-22 | **Priority:** Critical | **Status:** Blocked | **Time:** 120 min
**Depends on:** Phase 01

Refactor AISettingsContext to use IndexedDB and support profile management.

## Key Changes
- Replace localStorage with ProviderDB
- Add profile CRUD operations
- Support multi-provider active selection
- Add custom provider creation

## Implementation Steps

1. **Add Profile State** (20 min)
   - Add currentProfile, profiles to context state
   - Add profile CRUD methods
   - Add profile switching logic

2. **Update Provider Methods** (30 min)
   - Scope all operations to currentProfile.id
   - Update provider by profileId + providerId
   - Support multiple enabled providers

3. **Add Custom Provider Support** (25 min)
   - createCustomProvider(name, baseUrl, models)
   - Generate providerId: "custom-{uuid}"
   - Store in provider_configs with providerType="custom"

4. **Replace Storage Layer** (30 min)
   - Remove localStorage calls
   - Use ProviderDB.getProviderConfigsByProfile()
   - Use ProviderDB.saveProviderConfig()
   - Maintain encryption compatibility

5. **Add Error Handling** (15 min)
   - Try/catch all IndexedDB operations
   - Fallback to localStorage on errors
   - Show user-friendly error messages

## Success Criteria
- [ ] useAISettings() returns profile management methods
- [ ] Profile switching loads correct provider configs
- [ ] Custom providers can be created
- [ ] Encryption works identically to before
- [ ] No TypeScript errors

## Related Files
- Modify: `/src/contexts/ai-settings-context.tsx`
- Use: `/src/lib/storage/indexeddb.ts`
