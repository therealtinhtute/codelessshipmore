"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { IconCopy, IconClipboard } from "@tabler/icons-react"
import { useClipboard } from "@/hooks/use-clipboard"
import { toast } from "sonner"

interface TextareaWithActionsProps {
    value: string
    onChange?: (value: string) => void
    readOnly?: boolean
    showPaste?: boolean
    placeholder?: string
    className?: string
}

export function TextareaWithActions({
    value,
    onChange,
    readOnly = false,
    showPaste = false,
    placeholder,
    className = ""
}: TextareaWithActionsProps) {
    const { copy } = useClipboard()

    const handleCopy = () => {
        copy(value)
    }

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (!text) {
                toast.error("Clipboard is empty")
                return
            }
            onChange?.(text)
            toast.success("Pasted from clipboard")
        } catch (error) {
            toast.error("Clipboard access denied")
            console.error(error)
        }
    }

    return (
        <div className="relative h-full">
            <Textarea
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`h-full resize-none font-mono text-sm pr-28 overflow-y-auto ${className}`}
            />
            <div className="absolute top-2 right-2 flex gap-2 z-10">
                {showPaste && !readOnly && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePaste}
                        title="Paste from clipboard"
                    >
                        <IconClipboard className="h-4 w-4 mr-1" />
                        Paste
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                >
                    <IconCopy className="h-4 w-4 mr-1" />
                    Copy
                </Button>
            </div>
        </div>
    )
}
