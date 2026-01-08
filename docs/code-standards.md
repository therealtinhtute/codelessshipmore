# Code Standards and Conventions

## Overview

This document establishes the coding standards and conventions for the codelessshipmore project. These standards ensure code quality, maintainability, and consistency across the entire codebase.

## Language and Framework Standards

### TypeScript Configuration
- **Strict Mode**: Always enabled in `tsconfig.json`
- **No Implicit Any**: All variables must have explicit types
- **Strict Null Checks**: Enabled to catch null/undefined issues
- **No Unused Locals**: Enable to catch unused variables
- **Exact Optional Property Types**: Enabled for precise type checking

### Next.js Conventions
- **App Router**: Use the new app directory structure
- **Server Components**: Default to server components when possible
- **Client Components**: Explicitly mark with `"use client"` when needed
- **Turbopack**: Use for development builds (enabled by default)

### Component Standards

#### File Naming
- PascalCase for component files: `UserProfile.tsx`, `JsonViewer.tsx`
- Group components by feature in subdirectories: `components/features/json-viewer/`
- Settings components in: `components/settings/`
- UI components in: `components/ui/`

#### Component Structure
```typescript
"use client" // Only when using hooks or event handlers

import React from 'react'
import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps extends ComponentProps<'div'> {
  // Custom props
  title: string
  isActive?: boolean
  onAction?: (id: string) => void
}

export function MyComponent({ title, isActive = false, onAction, className, ...props }: MyComponentProps) {
  // Component implementation
  const handleClick = () => {
    onAction?.('default-id')
  }

  return (
    <div className={cn('base-styles', className)} {...props}>
      {/* JSX content */}
    </div>
  )
}
```

#### Prop Naming
- Use descriptive names: `isLoading` not `loading`
- Boolean props use `is`/`has` prefix: `isVisible`, `hasError`
- Event handlers use verb pattern: `onSubmit`, `onChange`
- Optional props have default values when possible

### Hook Standards

#### Custom Hook Naming
- Use `use` prefix: `useAI`, `useAuth`, `useLocalStorage`
- Return consistent object structure
- Document all return values

#### Hook Implementation
```typescript
import { useEffect, useState } from 'react'

export function useAI(providerId?: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generate = async (prompt: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Implementation
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generate,
    isLoading,
    error
  }
}
```

## File Structure and Organization

### Directory Structure
```
src/
├── app/                          # Next.js App Router
│   ├── [feature]/                # Feature pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── features/                 # Feature-specific components
│   ├── settings/                 # Settings management
│   ├── auth/                     # Authentication components
│   └── layout/                   # Layout components
├── contexts/                     # React contexts
├── hooks/                        # Custom hooks
├── lib/
│   ├── ai/                       # AI utilities
│   ├── storage/                  # Storage abstraction
│   ├── auth/                     # Authentication
│   └── utils/                    # General utilities
└── types/                        # Type definitions
```

### Import/Export Standards

#### Import Order
1. React imports
2. Third-party imports
3. Internal imports (grouped by feature)
4. Type imports

```typescript
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAI } from '@/hooks/use-ai'
import { AISettingsContext } from '@/contexts/ai-settings-context'
import type { Profile } from '@/lib/storage/types'
```

#### Path Aliases
- Use `@/*` for all src imports: `@/hooks/use-ai`, `@/lib/utils`
- No relative imports in components or hooks

## Naming Conventions

### General Rules
- **PascalCase**: Components, interfaces, types, enums
- **camelCase**: Variables, functions, props, hooks
- **snake_case**: File names, environment variables, database fields
- **UPPER_CASE**: Constants, environment variables

### Specific Examples
```typescript
// Components
const UserProfile = () => {}
const JsonTreeView: React.FC<JsonTreeViewProps> = () => {}

// Interfaces
interface ProfileRecord {
  id: string
  name: string
  createdAt: Date
}

// Variables
const userProfile: ProfileRecord | null = null
const isLoading = false

// Functions
const getUserProfile = async (id: string): Promise<ProfileRecord> => {}
const handleSave = () => {}

// Constants
const MAX_ATTEMPTS = 5
const API_BASE_URL = 'https://api.example.com'
```

## Styling Standards

### Tailwind CSS v4
- Use Tailwind classes for all styling
- No CSS files or inline styles
- Utility-first approach
- Custom theme configuration in `tailwind.config.ts`

### Color System
- Use semantic color names: `bg-primary`, `text-error`
- Define custom colors in theme: `primary`, `secondary`, `accent`
- Maintain contrast ratios > 4.5:1 for accessibility

### Component Styling
```typescript
// Good - Using Tailwind classes
<button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">

// Bad - Custom CSS or inline styles
<button style={{ backgroundColor: '#3b82f6', padding: '0.5rem 1rem' }}>
```

## State Management Standards

### Context Usage
- Use contexts for global state (AISettings, Auth)
- Create custom hooks for context consumption
- Avoid direct context usage in components

### Local State
- Use `useState` for component-local state
- Use `useReducer` for complex state logic
- Memoize expensive computations with `useMemo`

### State Updates
- Always use functional updates for state dependencies:
```typescript
setCount(prevCount => prevCount + 1)
```

## Error Handling Standards

### Error Boundaries
- Implement error boundaries for feature components
- Log errors to monitoring service
- Provide user-friendly error messages

### API Error Handling
- Try-catch blocks for all API calls
- Use specific error types
- Implement retry logic for transient errors

### User-Friendly Errors
```typescript
// Good - User-friendly message
throw new Error('Failed to load AI models. Please check your connection.')

// Bad - Technical details
throw new Error('NetworkError: Failed to fetch https://api.openai.com/v1/models')
```

## Performance Standards

### Code Splitting
- Use dynamic imports for heavy components
- Route-based code splitting with Next.js
- Lazy load non-critical features

### Memoization
- Memoize components with React.memo when appropriate
- Use useMemo for expensive computations
- Use useCallback for stable function references

### Loading States
- Implement loading states for all async operations
- Use skeleton screens for better UX
- Debounce rapid user inputs

## Security Standards

### Input Validation
- Validate all user inputs
- Sanitize data before display
- Use TypeScript types for compile-time checking

### API Key Security
- Never hardcode API keys
- Use environment variables for configuration
- Encrypt sensitive data in localStorage

### Authentication
- Hash passwords with SHA-256
- Implement rate limiting
- Use secure session management

## Testing Standards

### Test Structure
- Maintain >80% test coverage
- Unit tests for utilities and hooks
- Integration tests for components
- E2E tests for critical flows

### Testing Libraries
- Use React Testing Library for component tests
- Use Jest for unit tests
- Use Playwright for E2E tests

### Test Organization
```typescript
// Component test
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Documentation Standards

### Code Comments
- Avoid inline comments for self-explanatory code
- Use JSDoc for complex functions and interfaces
- Document all public APIs

### JSDoc Format
```typescript
/**
 * Fetches AI models from the specified provider
 * @param providerId - The provider identifier
 * @returns Promise resolving to array of available models
 * @throws Error if request fails
 */
export const fetchModels = async (providerId: string): Promise<Model[]> => {
  // Implementation
}
```

## Git Standards

### Commit Messages
- Use conventional commits format: `feat: add new feature`
- Keep messages concise and descriptive
- Include scope when relevant: `feat(ai): add OpenAI provider`

### Branch Naming
- Use feature branches: `feature/json-viewer-improvement`
- Use bugfix branches: `bugfix/fix-null-error`
- Use prefix for branches: `hotfix/critical-security-patch`

### Pull Requests
- Include detailed description of changes
- Link to relevant issues
- Ensure all tests pass
- Update documentation if needed

## Code Review Checklist

### Quality Checks
- [ ] TypeScript compilation passes
- [ ] ESLint rules pass
- [ ] Tests pass and coverage maintained
- [ ] Component follows naming conventions
- [ ] Proper error handling implemented
- [ ] Loading states provided
- [ ] Accessibility considerations addressed
- [ ] Performance optimizations applied
- [ ] Security best practices followed
- [ ] Documentation updated if needed

### Review Process
1. Automated checks (CI/CD)
2. Peer review
3. Lead review
4. Merge to development branch

## Continuous Integration

### Build Pipeline
1. Lint check: `bun run lint`
2. Type check: `bun run type-check`
3. Test suite: `bun run test`
4. Build application: `bun run build`

### Quality Gates
- 0 lint errors
- 0 type errors
- 80%+ test coverage
- No security vulnerabilities

## Tools and Configuration

### VS Code Settings
```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### ESLint Configuration
```javascript
import { defineConfig } from 'eslint-define-config'

export default defineConfig({
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
})
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Conclusion

Following these standards ensures consistency, maintainability, and quality across the codelessshipmore project. All developers should familiarize themselves with these conventions and follow them in all code contributions.