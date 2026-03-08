"use client"

import { IconFileText } from "@tabler/icons-react"

import { parseEnvOutput } from "@/lib/env-parser"

import { EnvLineItem } from "./env-line-item"

interface EnvOutputListProps {
  output: string
}

export function EnvOutputList({ output }: EnvOutputListProps) {
  const lines = parseEnvOutput(output)

  if (lines.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
        <IconFileText className="size-8" />
        <p className="mt-3 font-medium text-foreground">No output yet</p>
        <p className="text-sm">Convert properties to see results.</p>
      </div>
    )
  }

  return (
    <div className="max-h-[500px] overflow-y-auto rounded-lg border">
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
