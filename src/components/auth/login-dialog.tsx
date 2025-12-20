"use client"

import { useState, useRef, useCallback, type KeyboardEvent } from "react"
import { IconLoader2 } from "@tabler/icons-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PIN_LENGTH = 6

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login } = useAuth()
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const resetForm = useCallback(() => {
    setDigits(Array(PIN_LENGTH).fill(""))
    setError(null)
  }, [])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (newOpen) {
      resetForm()
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
    onOpenChange(newOpen)
  }, [onOpenChange, resetForm])

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setError(null)

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "")
    if (pastedData.length === PIN_LENGTH) {
      setDigits(pastedData.split(""))
      inputRefs.current[PIN_LENGTH - 1]?.focus()
    }
  }

  const handleSubmit = async () => {
    const passcode = digits.join("")
    if (passcode.length !== PIN_LENGTH) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    const result = await login(passcode)
    setIsLoading(false)

    if (result.success) {
      onOpenChange(false)
    } else {
      setError(result.error || "Invalid passcode")
      setDigits(Array(PIN_LENGTH).fill(""))
      inputRefs.current[0]?.focus()
    }
  }

  const isComplete = digits.every((d) => d !== "")

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Enter Passcode</DialogTitle>
          <DialogDescription>
            Enter your 6-digit passcode to access protected features.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div
            className="flex justify-center gap-2"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="bg-input/20 dark:bg-input/30 border-input focus:border-ring focus:ring-ring/30 size-10 rounded-md border text-center text-lg font-mono outline-none focus:ring-2"
                disabled={isLoading}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
          {error && (
            <p className="text-destructive text-center text-xs">{error}</p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            className="w-full"
          >
            {isLoading && <IconLoader2 className="animate-spin" />}
            {isLoading ? "Verifying..." : "Login"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
