import type { ProviderId } from "@/lib/ai/providers"
import type { ConversionMode } from "@/lib/properties-utils"

const JSON_EXAMPLES = [
  {
    label: "Simple Object",
    content: `{"name":"John Doe","age":30,"email":"john@example.com","active":true}`,
  },
  {
    label: "Nested Object",
    content: `{"user":{"id":1,"profile":{"name":"Alice","settings":{"theme":"dark"}}},"roles":["admin","user"]}`,
  },
  {
    label: "API Response",
    content: `{"status":"success","data":{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}],"total":2}}`,
  },
] as const

const PROMPT_OUTPUT_FORMATS = {
  "Creative Writing": ["Narrative", "Descriptive", "Dialogue-focused", "Scene-by-scene", "Character-driven"],
  Coding: ["Step-by-step", "Code-first", "Explained", "With comments", "Documented"],
  Analysis: ["Structured", "Comparative", "Critical", "Data-driven", "Executive summary"],
  Research: ["Academic", "Annotated", "Systematic review", "Literature review", "Detailed findings"],
  "General Tasks": ["Step-by-step", "Concise", "Detailed", "Structured", "Conversational"],
  Business: ["Executive summary", "Action-oriented", "Strategic", "Presentation-ready", "ROI-focused"],
  Education: ["Tutorial-style", "ELI5", "Progressive difficulty", "With exercises", "Interactive"],
} as const

const PROPERTIES_EXAMPLES: Partial<Record<ConversionMode, { label: string; content: string }>> = {
  "yaml-to-env": {
    label: "YAML Example",
    content: `app:
  redis:
    host: localhost
    port: 6379
  database:
    connection-url: jdbc:mysql://localhost:3306/db
    username: admin
server:
  port: 8080`,
  },
  "spring-to-env": {
    label: "Spring Example",
    content: `@Value("\${app.redis.host}")
private String redisHost;

@Value("\${app.redis.port:6379}")
private int redisPort;

@Value("\${database.connection-url}")
private String dbUrl;`,
  },
  "yaml-to-properties": {
    label: "YAML Example",
    content: `app:
  redis:
    host: localhost
    port: 6379
  database:
    connection-url: jdbc:mysql://localhost:3306/db
    username: admin
server:
  port: 8080`,
  },
  "properties-to-yaml": {
    label: "Properties Example",
    content: `abc.efg.gh-oo.makeNow
app.redis.hostName=localhost
server.connection-timeout=5000
database.pool.maxSize=10`,
  },
  "yaml-to-k8s-env": {
    label: "YAML Example",
    content: `app:
  redis:
    host: localhost
    port: 6379
  database:
    connection-url: jdbc:mysql://localhost:3306/db
    username: admin
server:
  port: 8080`,
  },
}

const DEFAULT_PROMPT_TARGET = "General Tasks"

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic (Claude)",
  google: "Google (Gemini)",
  "anthropic-custom": "Anthropic Custom",
  cerebras: "Cerebras",
  cliproxyapi: "CLIProxyAPI",
}

export function getJsonExampleContent(label: string) {
  return JSON_EXAMPLES.find((example) => example.label === label)?.content
}

export function getPromptOutputFormats(target: string): string[] {
  return [
    ...(PROMPT_OUTPUT_FORMATS[target as keyof typeof PROMPT_OUTPUT_FORMATS] ??
      PROMPT_OUTPUT_FORMATS[DEFAULT_PROMPT_TARGET]),
  ]
}

export function togglePromptPrinciple(principles: string[], principle: string) {
  return principles.includes(principle)
    ? principles.filter((item) => item !== principle)
    : [...principles, principle]
}

export function getPropertiesExample(mode: ConversionMode) {
  return PROPERTIES_EXAMPLES[mode]
}

export function getProviderDisplayName(providerId: ProviderId | string) {
  return PROVIDER_DISPLAY_NAMES[providerId] ?? providerId
}

export function canConvertToK8s(mode: ConversionMode, input: string) {
  return mode === "yaml-to-env" && Boolean(input.trim())
}

export function getK8sConversionMode(): ConversionMode {
  return "yaml-to-k8s-env"
}

export function getConversionOutputFilename(mode: ConversionMode) {
  switch (mode) {
    case "yaml-to-env":
    case "spring-to-env":
      return "output.env"
    case "yaml-to-properties":
      return "output.properties"
    case "properties-to-yaml":
      return "output.yaml"
    case "yaml-to-k8s-env":
      return "k8s-env.yaml"
  }
}

export { JSON_EXAMPLES, PROMPT_OUTPUT_FORMATS }
