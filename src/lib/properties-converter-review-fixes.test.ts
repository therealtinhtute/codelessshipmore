import { describe, expect, test } from "bun:test"
import {
  canConvertToK8s,
  getConversionOutputFilename,
  getK8sConversionMode,
} from "@/lib/tool-ui-config"

describe("review fix helpers", () => {
  test("only allows K8s conversion for yaml-to-env mode", () => {
    expect(canConvertToK8s("yaml-to-env", "value")).toBe(true)
    expect(canConvertToK8s("spring-to-env", "value")).toBe(false)
    expect(canConvertToK8s("yaml-to-env", "   ")).toBe(false)
  })

  test("uses yaml-to-k8s-env conversion mode for K8s exports", () => {
    expect(getK8sConversionMode()).toBe("yaml-to-k8s-env")
  })

  test("returns user-facing download filenames by conversion mode", () => {
    expect(getConversionOutputFilename("yaml-to-env")).toBe("output.env")
    expect(getConversionOutputFilename("spring-to-env")).toBe("output.env")
    expect(getConversionOutputFilename("yaml-to-properties")).toBe("output.properties")
    expect(getConversionOutputFilename("properties-to-yaml")).toBe("output.yaml")
    expect(getConversionOutputFilename("yaml-to-k8s-env")).toBe("k8s-env.yaml")
  })
})
