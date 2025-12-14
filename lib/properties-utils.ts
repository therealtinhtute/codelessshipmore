import yaml from "js-yaml"

type ConversionMode = "yaml-to-env" | "spring-to-env" | "yaml-to-properties" | "properties-to-yaml" | "yaml-to-k8s-env"

function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = value.join(",")
    } else {
      flattened[newKey] = value
    }
  }

  return flattened
}

function parsePropertiesFormat(input: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = input.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
      continue
    }

    const match = trimmed.match(/^([^=:]+)[=:]\s*(.*)$/)
    if (match) {
      const [, key, value] = match
      setNestedProperty(result, key.trim(), value.trim())
    }
  }

  return result
}

function setNestedProperty(obj: any, path: string, value: string) {
  const keys = path.split(".")
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

function propertyKeyToEnvVar(key: string): string {
  return key.replace(/[.-]/g, "_").toUpperCase()
}

export function convertYamlToEnv(input: string): string {
  try {
    let parsed: any
    try {
      parsed = yaml.load(input)
    } catch {
      parsed = parsePropertiesFormat(input)
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid input format - expected YAML or properties format")
    }

    const flattened = flattenObject(parsed)
    const envVars: string[] = []

    for (const [key, value] of Object.entries(flattened)) {
      const envKey = propertyKeyToEnvVar(key)
      const envValue = value?.toString() || ""
      envVars.push(`${envKey}=${envValue}`)
    }

    return envVars.join("\n")
  } catch (error) {
    throw new Error(`YAML to environment variables conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function convertSpringToEnv(input: string): string {
  try {
    const properties = new Set<string>()

    const valueRegex = /@Value\s*\(\s*"\$\{([^}]+)\}"\s*\)/g
    let match
    let hasAnnotations = false

    while ((match = valueRegex.exec(input)) !== null) {
      hasAnnotations = true
      const fullProperty = match[1]
      const propertyKey = fullProperty.split(":")[0].trim()
      const defaultValue = fullProperty.includes(":")
        ? fullProperty.split(":").slice(1).join(":").trim()
        : ""

      properties.add(`${propertyKey}|${defaultValue}`)
    }

    if (!hasAnnotations) {
      const lines = input.split("\n")
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
          continue
        }

        let propertyKey = ""
        let defaultValue = ""

        if (trimmed.includes("=")) {
          const parts = trimmed.split("=")
          propertyKey = parts[0].trim()
          defaultValue = parts.slice(1).join("=").trim()
        } else if (trimmed.includes(":") && !trimmed.match(/^[a-zA-Z0-9._-]+:[a-zA-Z0-9._-]+$/)) {
          const colonIdx = trimmed.lastIndexOf(":")
          propertyKey = trimmed.substring(0, colonIdx).trim()
          defaultValue = trimmed.substring(colonIdx + 1).trim()
        } else {
          propertyKey = trimmed
        }

        if (propertyKey && propertyKey.match(/^[a-zA-Z0-9._-]+$/)) {
          properties.add(`${propertyKey}|${defaultValue}`)
        }
      }
    }

    if (properties.size === 0) {
      throw new Error("No properties found in the input. Enter @Value annotations or property keys")
    }

    const envVars: string[] = []
    for (const prop of properties) {
      const [propertyKey, defaultValue] = prop.split("|")
      const envKey = propertyKeyToEnvVar(propertyKey)
      envVars.push(`${envKey}=${defaultValue}`)
    }

    return envVars.join("\n")
  } catch (error) {
    throw new Error(`Spring to environment variables conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function convertYamlToProperties(input: string): string {
  try {
    const parsed = yaml.load(input)

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid YAML format")
    }

    const flattened = flattenObject(parsed)
    const properties: string[] = []

    for (const [key, value] of Object.entries(flattened)) {
      const propValue = value?.toString() || ""
      properties.push(`${key}=${propValue}`)
    }

    return properties.join("\n")
  } catch (error) {
    throw new Error(`YAML to properties conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function convertPropertiesToYaml(input: string): string {
  try {
    const parsed = parsePropertiesFormat(input)

    if (!parsed || Object.keys(parsed).length === 0) {
      throw new Error("No valid properties found")
    }

    const yamlOutput = yaml.dump(parsed, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: '"',
      forceQuotes: false
    })

    return yamlOutput
  } catch (error) {
    throw new Error(`Properties to YAML conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function convertYamlToK8sEnv(input: string): string {
  try {
    let parsed: any
    try {
      parsed = yaml.load(input)
    } catch {
      parsed = parsePropertiesFormat(input)
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid input format - expected YAML or properties format")
    }

    const flattened = flattenObject(parsed)
    const k8sEnvVars: string[] = []

    for (const [key, value] of Object.entries(flattened)) {
      const envKey = propertyKeyToEnvVar(key)

      if (!isValidK8sEnvName(envKey)) {
        throw new Error(`Invalid Kubernetes environment variable name: ${envKey}`)
      }

      const envValue = value?.toString() || ""
      k8sEnvVars.push(`- name: ${envKey}\n  value: '${envValue}'`)
    }

    return k8sEnvVars.join("\n")
  } catch (error) {
    throw new Error(`YAML to K8s environment variables conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function isValidK8sEnvName(name: string): boolean {
  if (name.length > 63) {
    return false
  }

  const k8sNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/
  return k8sNamePattern.test(name)
}

export function convertProperties(input: string, mode: ConversionMode): string {
  if (!input.trim()) {
    return ""
  }

  switch (mode) {
    case "yaml-to-env":
      return convertYamlToEnv(input)
    case "spring-to-env":
      return convertSpringToEnv(input)
    case "yaml-to-properties":
      return convertYamlToProperties(input)
    case "properties-to-yaml":
      return convertPropertiesToYaml(input)
    case "yaml-to-k8s-env":
      return convertYamlToK8sEnv(input)
    default:
      throw new Error(`Invalid conversion mode: ${mode}`)
  }
}

export type { ConversionMode }