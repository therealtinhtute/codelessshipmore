import { describe, expect, test } from "bun:test"
import { parseSavedTotpEntries } from "@/lib/totp-saved-entries"

describe("totp-saved-entries", () => {
  test("loads valid stored entries", () => {
    const validEntries = parseSavedTotpEntries(JSON.stringify([
      {
        id: "entry-1",
        name: "Personal",
        secret: "JBSWY3DPEHPK3PXP",
        createdAt: "2026-03-08T00:00:00.000Z"
      }
    ]))

    expect(validEntries).toHaveLength(1)
    expect(validEntries[0]?.name).toBe("Personal")
  })

  test("returns empty list for null and invalid JSON", () => {
    expect(parseSavedTotpEntries(null)).toEqual([])
    expect(parseSavedTotpEntries("not-json")).toEqual([])
  })

  test("returns empty list for non-array payloads", () => {
    expect(parseSavedTotpEntries(JSON.stringify({ id: "not-an-array" }))).toEqual([])
  })

  test("rejects malformed entries", () => {
    expect(
      parseSavedTotpEntries(JSON.stringify([{ id: "1", name: "", secret: "ABC", createdAt: "date" }]))
    ).toEqual([])
  })

  test("rejects invalid Base32 secrets", () => {
    expect(
      parseSavedTotpEntries(JSON.stringify([{ id: "1", name: "Personal", secret: "ABC", createdAt: "2026-03-08T00:00:00.000Z" }]))
    ).toEqual([])
  })

  test("rejects invalid timestamps", () => {
    expect(
      parseSavedTotpEntries(JSON.stringify([{ id: "1", name: "Personal", secret: "JBSWY3DPEHPK3PXP", createdAt: "not-a-date" }]))
    ).toEqual([])
  })

  test("fails safely when any stored entry is invalid", () => {
    expect(parseSavedTotpEntries(JSON.stringify([
      { id: "1", name: "Personal", secret: "JBSWY3DPEHPK3PXP", createdAt: "2026-03-08T00:00:00.000Z" },
      { id: "2", name: "Broken", secret: "ABC", createdAt: "2026-03-08T00:00:00.000Z" }
    ]))).toEqual([])
  })
})
