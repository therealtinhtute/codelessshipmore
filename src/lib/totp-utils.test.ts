import { describe, expect, test } from "bun:test"
import { decodeBase32Secret, generateTotpCode, getTotpSecondsRemaining, isValidBase32Secret } from "@/lib/totp-utils"

describe("totp-utils", () => {
  test("decodes valid Base32 secrets", () => {
    expect(decodeBase32Secret("JBSWY3DPEHPK3PXP").length).toBeGreaterThan(0)
  })

  test("validates normalized Base32 secrets", () => {
    expect(isValidBase32Secret("JBSWY3DPEHPK3PXP")).toBe(true)
    expect(isValidBase32Secret("jbsw y3dp-ehpk3pxp")).toBe(true)
    expect(isValidBase32Secret("INVALID-SECRET-1")).toBe(false)
    expect(isValidBase32Secret("ABC")).toBe(false)
  })

  test("rejects invalid Base32 input", () => {
    expect(() => decodeBase32Secret("INVALID-SECRET-1")).toThrow()
    expect(() => decodeBase32Secret("ABC")).toThrow()
    expect(() => decodeBase32Secret("ABCD=EFG")).toThrow()
  })

  test("calculates remaining TOTP seconds", () => {
    expect(getTotpSecondsRemaining(0)).toBe(30)
    expect(getTotpSecondsRemaining(29_000)).toBe(1)
    expect(getTotpSecondsRemaining(30_000)).toBe(30)
  })

  test("generates RFC-aligned TOTP codes", async () => {
    const rfcTestSecret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"
    await expect(generateTotpCode(rfcTestSecret, 59_000)).resolves.toBe("287082")
  })
})
