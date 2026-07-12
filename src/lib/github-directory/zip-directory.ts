import type JSZip from "jszip"
import { buildZipFilename } from "./parse-url"

export async function createZip(): Promise<JSZip> {
  const JSZipModule = await import("jszip")
  const ZipCtor = JSZipModule.default
  return new ZipCtor()
}

export function addFileToZip(
  zip: JSZip,
  directory: string,
  filePath: string,
  blob: Blob,
) {
  const prefix = directory ? `${directory}/` : ""
  const relativePath = filePath.startsWith(prefix)
    ? filePath.slice(prefix.length)
    : filePath
  zip.file(relativePath, blob, { binary: true })
}

export async function generateZipBlob(zip: JSZip): Promise<Blob> {
  return zip.generateAsync({ type: "blob" })
}

export { buildZipFilename }
