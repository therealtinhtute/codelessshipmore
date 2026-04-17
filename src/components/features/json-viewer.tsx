"use client"

import { useState } from "react"
import {
  IconBraces,
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconFileDescription,
  IconFolder,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useClipboard } from "@/hooks/use-clipboard"
import { getJsonExampleContent, JSON_EXAMPLES } from "@/lib/tool-ui-config"
import {
  jsonToTree,
  prettyPrintJson,
  toggleTreeNode,
  type JsonNode,
  validateJson,
} from "@/lib/json-utils"

function TreeNode({ node, onToggle }: { node: JsonNode; onToggle: (path: string) => void }) {
  const hasChildren = Boolean(node.children?.length)

  const getTypeClassName = (type: JsonNode["type"]) => {
    switch (type) {
      case "string":
        return "text-chart-2"
      case "number":
        return "text-chart-3"
      case "boolean":
        return "text-chart-4"
      case "null":
        return "text-muted-foreground"
      case "array":
        return "text-chart-1"
      case "object":
        return "text-primary"
      default:
        return "text-foreground"
    }
  }

  const getValueDisplay = () => {
    if (node.type === "string") return `"${node.value}"`
    if (node.type === "null") return "null"
    if (node.type === "array") return `Array[${node.children?.length || 0}]`
    if (node.type === "object") return `Object{${node.children?.length || 0}}`
    return String(node.value)
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={hasChildren ? Boolean(node.expanded) : undefined}
        className="flex w-full cursor-pointer items-center rounded-md py-1 text-left hover:bg-muted/50"
        style={{ paddingLeft: `${node.depth * 20 + 8}px` }}
        onClick={() => hasChildren && onToggle(node.path)}
      >
        {hasChildren ? (
          node.expanded ? (
            <IconChevronDown className="mr-1 size-4 text-muted-foreground" />
          ) : (
            <IconChevronRight className="mr-1 size-4 text-muted-foreground" />
          )
        ) : (
          <span className="mr-1 size-4" />
        )}
        <span className="font-mono text-sm">
          {node.key !== "root" && <span className="text-muted-foreground">&quot;{node.key}&quot;: </span>}
          <span className={getTypeClassName(node.type)}>{getValueDisplay()}</span>
        </span>
      </button>
      {hasChildren && node.expanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode key={`${child.path}-${index}`} node={child} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export function JsonViewer() {
  const [mode, setMode] = useState<"pretty-print" | "tree-view">("pretty-print")
  const [input, setInput] = useState("")
  const [selectedExample, setSelectedExample] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [treeData, setTreeData] = useState<JsonNode[]>()
  const { copy } = useClipboard()

  const isValidJson = input.trim() ? validateJson(input).isValid : true
  const formatShortcut = typeof navigator !== "undefined" && navigator.platform.includes("Mac") ? "Cmd" : "Ctrl"

  const processJson = async () => {
    if (!input.trim()) {
      toast.error("Please enter JSON data")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      if (mode === "pretty-print") {
        const result = prettyPrintJson(input)
        setOutput(result)
      } else {
        const result = jsonToTree(input)
        setTreeData(result)
        setOutput("Tree view generated successfully")
      }
      toast.success("JSON processed successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Processing failed"
      setError(errorMessage)
      setOutput("")
      setTreeData(undefined)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleNode = (path: string) => {
    if (treeData) {
      setTreeData(toggleTreeNode(treeData, path))
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "f") {
      event.preventDefault()
      try {
        setInput(prettyPrintJson(input))
        toast.success("JSON formatted!")
      } catch {
        toast.error("Invalid JSON")
      }
    }
  }

  const handleLoadExample = (label: string) => {
    const exampleContent = getJsonExampleContent(label)
    if (!exampleContent) return

    setSelectedExample(label)
    setInput(exampleContent)
  }

  const handleClear = () => {
    setInput("")
    setSelectedExample("")
    setOutput("")
    setError(null)
    setTreeData(undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card variant="claude">
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle variant="serif" className="flex items-center gap-2">
                  <IconBraces />
                  JSON Input
                </CardTitle>
                <CardDescription>Paste JSON, load an example, then format or inspect it as a tree.</CardDescription>
              </div>
              <Badge variant={isValidJson ? "default" : "destructive"}>
                {isValidJson ? "Valid" : "Invalid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="json-example">Example</FieldLabel>
                <Select value={selectedExample} onValueChange={handleLoadExample}>
                  <SelectTrigger id="json-example" className="w-full">
                    <SelectValue placeholder="Load example..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {JSON_EXAMPLES.map((example) => (
                        <SelectItem key={example.label} value={example.label}>
                          {example.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Paste or type JSON here..."
              className="min-h-[400px] font-mono text-sm"
            />

            <p className="text-xs text-muted-foreground">Tip: Press {formatShortcut} + F to format.</p>

            <div className="flex flex-wrap gap-2">
              <Button variant="claude-primary" onClick={processJson} disabled={!input.trim() || isProcessing}>
                <IconSparkles data-icon="inline-start" className={isProcessing ? "animate-spin" : undefined} />
                {isProcessing ? "Processing..." : "Process JSON"}
              </Button>
              <Button variant="claude" onClick={handleClear}>
                <IconTrash data-icon="inline-start" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="claude">
          <CardHeader>
            <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pretty-print">
                  <IconFileDescription data-icon="inline-start" />
                  Pretty Print
                </TabsTrigger>
                <TabsTrigger value="tree-view">
                  <IconFolder data-icon="inline-start" />
                  Tree View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {!output && !error && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                <IconFileDescription className="size-8" />
                <p className="mt-3 font-medium text-foreground">No output yet</p>
                <p className="text-sm">Process valid JSON to see results.</p>
              </div>
            )}

            {output && !error && (
              <Tabs value={mode} className="w-full">
                <TabsContent value="pretty-print" className="mt-0">
                  <div className="relative">
                    <Textarea
                      value={output === "Tree view generated successfully" ? "" : output}
                      readOnly
                      className="min-h-[400px] font-mono text-sm"
                    />
                    {output !== "Tree view generated successfully" && (
                      <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={() => copy(output)}>
                        <IconCopy data-icon="inline-start" />
                        Copy
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tree-view" className="mt-0">
                  {treeData ? (
                    <div className="max-h-[400px] min-h-[400px] overflow-auto rounded-lg border p-4">
                      {treeData.map((node, index) => (
                        <TreeNode key={`root-${index}`} node={node} onToggle={handleToggleNode} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                      <IconFolder className="size-8" />
                      <p className="mt-3 font-medium text-foreground">No tree data</p>
                      <p className="text-sm">Process JSON to inspect the tree view.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
