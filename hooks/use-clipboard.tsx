"use client"

import { useState } from "react"
import { copyToClipboard, pasteFromClipboard } from "@/lib/clipboard"
import { toast } from "sonner"

export function useClipboard() {
  const [isCopying, setIsCopying] = useState(false)
  const [isPasting, setIsPasting] = useState(false)

  const copy = async (text: string, successMessage = "Copied to clipboard!") => {
    setIsCopying(true)
    try {
      const success = await copyToClipboard(text)
      if (success) {
        toast.success(successMessage)
      } else {
        toast.error("Failed to copy to clipboard")
      }
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    } finally {
      setIsCopying(false)
    }
  }

  const paste = async (): Promise<string | null> => {
    setIsPasting(true)
    try {
      const text = await pasteFromClipboard()
      if (text) {
        toast.success("Pasted from clipboard")
        return text
      } else {
        toast.error("Failed to paste from clipboard")
        return null
      }
    } catch (error) {
      toast.error("Failed to paste from clipboard")
      return null
    } finally {
      setIsPasting(false)
    }
  }

  return {
    copy,
    paste,
    isCopying,
    isPasting,
  }
}