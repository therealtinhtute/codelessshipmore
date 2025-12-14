"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface UseAsyncOperationOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
}

export function useAsyncOperation<T = any>(options: UseAsyncOperationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await operation()
        setData(result)

        if (options.successMessage) {
          toast.success(options.successMessage)
        }

        if (options.onSuccess) {
          options.onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err as Error
        setError(error)

        if (options.errorMessage) {
          toast.error(options.errorMessage)
        } else {
          toast.error(error.message || "An error occurred")
        }

        if (options.onError) {
          options.onError(error)
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  }
}