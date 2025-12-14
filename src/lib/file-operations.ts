export function downloadFile(content: string, filename: string, mimeType = "text/plain"): void {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function downloadJsonFile(data: any, filename: string): void {
  const content = JSON.stringify(data, null, 2)
  downloadFile(content, filename, "application/json")
}

export function downloadTextFile(content: string, filename: string): void {
  downloadFile(content, filename, "text/plain")
}