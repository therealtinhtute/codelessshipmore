# Requirements Document

## Introduction

This feature migrates the CodelessShipMore application from the current "Cursor Design System" (orange primary, Inter font, warm canvas) to a "Lovable-inspired Design System" as defined in DESIGN.md. The migration covers typography (Camera Plain Variable), color palette (cream/charcoal opacity-driven system), component styling (inset shadow buttons, border-contained cards), logo replacement, and dark mode adaptation. The goal is a cohesive, warm, editorial visual identity while preserving existing functionality and accessibility.

## Glossary

- **Design_System**: The complete set of CSS custom properties, typography rules, component styles, and visual tokens that define the application's visual identity
- **Theme_Engine**: The next-themes ThemeProvider that manages light/dark mode switching via a `class` attribute on the HTML element
- **Token_Layer**: The CSS custom properties defined in `globals.css` under `@theme inline` and `:root` / `.dark` selectors that map semantic names to color values
- **Typography_Scale**: The set of font-size, weight, line-height, and letter-spacing combinations used across headings, body, buttons, and captions
- **Font_Loader**: The Next.js font loading mechanism (currently `next/font/google` for Inter and JetBrains Mono) responsible for injecting CSS variables for font families
- **Sidebar_Logo**: The branding element in the sidebar header that currently renders an orange circle with an asterisk character
- **Inset_Shadow**: The multi-layer CSS box-shadow technique (`rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px`) used on primary dark buttons in the Lovable design
- **Opacity_Gray_Scale**: The color system where all gray tones derive from `#1c1c1c` at varying opacity levels (0.03, 0.04, 0.4, 0.82, 0.83, 1.0) rather than distinct hex values
- **Camera_Plain_Variable**: The target custom typeface with humanist warmth, supporting continuous weight axis (400, 480, 600)
- **Shadcn_Tokens**: The semantic color tokens consumed by shadcn/ui components (--background, --foreground, --primary, --card, --border, etc.)

## Requirements

### Requirement 1: Font Family Migration

**User Story:** As a developer, I want the application to use Camera Plain Variable as the primary typeface, so that the UI reflects the warm humanist personality of the Lovable design system.

#### Acceptance Criteria

1. WHEN the application loads, THE Font_Loader SHALL serve Camera Plain Variable as the primary sans-serif font with CSS variable `--font-sans` using `font-display: swap`
2. THE Font_Loader SHALL provide Camera Plain Variable at weights 400, 480, and 600 via a variable font file with a weight axis range of 400–600
3. THE Font_Loader SHALL define fallback fonts as `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
4. THE Font_Loader SHALL continue serving JetBrains Mono as the monospace font via CSS variable `--font-mono`
5. IF Camera Plain Variable fails to load, THEN THE Font_Loader SHALL render text using the defined fallback stack with a Cumulative Layout Shift of no more than 0.05
6. THE Design_System SHALL remove all references to the Inter font from the font loading configuration

### Requirement 2: Color Token Migration

**User Story:** As a developer, I want the CSS custom properties updated to the Lovable color palette, so that all components inherit the new warm cream and charcoal color scheme.

#### Acceptance Criteria

1. THE Token_Layer SHALL define the light mode background color as `#f7f4ed` (cream)
2. THE Token_Layer SHALL define the light mode primary text color (ink) as `#1c1c1c` (charcoal)
3. THE Token_Layer SHALL define the light mode body text color as `#5f5f5d` (muted gray)
4. THE Token_Layer SHALL define the light mode passive border color as `#eceae4`
5. THE Token_Layer SHALL define the light mode interactive border color as `rgba(28, 28, 28, 0.4)`
6. THE Token_Layer SHALL define the light mode primary button background as `#1c1c1c`
7. THE Token_Layer SHALL define the light mode button text on dark backgrounds as `#fcfbf8`
8. THE Token_Layer SHALL define the focus shadow as `rgba(0, 0, 0, 0.1) 0px 4px 12px`
9. THE Token_Layer SHALL define the ring color as `rgba(59, 130, 246, 0.5)`
10. THE Token_Layer SHALL remove the orange primary color (`#f54e00`) and the following Cursor-specific color tokens: `--timeline-thinking`, `--timeline-grep`, `--timeline-read`, `--timeline-edit`, `--timeline-done`, `--primary-active`, `--ink-elevated`, `--ink-soft`, and `--semantic-success`, `--semantic-error`, such that no CSS custom property declaration for these tokens remains in `globals.css`
11. THE Opacity_Gray_Scale SHALL derive all neutral gray values from `#1c1c1c` at opacity levels 0.03, 0.04, 0.4, 0.82, 0.83, and 1.0
12. THE Token_Layer SHALL ensure that the combination of background `#f7f4ed` with body text `#5f5f5d` meets WCAG 2.1 AA minimum contrast ratio of 4.5:1 for normal text, and the combination of background `#f7f4ed` with primary text `#1c1c1c` meets a minimum contrast ratio of 7:1
13. IF a component references a removed color token, THEN THE Token_Layer SHALL not cause a build error or render a missing-value fallback; the removed property SHALL simply be absent and the component SHALL be updated per Requirement 11 criterion 5

### Requirement 3: Dark Mode Adaptation

**User Story:** As a user, I want a dark mode that complements the Lovable light palette, so that I can use the application comfortably in low-light environments.

#### Acceptance Criteria

1. THE Token_Layer SHALL define dark mode canvas as a warm dark tone derived from the Lovable charcoal palette (not pure black), with a lightness value between 8% and 12% in HSL and a warm undertone (hue between 40° and 60°)
2. THE Token_Layer SHALL define dark mode primary text color as `#f7f7f4` (cream-white), body text color as a muted cream with at least 4.5:1 contrast ratio against the canvas, and muted foreground as a warm gray with at least 3:1 contrast ratio against the canvas
3. THE Token_Layer SHALL define dark mode borders using the cream color (`#f7f7f4`) at opacity levels of 0.06 (soft), 0.10 (default), and 0.18 (strong) for consistency with the opacity-driven approach
4. THE Token_Layer SHALL define dark mode card surfaces as a warm dark tone that is at least 3% lighter in luminance than the canvas, ensuring a visible distinction between card and background
5. THE Theme_Engine SHALL continue to support light/dark mode toggling via the `class` attribute on the HTML element
6. WHILE dark mode is active, THE Design_System SHALL maintain the same border-radius values, spacing, and component structure as light mode
7. WHILE dark mode is active, THE Token_Layer SHALL map all Shadcn_Tokens (--background, --foreground, --card, --card-foreground, --popover, --border, --input, --muted, --muted-foreground, --accent, --accent-foreground) to the corresponding dark mode color values

### Requirement 4: Typography Scale Update

**User Story:** As a developer, I want the typography utilities updated to match the Lovable hierarchy, so that headings, body text, and UI elements use the correct sizes, weights, and letter-spacing.

#### Acceptance Criteria

1. THE Typography_Scale SHALL define Display Hero as 60px, weight 600, line-height 1.1, letter-spacing -1.5px
2. THE Typography_Scale SHALL define Section Heading as 48px, weight 600, line-height 1.0, letter-spacing -1.2px
3. THE Typography_Scale SHALL define Sub-heading as 36px, weight 600, line-height 1.1, letter-spacing -0.9px
4. THE Typography_Scale SHALL define Card Title as 20px, weight 400, line-height 1.25, letter-spacing 0px
5. THE Typography_Scale SHALL define Body as 16px, weight 400, line-height 1.5, letter-spacing 0px
6. THE Typography_Scale SHALL define Button as 16px, weight 400, line-height 1.5, letter-spacing 0px
7. THE Typography_Scale SHALL define Caption as 14px, weight 400, line-height 1.5, letter-spacing 0px
8. THE Typography_Scale SHALL limit weight to a maximum of 600 for Display Hero, Section Heading, and Sub-heading entries, and SHALL NOT provide weight 700 or bold variants for these entries
9. THE Typography_Scale SHALL apply negative letter-spacing only to entries at 36px and above (Display Hero, Section Heading, Sub-heading) and SHALL set letter-spacing to 0px for all entries below 36px
10. THE Typography_Scale SHALL expose each entry as a named utility that a developer can apply to an element, producing the defined font-size, font-weight, line-height, and letter-spacing values simultaneously

### Requirement 5: Button Component Styling

**User Story:** As a user, I want buttons styled with the Lovable inset shadow technique and warm palette, so that interactive elements feel tactile and consistent with the design system.

#### Acceptance Criteria

1. THE Design_System SHALL style primary buttons with background `#1c1c1c`, text `#fcfbf8`, padding 8px 16px, border-radius 6px, and the Inset_Shadow
2. THE Design_System SHALL style ghost/outline buttons with transparent background, text `#1c1c1c`, border `1px solid rgba(28, 28, 28, 0.4)`, and border-radius 6px
3. THE Design_System SHALL style cream surface buttons with background `#f7f4ed`, text `#1c1c1c`, no border, and border-radius 6px
4. THE Design_System SHALL style pill/icon buttons with background `#1c1c1c`, text `#fcfbf8`, padding 8px 16px, border-radius 9999px, and the Inset_Shadow
5. WHEN a button of any variant is in hover state, THE Design_System SHALL apply opacity 0.9 to the button
6. WHEN a button of any variant is in active/pressed state, THE Design_System SHALL apply opacity 0.8 to the button
7. WHEN a button of any variant receives focus, THE Design_System SHALL apply the focus shadow `rgba(0, 0, 0, 0.1) 0px 4px 12px`
8. WHILE a button is in disabled state, THE Design_System SHALL apply opacity 0.5 and prevent pointer events

### Requirement 6: Card and Container Styling

**User Story:** As a user, I want cards and containers styled with warm borders instead of box-shadows, so that the interface feels flat and cohesive with the Lovable aesthetic.

#### Acceptance Criteria

1. THE Design_System SHALL style cards with background `#f7f4ed`, border `1px solid #eceae4`, and border-radius 12px
2. THE Design_System SHALL apply no box-shadow to cards in any state including default, hover, focus, and active
3. THE Design_System SHALL use border-radius 16px for containers that span more than 50% of the viewport width or are designated as featured sections, border-radius 12px for standard card containers, and border-radius 8px for containers with a max-width of 320px or fewer than 3 child elements
4. WHILE dark mode is active, THE Design_System SHALL adapt card backgrounds and borders to use the corresponding dark mode background and border tokens while preserving the same border-radius values as light mode
5. THE Design_System SHALL apply the same `1px solid` border style and no box-shadow rule to all container size variants (featured/large, standard, and compact)

### Requirement 7: Input and Form Styling

**User Story:** As a developer, I want form inputs styled with the Lovable palette, so that interactive form elements are visually consistent with the rest of the design system.

#### Acceptance Criteria

1. THE Design_System SHALL style text-based inputs (including text, email, password, number, search, url, tel, and textarea) with background `#f7f4ed`, text color `#1c1c1c`, border `1px solid #eceae4`, border-radius 6px, and horizontal padding of 12px and vertical padding of 8px
2. THE Design_System SHALL style input placeholder text with color `#5f5f5d`
3. WHEN an input receives focus, THE Design_System SHALL apply an outline of 2px solid `rgba(59, 130, 246, 0.5)` with an outline-offset of 2px
4. WHILE an input is disabled, THE Design_System SHALL style it with an opacity of 0.5 and prevent pointer interaction

### Requirement 8: Logo Replacement

**User Story:** As a user, I want the sidebar logo updated to the new brand SVG, so that the application identity matches the Lovable-inspired design.

#### Acceptance Criteria

1. THE Sidebar_Logo SHALL render an SVG image sourced from `https://mintcdn.com/supermemory/1szAHJ3-ym4bjQ4U/logo/light.svg?fit=max&auto=format&n=1szAHJ3-ym4bjQ4U&q=85&s=e4571d11b31900b962a200bf7206e7d9`
2. THE Sidebar_Logo SHALL replace the current orange circle with asterisk element
3. THE Sidebar_Logo SHALL render with a height between 24px and 32px (inclusive), preserving the original aspect ratio of the SVG without distortion
4. WHILE the sidebar is in collapsed state, THE Sidebar_Logo SHALL display only the logomark symbol portion of the SVG, hiding any text or wordmark elements
5. IF the SVG image fails to load from the source URL, THEN THE Sidebar_Logo SHALL display a static fallback element that occupies the same dimensions (24px to 32px height) as the expected logo

### Requirement 9: Shadcn Semantic Token Mapping

**User Story:** As a developer, I want the shadcn semantic tokens remapped to the Lovable palette, so that all shadcn/ui components automatically inherit the new design system colors.

#### Acceptance Criteria

1. THE Shadcn_Tokens SHALL map `--background` to the Lovable cream (`#f7f4ed`)
2. THE Shadcn_Tokens SHALL map `--foreground` to the Lovable charcoal (`#1c1c1c`)
3. THE Shadcn_Tokens SHALL map `--primary` to `#1c1c1c` (charcoal, used for primary buttons)
4. THE Shadcn_Tokens SHALL map `--primary-foreground` to `#fcfbf8` (off-white button text)
5. THE Shadcn_Tokens SHALL map `--border` to `#eceae4` (passive border)
6. THE Shadcn_Tokens SHALL map `--ring` to `rgba(59, 130, 246, 0.5)` (focus ring)
7. THE Shadcn_Tokens SHALL map `--card` to `#f7f4ed` and `--card-foreground` to `#1c1c1c`
8. THE Shadcn_Tokens SHALL map `--muted` to `rgba(28, 28, 28, 0.03)` and `--muted-foreground` to `#5f5f5d`
9. THE Shadcn_Tokens SHALL map `--destructive` to `#dc2626` (warm red that maintains a minimum WCAG AA contrast ratio of 4.5:1 against the `--background` value)
10. THE Shadcn_Tokens SHALL map `--secondary` to `#f7f4ed`, `--secondary-foreground` to `#1c1c1c`, `--accent` to `rgba(28, 28, 28, 0.04)`, `--accent-foreground` to `#1c1c1c`, `--popover` to `#ffffff`, `--popover-foreground` to `#1c1c1c`, and `--input` to `#eceae4`
11. THE Shadcn_Tokens SHALL define dark mode mappings for every token listed in criteria 1–10, inverting the cream/charcoal relationship such that `--background` uses a warm dark tone derived from the Lovable charcoal, `--foreground` uses `#f7f4ed`, `--primary` uses `#f7f4ed`, `--primary-foreground` uses `#1c1c1c`, `--border` uses `rgba(247, 244, 237, 0.12)`, and `--card` uses a surface tone one step lighter than `--background`
12. WHEN a shadcn/ui component references any semantic token defined in criteria 1–10, THE Shadcn_Tokens SHALL resolve to the mapped Lovable palette value without requiring component-level style overrides

### Requirement 10: Border Radius System Update

**User Story:** As a developer, I want the border-radius scale updated to match the Lovable system, so that all components use consistent rounding values.

#### Acceptance Criteria

1. THE Design_System SHALL define a CSS custom property --radius-xs with a value of 4px for small interactive elements such as inline tags and chips
2. THE Design_System SHALL define a CSS custom property --radius-sm with a value of 6px for compact interactive elements such as buttons, inputs, and navigation items
3. THE Design_System SHALL define a CSS custom property --radius-md with a value of 8px for medium containers such as compact cards and grouped controls
4. THE Design_System SHALL define a CSS custom property --radius-lg with a value of 12px for standard cards and image containers
5. THE Design_System SHALL define a CSS custom property --radius-xl with a value of 16px for large containers and feature sections
6. THE Design_System SHALL define a CSS custom property --radius-pill with a value of 9999px for fully rounded elements such as action pills, badges, and icon buttons
7. THE Design_System SHALL define the radius scale as concrete pixel values without calc() chains or dependency on a base --radius variable
8. WHEN a component applies a border-radius, THE Design_System SHALL require that the value references one of the six defined radius tokens (--radius-xs, --radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-pill) or a calc() expression derived from one of those tokens
9. THE Design_System SHALL NOT define any border-radius tokens outside the six specified in criteria 1 through 6

### Requirement 11: Removal of Cursor-Specific Utilities

**User Story:** As a developer, I want Cursor-specific CSS utilities removed, so that the codebase contains only styles relevant to the Lovable design system.

#### Acceptance Criteria

1. THE Design_System SHALL remove the timeline pill utility classes (`.timeline-pill`, `.timeline-pill-thinking`, `.timeline-pill-grep`, `.timeline-pill-read`, `.timeline-pill-edit`, `.timeline-pill-done`)
2. THE Design_System SHALL remove the Cursor-specific code-pane utility classes (`.code-pane`, `.code-pane-editable`) and replace them with Lovable-palette equivalents that use background `#f7f4ed`, text color `#1c1c1c`, font-family `var(--font-mono)`, border `1px solid #eceae4`, border-radius 6px, and padding 16px
3. THE Design_System SHALL remove the Cursor-specific typography utilities and replace them with Lovable Typography_Scale equivalents mapped as follows: `.text-display-mega` to Display Hero (60px), `.text-display-lg` to Section Heading (48px), `.text-display-md` to Sub-heading (36px), `.text-display-sm` to Card Title (20px)
4. THE Design_System SHALL remove all Cursor-specific color tokens (`--timeline-thinking`, `--timeline-grep`, `--timeline-read`, `--timeline-edit`, `--timeline-done`, `--primary-active`, `--ink-elevated`, `--ink-soft`)
5. IF any component references a removed utility class, THEN THE Design_System SHALL update that component to use the replacement Lovable utility class name in the same source file
6. IF any non-removed token (such as `--chart-2`, `--chart-3`, `--chart-4`, or syntax highlighting rules) references a removed Cursor-specific color token, THEN THE Design_System SHALL reassign that token to a color from the Lovable palette (`#1c1c1c`, `#5f5f5d`, `#eceae4`, or an opacity variant of `#1c1c1c`)
