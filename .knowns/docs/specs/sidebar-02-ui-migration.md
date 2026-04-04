---
title: Sidebar-02 UI Migration
description: Specification for migrating the app sidebar to the blocks.so sidebar-02 Dashboard Inset pattern
createdAt: '2026-04-04T15:19:37.489Z'
updatedAt: '2026-04-04T15:20:44.088Z'
tags: []
---

## Overview

Migrate the current sidebar implementation to adopt the `@blocks-so/sidebar-02` Dashboard Inset pattern from blocks.so. This includes the inset variant styling, animated header with notifications popover, collapsible navigation sections, and framer-motion animations.

## Locked Decisions

- **D1**: Full adoption of sidebar-02 features (inset variant, notifications, collapsible nav, animations)
- **D2**: Keep current auth footer (login/logout + theme toggle) instead of team switcher
- **D3**: Add notifications popover as placeholder UI to wire up later
- **D4**: Keep current navigation structure (Developer Tools + Pro Features sections)
- **D5**: Add framer-motion dependency for smooth animations

## Requirements

### Functional Requirements

- **FR-1**: Sidebar must use `variant="inset"` for the inset styling with rounded content area
- **FR-2**: Header must display logo, brand name, notifications popover, and sidebar trigger
- **FR-3**: Navigation must maintain Developer Tools and Pro Features sections with collapsible behavior
- **FR-4**: Footer must display login/logout button and theme toggle (existing behavior)
- **FR-5**: Collapsible icon mode must work correctly, hiding text labels when collapsed
- **FR-6**: Notifications popover must show placeholder UI with sample notifications
- **FR-7**: All existing navigation routes must work after migration

### Non-Functional Requirements

- **NFR-1**: Must add framer-motion as a dependency for animations
- **NFR-2**: Must maintain existing accessibility features (keyboard nav, screen reader support)
- **NFR-3**: Must preserve existing theme support (light/dark mode)
- **NFR-4**: Must preserve existing mobile responsive behavior
- **NFR-5**: Must maintain existing auth state integration

## Acceptance Criteria

- [ ] AC-1: Sidebar displays with inset variant styling (rounded content area, padding)
- [ ] AC-2: Header shows logo, brand name "CodelessShipMore", notifications bell, and collapse trigger
- [ ] AC-3: Clicking notifications bell opens dropdown with placeholder notifications
- [ ] AC-4: Navigation sections (Developer Tools, Pro Features) collapse/expand correctly
- [ ] AC-5: Sidebar collapses to icon-only mode with tooltips on hover
- [ ] AC-6: Footer shows login/logout button and theme toggle
- [ ] AC-7: framer-motion dependency added and animations work on header elements
- [ ] AC-8: Mobile responsive behavior preserved (sheet overlay for sidebar)
- [ ] AC-9: Theme toggle preserves light/dark mode switching
- [ ] AC-10: All existing routes navigate correctly from sidebar items

## Scenarios

### Scenario 1: User views dashboard on desktop
**Given** user is on desktop viewport
**When** page loads
**Then** sidebar displays in inset variant with rounded content area
**And** header shows logo, brand, notifications, and collapse trigger
**And** navigation shows Developer Tools and Pro Features sections

### Scenario 2: User collapses sidebar
**Given** sidebar is expanded
**When** user clicks collapse trigger
**Then** sidebar collapses to icon-only mode
**And** navigation items show only icons
**And** hovering over items shows tooltips
**And** header reorganizes for collapsed state

### Scenario 3: User clicks notifications bell
**Given** sidebar is expanded
**When** user clicks the notifications bell icon
**Then** notifications dropdown opens
**And** placeholder notifications are displayed
**And** dropdown can be dismissed

### Scenario 4: User views on mobile
**Given** user is on mobile viewport
**When** page loads
**Then** sidebar is hidden by default
**And** hamburger menu appears in header
**And** clicking it opens sidebar as sheet overlay

### Scenario 5: Authenticated user sees Pro Features
**Given** user is logged in
**When** sidebar renders
**Then** Pro Features section is visible
**And** Enhance Prompt and Settings items appear

### Scenario 6: Theme toggle
**Given** user is in light mode
**When** user clicks theme toggle in footer
**Then** app switches to dark mode
**And** sidebar styling updates accordingly

## Technical Notes

### Files to Modify
- `src/components/layout/sidebar.tsx` - Main sidebar component
- `src/components/ui/sidebar.tsx` - May need updates for inset variant
- `src/app/layout.tsx` - May need wrapper updates
- `package.json` - Add framer-motion dependency

### New Files to Create
- `src/components/layout/notifications-popover.tsx` - Notifications dropdown component

### Dependencies to Add
- `framer-motion` - For smooth animations

### Key Implementation Points
1. Change `collapsible="icon"` to `variant="inset"` + `collapsible="icon"` on Sidebar
2. Restructure SidebarHeader to include notifications and trigger with motion animations
3. Replace team switcher with existing auth footer
4. Keep existing navigation groups but apply collapsible styling
5. Use framer-motion for opacity/position transitions on header elements

## Open Questions

- [ ] Should notifications popover be disabled when sidebar is collapsed, or show on right side?
- [ ] Should the Dev Tools subtitle in header be preserved or removed?
