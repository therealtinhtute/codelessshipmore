# Vercel AI SDK Multi-Provider Patterns

**Research Date**: 2025-12-23
**Focus**: Multi-provider configuration, selection, and API key management

---

## Summary

The Vercel AI SDK provides a unified, provider-agnostic interface for working with multiple AI providers (OpenAI, Anthropic, Google, etc.) through standardized functions and a consistent API surface. Provider configuration uses custom instance creation functions (`createOpenAI`, `createAnthropic`, etc.) with API keys passed via constructor options or environment variables.

**Key Finding**: The SDK doesn't include a built-in provider registry pattern - developers implement provider selection through environment-based configuration, runtime model parameter switching, or custom React Context patterns.

---

## Pattern 1: Provider Instance Creation

**Source**: [Official AI SDK Documentation](https://ai-sdk.dev/providers/ai-sdk-providers/openai)

Each provider has a factory function that returns a configured provider instance:

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

**Why This Matters**:
- Foundation for multi-provider setups
- API keys default to environment variables but can be explicitly passed
- Each provider is independently configured

**Application to Current Codebase**:
- Current `useAI()` hook should use these factory functions
- Store API keys encrypted, decrypt at runtime, pass to factory
- Create provider instances dynamically based on selected profile/provider

---

## Pattern 2: Runtime Provider Switching via Model Parameter

**Source**: [AI SDK Providers and Models](https://ai-sdk.dev/docs/foundations/providers-and-models)

The primary switching mechanism is through the `model` parameter in `generateText`/`streamText`:

```typescript
const model = useOpenAI ? openai('gpt-4') : anthropic('claude-3-opus');

const result = await generateText({
  model: model,
  prompt: 'Hello'
});
```

**Why This Matters**:
- Unified API means the rest of your code remains unchanged
- Provider selection is isolated to model parameter
- Easy to implement conditional logic for provider switching

**Application to Current Codebase**:
- `useAI()` hook's `generate()` function should accept a provider parameter
- Use AISettingsContext to get current profile/provider configuration
- Switch model parameter based on user selection

---

## Pattern 3: Environment-Based Provider Configuration

**Source**: [ChatGPT-Next-Web Repository](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)

Production applications use environment variables for each provider's API key:

```typescript
// Environment variables for multiple providers
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_API_KEY=xxx

// Provider selection logic
const getModel = () => {
  const provider = process.env.AI_PROVIDER || 'openai';
  switch (provider) {
    case 'openai': return openai(process.env.OPENAI_MODEL);
    case 'anthropic': return anthropic(process.env.ANTHROPIC_MODEL);
  }
};
```

**Why This Matters**:
- Deployment-time provider selection without code changes
- Separates configuration from code
- Standard pattern for production apps

**Application to Current Codebase**:
- Current approach (localStorage + encryption) is more flexible than env vars
- Env vars are server-side; your client-side storage allows per-user configuration
- For server-side API routes, consider env var fallback

---

## Pattern 4: OpenAI-Compatible Custom Provider

**Source**: [OpenAI-Compatible Provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai-compatible)

For custom providers implementing the OpenAI API format (Cerebras, Groq, self-hosted):

```typescript
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const cerebras = createOpenAICompatible({
  name: 'cerebras',
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: 'https://api.cerebras.ai/v1'
});
```

**Why This Matters**:
- Enables integration of any OpenAI-compatible endpoint
- Same unified interface as official providers
- Supports custom base URLs for proxies or self-hosted models

**Application to Current Codebase**:
- You already support custom OpenAI-compatible providers ✅
- Store `baseURL` in `ProviderConfigRecord`
- Use `createOpenAICompatible` for custom providers in factory function

---

## Pattern 5: Provider Fallback for Reliability

**Source**: [Vercel AI Repository](https://github.com/vercel/ai)

Implementing provider fallback for high availability:

```typescript
async function callWithFallback(prompt) {
  const providers = [
    { provider: openai, model: 'gpt-4' },
    { provider: anthropic, model: 'claude-3-opus' },
    { provider: google, model: 'gemini-pro' }
  ];

  for (const { provider, model } of providers) {
    try {
      return await generateText({ model: provider(model), prompt });
    } catch (error) {
      continue;
    }
  }

  throw new Error('All providers failed');
}
```

**Why This Matters**:
- Production systems need high availability
- Automatic failover if primary provider is down
- Useful for rate limiting scenarios

**Application to Current Codebase**:
- Consider adding fallback provider configuration to profiles
- Implement retry logic with secondary provider
- Add UI indicator when fallback provider is used

---

## Pattern 6: Provider Configuration Options

**Source**: [OpenAI Provider Reference](https://ai-sdk.dev/providers/ai-sdk-providers/openai)

All provider factory functions accept common configuration:

```typescript
const openai = createOpenAI({
  apiKey: 'sk-...',
  baseURL: 'https://api.openai.com/v1',
  organization: 'org-123',
  headers: { 'custom-header': 'value' },
  fetch: customFetchImplementation
});
```

**Configuration Options**:
- `apiKey`: Authentication (required)
- `baseURL`: Custom endpoints/proxies
- `headers`: Custom HTTP headers
- `fetch`: Middleware/testing/logging
- `organization`: Provider-specific options

**Why This Matters**:
- Standardization across all providers
- Easy to implement features like request logging or retry logic
- Supports proxies and custom middleware

**Application to Current Codebase**:
- Store additional config options in `ProviderConfigRecord`
- Consider adding custom headers support for enterprise users
- Implement request logging via custom `fetch` function

---

## Best Practices from Research

1. **API Key Security**:
   - Store API keys in environment variables (server-side)
   - For client-side apps, proxy API calls through backend
   - Never hardcode API keys in source code
   - ✅ Your current encryption approach is correct for client-side storage

2. **Provider Instantiation**:
   - Use `createProvider` functions for custom instances
   - Don't rely on default exports when multiple configurations needed
   - ✅ Implement provider factory function that takes profile/provider config

3. **Provider Selection**:
   - Implement selection through factory function or React Context
   - Keep application code provider-agnostic (only model parameter changes)
   - ✅ Your AISettingsContext approach aligns with best practices

4. **Client-Side Security**:
   - Proxy API calls through server-side routes (Next.js API routes, Edge functions)
   - Instantiate providers server-side to avoid exposing API keys
   - ⚠️ Consider moving provider instantiation to API routes for production

5. **Reliability**:
   - Implement provider fallback logic for production systems
   - Handle rate limiting with secondary providers
   - Add health checks before using providers

6. **Custom Providers**:
   - Use OpenAI-compatible provider for self-hosted models
   - Store custom `baseURL` with provider configuration
   - ✅ Your current architecture supports this

7. **Profile-Based Systems**:
   - Store provider configurations with encrypted API keys
   - Instantiate providers dynamically at runtime
   - ✅ Your current approach matches this pattern

---

## Recommendations for Current Codebase

### 1. Implement Provider Factory Function

Create `src/lib/ai/provider-factory.ts`:

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogle } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getDecryptedApiKey } from './encryption';
import type { ProviderConfigRecord } from '@/lib/storage/types';

export async function createProviderInstance(config: ProviderConfigRecord) {
  const apiKey = await getDecryptedApiKey(config.encryptedApiKey);

  switch (config.providerId) {
    case 'openai':
      return createOpenAI({ apiKey });

    case 'anthropic':
      return createAnthropic({ apiKey });

    case 'google':
      return createGoogle({ apiKey });

    case 'cerebras':
    case 'custom':
      return createOpenAICompatible({
        name: config.providerId,
        apiKey,
        baseURL: config.baseURL
      });

    default:
      throw new Error(`Unsupported provider: ${config.providerId}`);
  }
}
```

### 2. Update `useAI()` Hook

Modify `src/hooks/use-ai.ts` to use provider factory:

```typescript
import { createProviderInstance } from '@/lib/ai/provider-factory';
import { useAISettings } from '@/contexts/ai-settings-context';
import { generateText, streamText } from 'ai';

export function useAI(options?: { providerId?: string }) {
  const { currentProfile, getProviderConfig } = useAISettings();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getModel = async () => {
    const providerId = options?.providerId || currentProfile?.defaultProviderId;
    if (!providerId) throw new Error('No provider selected');

    const config = await getProviderConfig(providerId);
    if (!config) throw new Error('Provider not configured');

    const provider = await createProviderInstance(config);
    return provider(config.model || 'gpt-4');
  };

  const generate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const model = await getModel();
      const result = await generateText({ model, prompt });
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ... similar for chat, streamGenerate

  return { generate, chat, streamGenerate, isLoading, error };
}
```

### 3. Add Provider Caching

To avoid recreating instances on every call:

```typescript
// src/lib/ai/provider-cache.ts
const providerCache = new Map<string, any>();

export async function getCachedProviderInstance(config: ProviderConfigRecord) {
  const cacheKey = `${config.profileId}:${config.providerId}`;

  if (!providerCache.has(cacheKey)) {
    const instance = await createProviderInstance(config);
    providerCache.set(cacheKey, instance);
  }

  return providerCache.get(cacheKey);
}

export function clearProviderCache(profileId?: string) {
  if (profileId) {
    // Clear cache for specific profile
    for (const key of providerCache.keys()) {
      if (key.startsWith(`${profileId}:`)) {
        providerCache.delete(key);
      }
    }
  } else {
    // Clear all
    providerCache.clear();
  }
}
```

### 4. Consider Server-Side API Routes

For production security, move provider instantiation to server-side:

```typescript
// app/api/ai/generate/route.ts
import { createProviderInstance } from '@/lib/ai/provider-factory';
import { generateText } from 'ai';

export async function POST(request: Request) {
  const { prompt, providerId, apiKey } = await request.json();

  const config = { providerId, encryptedApiKey: apiKey, model: 'gpt-4' };
  const provider = await createProviderInstance(config);
  const model = provider('gpt-4');

  const result = await generateText({ model, prompt });

  return Response.json(result);
}
```

Then update client-side `useAI()` to call this API route instead of direct provider calls.

---

## Code Examples from Real-World Apps

### Vercel AI Chatbot
**Repository**: [vercel/ai-chatbot](https://github.com/vercel/ai-chatbot)

- Uses environment variables for provider selection
- Server-side provider instantiation in API routes
- Provider switching via UI dropdown that sets model parameter

### ChatGPT-Next-Web
**Repository**: [ChatGPTNextWeb/ChatGPT-Next-Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)

- Multi-provider support (OpenAI, Anthropic, Google, Azure)
- Client-side provider configuration with localStorage
- Server-side proxy for API calls
- Provider health checks before use

### Chatbot UI
**Repository**: [mckaywrigley/chatbot-ui](https://github.com/mckaywrigley/chatbot-ui)

- Profile-based provider management (similar to your approach)
- Supabase for encrypted storage
- Provider fallback logic
- Per-profile default provider

---

## Resources

### Official Documentation
- [AI SDK Providers and Models Overview](https://ai-sdk.dev/docs/foundations/providers-and-models)
- [OpenAI Provider Reference](https://ai-sdk.dev/providers/ai-sdk-providers/openai)
- [Anthropic Provider Reference](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic)
- [Google Generative AI Provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [OpenAI-Compatible Provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai-compatible)

### Code Examples
- [Vercel AI SDK Repository](https://github.com/vercel/ai)
- [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot)
- [ChatGPT-Next-Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)
- [Chatbot UI](https://github.com/mckaywrigley/chatbot-ui)

### Additional Resources
- [AI SDK useChat Hook Documentation](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [AI SDK Core Model Settings](https://ai-sdk.dev/docs/ai-sdk-core/settings)

---

## Key Takeaways

✅ **Your Current Architecture is Aligned**:
- Profile-based provider management matches production patterns
- Encrypted client-side storage is appropriate for client-only apps
- AISettingsContext approach is correct

⚠️ **Consider These Improvements**:
1. Implement provider factory function using Vercel AI SDK's `create[Provider]` functions
2. Add provider caching to avoid recreating instances
3. For production apps, move provider instantiation to server-side API routes
4. Implement provider fallback logic for reliability
5. Add provider health checks before use

🎯 **Next Steps**:
- Proceed to Phase 2: Research AI IDE UI patterns for displaying provider lists
- Use findings from Phase 1 to inform storage and hook implementation
- Document UI patterns that complement these provider management patterns
