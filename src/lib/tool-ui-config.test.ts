import { describe, expect, test } from "bun:test"
import {
  getConversionOutputFilename,
  getJsonExampleContent,
  getPromptOutputFormats,
  getPropertiesExample,
  getProviderDisplayName,
} from "@/lib/tool-ui-config"

describe("tool-ui-config", () => {
  test("returns JSON example content by label", () => {
    expect(getJsonExampleContent("Simple Object")).toContain("John Doe")
    expect(getJsonExampleContent("Missing Example")).toBeUndefined()
  })

  test("returns prompt output formats for known and unknown targets", () => {
    expect(getPromptOutputFormats("Coding")).toContain("Code-first")
    expect(getPromptOutputFormats("Unknown Target")).toEqual(
      getPromptOutputFormats("General Tasks")
    )
  })

  test("returns mode-specific properties examples", () => {
    expect(getPropertiesExample("yaml-to-env")?.label).toBe("YAML Example")
    expect(getPropertiesExample("spring-to-env")?.label).toBe("Spring Example")
    expect(getPropertiesExample("properties-to-yaml")?.label).toBe("Properties Example")
    expect(getPropertiesExample("yaml-to-k8s-env")?.label).toBe("YAML Example")
  })

  test("returns provider display names with fallback", () => {
    expect(getProviderDisplayName("anthropic")).toBe("Anthropic (Claude)")
    expect(getProviderDisplayName("cliproxyapi")).toBe("CLIProxyAPI")
    expect(getProviderDisplayName("unknown-provider")).toBe("unknown-provider")
  })

  test("returns expected download filenames", () => {
    expect(getConversionOutputFilename("yaml-to-env")).toBe("output.env")
    expect(getConversionOutputFilename("spring-to-env")).toBe("output.env")
    expect(getConversionOutputFilename("yaml-to-properties")).toBe("output.properties")
    expect(getConversionOutputFilename("properties-to-yaml")).toBe("output.yaml")
  })
})
