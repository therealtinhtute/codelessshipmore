# Phase 03: UI Components

## Overview
**Date:** 2025-12-22 | **Priority:** High | **Status:** Blocked | **Time:** 270 min
**Depends on:** Phase 02

Build UI components for profile management and multi-provider selection.

## Components to Create

### 1. ProfileSelector (90 min)
`/src/components/settings/profile-selector.tsx`
- Dropdown/tabs showing all profiles
- Highlight current profile
- Create new profile button
- Delete profile button (disabled for default)
- Profile metadata display (name, description)

### 2. ProfileManager Dialog (60 min)
`/src/components/settings/profile-manager.tsx`
- Modal for create/edit profile
- Form: name (required), description (optional)
- Validation: max 50 chars, unique name
- Save/cancel buttons

### 3. Update ProviderCard (60 min)
`/src/components/settings/provider-card.tsx`
- Replace radio button with checkbox for enabled state
- Add "Active" badge when enabled
- Support multi-select (multiple enabled providers)
- Show profile context (optional)

### 4. CustomProviderDialog (60 min)
`/src/components/settings/custom-provider-dialog.tsx`
- Modal with form
- Fields: name, baseUrl, defaultModel, models (comma-separated)
- URL validation (must be HTTPS)
- Submit creates custom provider in current profile

## Success Criteria
- [ ] Can create/switch/delete profiles via UI
- [ ] Multiple providers can be enabled simultaneously
- [ ] Custom provider can be added via dialog
- [ ] All forms have proper validation
- [ ] UI follows design guidelines in `/docs/design-guidelines.md`

## Related Files
- Create: 4 new component files
- Modify: `/src/components/settings/ai-settings.tsx` (integrate profile selector)
