# Phase 05: Testing & QA

## Overview
**Date:** 2025-12-22 | **Priority:** Critical | **Status:** Blocked | **Time:** 165 min
**Depends on:** Phase 04

Comprehensive testing of all features with >80% code coverage.

## Test Suites

### 1. Unit Tests: ProviderDB (60 min)
`/src/lib/storage/__tests__/indexeddb.test.ts`
- Test all CRUD operations
- Test migration logic
- Test error scenarios
- Test quota exceeded
- Use fake-indexeddb

### 2. Integration Tests: Profiles (60 min)
`/src/contexts/__tests__/ai-settings-context.test.tsx`
- Profile creation/switching/deletion
- Provider config isolation between profiles
- Custom provider creation
- Multi-provider selection

### 3. E2E Test: Migration (45 min)
`/src/lib/storage/__tests__/migration.test.ts`
- Populate localStorage with sample data
- Trigger migration
- Validate IndexedDB data matches
- Test encrypted API keys work

## Manual Testing Checklist
- [ ] Create 3 profiles with different configs
- [ ] Switch between profiles, verify isolation
- [ ] Add custom provider "Groq"
- [ ] Enable multiple providers simultaneously
- [ ] Delete profile, verify configs removed
- [ ] Test in private browsing mode
- [ ] Test migration with real localStorage data

## Success Criteria
- [ ] All tests pass
- [ ] Coverage >80% on new code
- [ ] No console errors in manual testing
- [ ] Migration works with real data

## Related Files
- Create: 3 test files
- Run: `bun test`
