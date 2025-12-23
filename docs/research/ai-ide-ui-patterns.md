# AI IDE Tools: UI/UX Patterns for Provider Management

**Research Date**: 2025-12-23
**Tools Analyzed**: Continue.dev, Cody (Sourcegraph), Cursor IDE
**Focus**: Provider list display, profile switching, status indicators

---

## Summary

AI IDE tools favor **role-based model selection** over provider-first architecture. Most tools use **dropdown selectors** accessed via menu icons, with emphasis on model role assignment (chat, autocomplete, edit) rather than displaying all providers prominently. Settings interfaces favor **progressive disclosure** (hiding complexity behind icons/menus) with streamlined UI panels over complex card layouts.

**Key Insight**: AI IDEs minimize visual complexity by showing only the active model prominently, with other options accessible but not competing for attention.

---

## Pattern 1: Progressive Disclosure via Icon Menus

### Continue.dev: Role-Based Dropdown Model Selector

**Source**: [Continue.dev Documentation](https://docs.continue.dev/setup/overview)

**UI Flow**:
```
Click 3-dots menu → Click cube icon → Expand "Models" section → Dropdown menus for each role
```

**Roles Available**:
- Chat
- Autocomplete
- Edit
- Apply
- Embed
- Rerank

**Why This Matters**:
- Reduces visual clutter when managing 5+ providers
- Hides configuration behind progressive disclosure
- Emphasizes **what the model does** (role) over **who provides it** (brand)

**Visual Pattern**:
```
┌────────────────────┐
│ ⋮ (Menu icon)      │
│ ┌────────────────┐ │
│ │ 🧊 Models      │ │ ← Click to expand
│ │   > Chat       │ │ ← Dropdown selector
│ │   > Autocomplete│ │
│ │   > Edit       │ │
│ └────────────────┘ │
└────────────────────┘
```

**Application to Your App**:
- Consider adding role-based organization if you have different AI use cases
- Use collapsible sections instead of always-visible provider cards
- Place provider selection behind a menu/icon for compact display

---

## Pattern 2: Notebook-Style Interface (Conversation-Focused)

### Continue.dev: Editable Cells Interface

**Source**: [Continue.dev GitHub](https://github.com/continuedev/continue/tree/main/gui)

**Architecture**:
- React app in VS Code extension webview
- Notebook-like interface with editable cells
- Linear, conversation-focused layout
- Built with Vite + Tailwind CSS

**UI Structure**:
```
┌─────────────────────────────┐
│ [User Input Cell]           │
│ ─────────────────────────   │
│ [AI Response Cell]          │
│ ─────────────────────────   │
│ [User Input Cell]           │
│ ─────────────────────────   │
│ [Model: GPT-4 ▼]           │ ← Model selector in context
└─────────────────────────────┘
```

**Why This Matters**:
- Provider settings are NOT prominently displayed during use
- Settings page is separate from main interaction surface
- Focus on conversation flow, not configuration management

**Application to Your App**:
- Keep provider configuration in a dedicated settings page
- Don't clutter the main UI with provider management
- Consider adding a quick model switcher in the chat interface itself

---

## Pattern 3: Chat-First Interface with Context Selection

### Cody: @-Mentions for Context, Minimal Provider UI

**Source**: [Sourcegraph Cody Documentation](https://sourcegraph.com/docs/cody)

**UI Pattern**:
- Chat-centric interface
- Use @-mentions for context (files, symbols, repos)
- Auto-edit with cursor-based suggestions
- Prompts library for workflows

**Why This Matters**:
- Provider configuration happens in settings/preferences (separate)
- Main UI focuses on **task** (chatting, editing), not **configuration**
- Context selection (@-mentions) more prominent than provider selection

**Visual Pattern**:
```
┌─────────────────────────────┐
│ Chat with Cody              │
│                             │
│ > Ask about @file.ts        │ ← Context selection
│                             │
│ [User can't see which model │
│  is being used without      │
│  checking settings]         │
└─────────────────────────────┘
```

**Application to Your App**:
- Separate "active usage" UI from "configuration" UI
- Show current provider subtly (status bar, small dropdown)
- Don't force users to see all 5+ providers during normal use

---

## Pattern 4: In-Context Model Switcher

### Cursor IDE: Model Selector in Chat Interface

**Source**: Community discussions and documentation

**UI Pattern**:
```
┌─────────────────────────────┐
│ Chat          [GPT-4 ▼]     │ ← Dropdown in top-right
│                             │
│ User: ...                   │
│ Assistant: ...              │
│                             │
│ [Type your message...]      │
└─────────────────────────────┘
```

**Model Selector**:
- Appears in top-right of chat panel
- Dropdown showing current model
- Supports: GPT-4, Claude 3.5 Sonnet, Gemini
- Accessed via Cmd/Ctrl + K or direct click

**Why This Matters**:
- Model switching happens **where users need it** (during conversation)
- Minimizes context switching to separate settings page
- Quick access without leaving the task

**Application to Your App**:
- Add a model/provider dropdown directly in the prompt enhancer interface
- Show current provider in the UI header
- Allow switching without navigating to settings

---

## Pattern 5: VSCode Native Settings Integration

### Enum Dropdown for Provider Selection

**Source**: [VSCode Extension API](https://code.visualstudio.com/api/references/contribution-points#contributes.configuration)

**Configuration Schema**:
```json
{
  "type": "string",
  "enum": ["openai", "anthropic", "gemini"],
  "enumDescriptions": [
    "OpenAI (GPT-4, GPT-3.5)",
    "Anthropic (Claude)",
    "Google (Gemini)"
  ],
  "default": "openai"
}
```

**Renders As**:
- Native VSCode dropdown in Settings UI
- No custom webview needed for simple selection
- Integrates with workspace/user settings

**Why This Matters**:
- Leverages native UI patterns (familiar to users)
- Maintains consistency with host environment
- Simple configuration doesn't need complex custom UI

**Application to Your App**:
- For web apps, use native HTML `<select>` elements for simplicity
- Reserve custom components (cards, etc.) for when additional context is needed
- Consider if a simple dropdown suffices before building complex UI

---

## Pattern 6: Card-Based Layout (For Settings Pages)

### shadcn/ui Card Component Pattern

**Source**: [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card)

**Component Structure**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>OpenAI</CardTitle>
    <CardDescription>GPT-4, GPT-3.5 Turbo</CardDescription>
  </CardHeader>
  <CardContent>
    <Input type="password" placeholder="API Key" />
  </CardContent>
  <CardFooter>
    <Badge>Connected</Badge>
    <Button>Test Connection</Button>
  </CardFooter>
</Card>
```

**Visual Pattern**:
```
┌─────────────────────────────┐
│ OpenAI              • Active│ ← Header with status
│ GPT-4, GPT-3.5 Turbo        │ ← Description
│ ─────────────────────────   │
│ [API Key: ••••••••]         │ ← Content (config)
│ ─────────────────────────   │
│ [Test Connection]           │ ← Footer (actions)
└─────────────────────────────┘
```

**Why This Matters**:
- Cards provide visual containment for each provider
- Clear sections: identity (header), config (content), actions (footer)
- Works well for settings pages showing multiple providers

**Application to Your App**:
- ✅ Your current card-based approach is valid for settings pages
- Enhance with badges for status (Connected, Needs Key, Error)
- Add clear visual hierarchy (active provider more prominent)

---

## Pattern 7: Profile/Workspace Switching

### Slack Workspace Switcher Pattern

**Source**: Industry pattern analysis

**UI Elements**:
- Vertical sidebar with workspace icons
- Notification badges on icons
- Cmd/Ctrl + number keyboard shortcuts
- Single-click switching
- Clear visual active state (border, background color)

**Visual Pattern**:
```
┌──┐ ┌────────────────────┐
│ W│ │ Work Profile       │ ← Active profile
│──│ │                    │
│ P│ │ 3 providers        │
│  │ │ configured         │
│ +│ │                    │
└──┘ └────────────────────┘

W = Work (active - highlighted)
P = Personal (inactive - muted)
+ = Add profile
```

**Keyboard Shortcuts**:
- Cmd/Ctrl + 1: Switch to first profile
- Cmd/Ctrl + 2: Switch to second profile
- etc.

**Why This Matters**:
- Proven pattern for workspace/context switching
- Compact representation (icons)
- Power user shortcuts for quick switching
- Clear visual feedback for active state

**Application to Your App**:
- Add sidebar or top bar with profile icons/names
- Implement keyboard shortcuts for profile switching
- Use visual indicators (border, background) for active profile
- Show provider count badge on each profile

---

## UI/UX Best Practices from Research

### 1. Progressive Disclosure
✅ **Do**: Hide complex provider configuration behind icons/menus
❌ **Don't**: Show all provider cards expanded by default

### 2. Role-Based Organization
✅ **Do**: Organize by task/role if you have multiple AI use cases
❌ **Don't**: Let provider branding dominate the UI

### 3. In-Context Controls
✅ **Do**: Add model selector in the chat/main interface
❌ **Don't**: Force users to navigate to settings to switch providers

### 4. Compact Representations
✅ **Do**: Use icons, badges, collapsed states for 5+ items
❌ **Don't**: Show full card details for all providers at once

### 5. Keyboard Shortcuts
✅ **Do**: Provide Cmd+1, Cmd+2 for quick profile switching
❌ **Don't**: Rely only on mouse clicks for switching

### 6. Status Indicators
✅ **Do**: Use badges/dots (green=connected, yellow=needs key, red=error)
❌ **Don't**: Make users click into each provider to see status

### 7. Visual Hierarchy
✅ **Do**: Make active provider prominent, others accessible but subtle
❌ **Don't**: Give equal visual weight to all providers

### 8. Native Patterns
✅ **Do**: Leverage native UI patterns when possible
❌ **Don't**: Build complex custom UI for simple selections

---

## Recommendations for Your Current UI

### Current State Analysis

Your app has:
- Profile-based architecture (✅ Good)
- Provider cards in settings (✅ Good for settings page)
- Multiple providers per profile (✅ Matches use case)

### Challenges Identified (From User Input)

1. **Displaying many providers per profile** - Cards can be cluttered
2. **Profile switching experience** - Needs improvement
3. **Provider configuration visibility** - Hard to see status at a glance
4. **Active provider indication** - Unclear which is selected

### Recommended Improvements

#### 1. Two-Level UI Hierarchy

**Current**: Show all profiles and all providers at once
**Recommended**: Show profiles first, expand to show providers

```
Profile View (Level 1):
┌─────────────────────────────┐
│ 💼 Work Profile    [Select] │
│    5 providers configured   │
│    Currently: GPT-4         │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🏠 Personal Profile [Select]│
│    3 providers configured   │
│    Currently: Claude 3.5    │
└─────────────────────────────┘

Provider View (Level 2 - when profile selected):
┌─────────────────────────────┐
│ OpenAI          • Connected │
│ GPT-4, GPT-3.5              │
│ [••••••••] [Test]           │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Anthropic       • Connected │
│ Claude 3.5 Sonnet           │
│ [••••••••] [Test]           │
└─────────────────────────────┘
```

#### 2. Add Profile Selector Widget

**Location**: Top of page (header area)
**Pattern**: Dropdown or pill selector

```
┌─────────────────────────────┐
│ [💼 Work ▼]  Settings       │ ← Profile selector in header
└─────────────────────────────┘
```

**Benefits**:
- Always visible
- Quick switching without scrolling
- Clearly shows active profile

#### 3. Collapsible Provider Cards

**Current**: All cards expanded
**Recommended**: Collapse inactive providers, expand active

```
Active Provider (Expanded):
┌─────────────────────────────┐
│ OpenAI              • Active│ ← Larger, prominent
│ GPT-4, GPT-3.5 Turbo        │
│ ─────────────────────────   │
│ [API Key: ••••••••]         │
│ [Test Connection]           │
└─────────────────────────────┘

Inactive Providers (Collapsed):
┌─────────────────────────────┐
│ Anthropic     • Configured ▶│ ← Smaller, click to expand
└─────────────────────────────┘
┌─────────────────────────────┐
│ Google Gemini • Needs Key ▶ │
└─────────────────────────────┘
```

#### 4. Status Badge System

**Colors**:
- 🟢 Green dot: Connected and working
- 🟡 Yellow dot: Configured but not tested
- 🔴 Red dot: Error or needs API key
- ⚪ Gray dot: Not configured

**Badge Text**:
- "Active" (currently selected)
- "Connected" (tested successfully)
- "Configured" (has API key, not tested)
- "Needs API Key" (not configured)
- "Error" (last test failed)

```tsx
<Badge variant={status === 'active' ? 'default' : 'secondary'}>
  <StatusDot color={statusColor} />
  {statusText}
</Badge>
```

#### 5. Quick Provider Switcher

**Pattern**: Command palette (Cmd+K) or dropdown in main UI

```
Press Cmd+K:
┌─────────────────────────────┐
│ Switch to provider:         │
│ > GPT-4 (OpenAI)           │ ← Active
│   Claude 3.5 (Anthropic)    │
│   Gemini Pro (Google)       │
│   Llama 3 (Cerebras)        │
└─────────────────────────────┘
```

**Alternative**: Dropdown in prompt enhancer interface

```
┌─────────────────────────────┐
│ Enhance Prompt  [GPT-4 ▼]   │ ← Provider selector
│                             │
│ [Enter your prompt...]      │
└─────────────────────────────┘
```

#### 6. Keyboard Navigation

**Profile Switching**:
- `Cmd/Ctrl + 1`: Switch to profile 1
- `Cmd/Ctrl + 2`: Switch to profile 2
- `Cmd/Ctrl + 0`: Open profile switcher

**Provider Selection**:
- `Tab`: Navigate between provider cards
- `Enter`: Expand/select provider
- `Space`: Toggle provider active state
- `Arrow keys`: Navigate within expanded card

#### 7. Accessibility Enhancements

**ARIA Labels**:
```tsx
<Card aria-label={`${provider.name} provider, ${status}`}>
  <CardHeader>
    <CardTitle id={`provider-${provider.id}-title`}>
      {provider.name}
    </CardTitle>
    <Badge
      aria-live="polite"
      aria-label={`Status: ${statusText}`}
    >
      {statusText}
    </Badge>
  </CardHeader>
</Card>
```

**Focus Management**:
- Trap focus in modals/dialogs
- Return focus after closing dialogs
- Visible focus indicators on all interactive elements

**Screen Reader Support**:
- Announce status changes
- Describe provider cards clearly
- Provide text alternatives for icons

---

## Visual Design Patterns

### Color Coding

**Provider Types**:
- OpenAI: Green accent
- Anthropic: Orange accent
- Google: Blue accent
- Custom: Purple accent

**Status Colors**:
- Active: Blue background
- Connected: Green border
- Needs Key: Yellow border
- Error: Red border

### Typography Hierarchy

```
Provider Name:     text-lg font-semibold
Provider Model:    text-sm text-muted-foreground
Status Badge:      text-xs font-medium
Action Buttons:    text-sm font-medium
```

### Spacing

```
Profile Cards:     gap-4 (16px between profiles)
Provider Cards:    gap-3 (12px between providers)
Card Padding:      p-4 (16px internal padding)
Compact Mode:      p-2 gap-2 (8px for collapsed cards)
```

---

## Component Library Recommendations

### shadcn/ui Components to Use

1. **Card**: Provider containers
2. **Badge**: Status indicators
3. **Button**: Actions (Test, Configure, Delete)
4. **Dialog**: Provider configuration modal
5. **DropdownMenu**: Profile selector
6. **Separator**: Visual breaks between sections
7. **Switch**: Toggle active provider
8. **Tabs**: Organize profile settings
9. **Command**: Quick switcher (Cmd+K)
10. **Avatar**: Profile icons

### Component Composition Example

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Check } from "lucide-react"

function ProviderCard({ provider, isActive, onSelect }) {
  return (
    <Card className={isActive ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {provider.name}
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </CardTitle>
            <CardDescription>
              {provider.models.join(", ")}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(provider.status)}>
            <StatusDot color={getStatusColor(provider.status)} />
            {provider.status}
          </Badge>
        </div>
      </CardHeader>

      {isActive && (
        <>
          <CardContent>
            {/* API Key input, model selector, etc. */}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={onTest}>
              Test Connection
            </Button>
          </CardFooter>
        </>
      )}

      {!isActive && (
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={onSelect}
          >
            Configure
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (2-3 hours)
1. Add status badges to existing provider cards
2. Implement collapsible provider cards (expand only active)
3. Add profile selector dropdown in header

### Phase 2: Enhanced Navigation (3-4 hours)
4. Implement keyboard shortcuts for profile switching
5. Add provider count badges to profile selector
6. Improve visual hierarchy (active vs inactive)

### Phase 3: Advanced Features (4-5 hours)
7. Build command palette (Cmd+K) for quick switching
8. Add in-context provider dropdown in prompt enhancer
9. Implement accessibility enhancements

### Phase 4: Polish (2-3 hours)
10. Add animations/transitions
11. Implement focus management
12. Test with screen readers

---

## Resources

### Documentation
- [Continue.dev Setup Overview](https://docs.continue.dev/setup/overview)
- [Sourcegraph Cody Documentation](https://sourcegraph.com/docs/cody)
- [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card)
- [VSCode Extension API - Configuration](https://code.visualstudio.com/api/references/contribution-points#contributes.configuration)

### Code Examples
- [Continue.dev GUI Source](https://github.com/continuedev/continue/tree/main/gui)
- [Continue.dev Main Repository](https://github.com/continuedev/continue)

---

## Key Takeaways

✅ **What AI IDEs Do Well**:
- Progressive disclosure (hide complexity)
- Role-based organization (task over brand)
- In-context controls (switch where you work)
- Minimal visual clutter

⚠️ **What Your App Should Do Differently**:
- AI IDEs are embedded in editors (different context)
- Your app is a standalone web tool (settings page is appropriate)
- Profile management is a core feature (should be prominent)
- Multiple providers per profile needs clear organization

🎯 **Recommended Approach**:
1. **Keep card-based layout** for settings page (appropriate for web apps)
2. **Add two-level hierarchy** (profiles → providers)
3. **Implement collapsible cards** (expand only active/selected)
4. **Add status badges** for at-a-glance visibility
5. **Provide quick switcher** (dropdown + keyboard shortcuts)
6. **Enhance accessibility** (keyboard nav, ARIA labels)

This balances the minimal patterns from AI IDEs with the needs of a standalone provider management application.
