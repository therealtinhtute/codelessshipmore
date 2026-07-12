import { describe, expect, test } from "bun:test"
import { buildZipFilename, getRepositoryPreview } from "./parse-url"

describe("getRepositoryPreview", () => {
  test("parses repo root", () => {
    expect(getRepositoryPreview("https://github.com/mrdoob/three.js")).toEqual({
      user: "mrdoob",
      repository: "three.js",
      parts: [],
      directory: "",
    })
  })

  test("parses tree directory path", () => {
    expect(
      getRepositoryPreview("https://github.com/mrdoob/three.js/tree/dev/build"),
    ).toEqual({
      user: "mrdoob",
      repository: "three.js",
      parts: ["dev", "build"],
      directory: "build",
    })
  })

  test("parses nested directory under branch", () => {
    expect(
      getRepositoryPreview(
        "https://github.com/user/repo/tree/main/src/lib/utils",
      ),
    ).toEqual({
      user: "user",
      repository: "repo",
      parts: ["main", "src", "lib", "utils"],
      directory: "src/lib/utils",
    })
  })

  test("rejects blob file URLs", () => {
    expect(
      getRepositoryPreview(
        "https://github.com/user/repo/blob/main/src/index.ts",
      ),
    ).toEqual({ error: "NOT_A_DIRECTORY" })
  })

  test("rejects non-repo URLs", () => {
    expect(getRepositoryPreview("https://github.com/")).toEqual({
      error: "NOT_A_REPOSITORY",
    })
    expect(getRepositoryPreview("not-a-url")).toEqual({
      error: "NOT_A_REPOSITORY",
    })
  })

  test("strips trailing slash", () => {
    expect(
      getRepositoryPreview("https://github.com/user/repo/tree/main/src/"),
    ).toEqual({
      user: "user",
      repository: "repo",
      parts: ["main", "src"],
      directory: "src",
    })
  })
})

describe("buildZipFilename", () => {
  test("uses custom filename and appends .zip", () => {
    expect(
      buildZipFilename({
        user: "a",
        repository: "b",
        directory: "c",
        customFilename: "my-pack",
      }),
    ).toBe("my-pack.zip")
  })

  test("keeps .zip on custom filename", () => {
    expect(
      buildZipFilename({
        user: "a",
        repository: "b",
        directory: "c",
        customFilename: "pack.zip",
      }),
    ).toBe("pack.zip")
  })

  test("builds default name from parts", () => {
    expect(
      buildZipFilename({
        user: "mrdoob",
        repository: "three.js",
        gitReference: "dev",
        directory: "build",
      }),
    ).toBe("mrdoob three.js dev build.zip")
  })
})
