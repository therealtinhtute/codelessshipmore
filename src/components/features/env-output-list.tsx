"use client"

import { EnvLineItem } from "./env-line-item"
import { parseEnvOutput } from "@/lib/env-parser"

interface EnvOutputListProps {
    output: string
}

export function EnvOutputList({ output }: EnvOutputListProps) {
    const lines = parseEnvOutput(output)

    if (lines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <div className="text-4xl mb-2">🔄</div>
                <p>No output yet</p>
                <p className="text-sm">Convert properties to see results</p>
            </div>
        )
    }

    return (
        <div className="border rounded-lg max-h-[500px] overflow-y-auto">
            {lines.map((line, index) => (
                <EnvLineItem
                    key={`${line.key}-${index}`}
                    envKey={line.key}
                    value={line.value}
                    fullLine={line.fullLine}
                />
            ))}
        </div>
    )
}
