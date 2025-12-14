"use client"

import { Button } from "@/components/ui/button"
import { IconCopy } from "@tabler/icons-react"
import { useClipboard } from "@/hooks/use-clipboard"

interface EnvLineItemProps {
    envKey: string
    value: string
    fullLine: string
}

export function EnvLineItem({ envKey, value, fullLine }: EnvLineItemProps) {
    const { copy } = useClipboard()

    return (
        <div className="flex items-center gap-2 p-3 border-b last:border-b-0">
            {/* Key with hover group - absolute button with z-index */}
            <div className="group/key relative flex items-center">
                <code className="font-mono text-sm font-semibold text-primary pr-8">{envKey}</code>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-6 w-6 opacity-0 group-hover/key:opacity-100 transition-opacity z-10"
                    onClick={() => copy(envKey)}
                    title="Copy key"
                >
                    <IconCopy className="h-3 w-3" />
                </Button>
            </div>

            {/* Equals */}
            <span className="text-muted-foreground font-mono">=</span>

            {/* Value with hover group - absolute button with z-index */}
            <div className="group/value relative flex items-center flex-1 min-w-0">
                <code className="font-mono text-sm truncate pr-8" title={value}>
                    {value || <span className="text-muted-foreground italic">(empty)</span>}
                </code>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-6 w-6 opacity-0 group-hover/value:opacity-100 transition-opacity z-10"
                    onClick={() => copy(value)}
                    title="Copy value"
                >
                    <IconCopy className="h-3 w-3" />
                </Button>
            </div>

            {/* Copy Full Line - always visible, fixed at right end */}
            <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => copy(fullLine)}
                title="Copy entire line"
            >
                <IconCopy className="h-3 w-3 mr-1" />
                Copy Line
            </Button>
        </div>
    )
}
