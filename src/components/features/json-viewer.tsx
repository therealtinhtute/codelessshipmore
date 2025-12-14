"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useClipboard } from "@/hooks/use-clipboard"
import { validateJson, prettyPrintJson, jsonToTree, toggleTreeNode, type JsonNode } from "@/lib/json-utils"
import { toast } from "sonner"
import { IconChevronDown, IconChevronRight, IconBraces, IconFolder } from "@tabler/icons-react"

const examples = [
  {
    label: "Simple Object",
    content: `{"name":"John Doe","age":30,"email":"john@example.com","active":true}`
  },
  {
    label: "Nested Object",
    content: `{"user":{"id":1,"profile":{"name":"Alice","settings":{"theme":"dark"}}},"roles":["admin","user"]}`
  },
  {
    label: "API Response",
    content: `{"status":"success","data":{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}],"total":2}}`
  }
]

function TreeNode({ node, onToggle }: { node: JsonNode; onToggle: (path: string) => void }) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = node.expanded

  const getTypeColor = (type: string) => {
    switch (type) {
      case "string":
        return "text-green-600 dark:text-green-400"
      case "number":
        return "text-blue-600 dark:text-blue-400"
      case "boolean":
        return "text-purple-600 dark:text-purple-400"
      case "null":
        return "text-gray-500 dark:text-gray-400"
      case "array":
        return "text-orange-600 dark:text-orange-400"
      case "object":
        return "text-indigo-600 dark:text-indigo-400"
      default:
        return "text-gray-900 dark:text-gray-100"
    }
  }

  const getValueDisplay = () => {
    if (node.type === "string") {
      return `"${node.value}"`
    }
    if (node.type === "null") {
      return "null"
    }
    if (node.type === "array") {
      return `Array[${node.children?.length || 0}]`
    }
    if (node.type === "object") {
      return `Object{${node.children?.length || 0}}`
    }
    return String(node.value)
  }

  return (
    <div>
      <div
        className={`flex items-center py-1 hover:bg-muted/50 cursor-pointer`}
        style={{ paddingLeft: `${node.depth * 20 + 8}px` }}
        onClick={() => hasChildren && onToggle(node.path)}>
        {hasChildren ? (
          isExpanded ? (
            <IconChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
          ) : (
            <IconChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
          )
        ) : (
          <div className="h-4 w-4 mr-1" />
        )}
        <span className="font-mono text-sm">
          {node.key !== "root" && <span className="text-muted-foreground">"{node.key}": </span>}
          <span className={getTypeColor(node.type)}>{getValueDisplay()}</span>
        </span>
      </div>
      {hasChildren && isExpanded && node.children && (
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
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [treeData, setTreeData] = useState<JsonNode[]>()
  const { copy } = useClipboard()

  const isValidJson = input.trim() ? validateJson(input).isValid : true

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

  const handleCopy = async () => {
    if (output) {
      await copy(output)
    }
  }

  const handleToggleNode = (path: string) => {
    if (treeData) {
      setTreeData(toggleTreeNode(treeData, path))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault()
      try {
        const formatted = prettyPrintJson(input)
        setInput(formatted)
        toast.success("JSON formatted!")
      } catch {
        toast.error("Invalid JSON")
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <IconBraces className="h-5 w-5" />
                JSON Input
              </CardTitle>
              <div className="flex items-center gap-2">
                <select
                  className="text-sm border rounded px-2 py-1 bg-background"
                  onChange={(e) => {
                    const example = examples.find((ex) => ex.label === e.target.value)
                    if (example) {
                      setInput(example.content)
                    }
                  }}
                  defaultValue="">
                  <option value="" disabled>Load example...</option>
                  {examples.map((example) => (
                    <option key={example.label} value={example.label}>
                      {example.label}
                    </option>
                  ))}
                </select>
                <Badge variant={isValidJson ? "default" : "destructive"}>
                  {isValidJson ? "Valid" : "Invalid"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Paste or type JSON here..."
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Tip: Press {(navigator.platform.includes("Mac") ? "Cmd" : "Ctrl")} + F to format
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={processJson} disabled={!input.trim() || isProcessing}>
                {isProcessing ? "Processing..." : "Process JSON"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInput("")
                  setOutput("")
                  setError(null)
                  setTreeData(undefined)
                }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <Tabs value={mode} onValueChange={(value) => setMode(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pretty-print" className="flex items-center gap-2">
                  <IconBraces className="h-4 w-4" />
                  Pretty Print
                </TabsTrigger>
                <TabsTrigger value="tree-view" className="flex items-center gap-2">
                  <IconFolder className="h-4 w-4" />
                  Tree View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!output && !error && (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <div className="text-4xl mb-2">📄</div>
                <p>No output yet</p>
                <p className="text-sm">Process valid JSON to see results</p>
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={handleCopy}>
                        Copy
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tree-view" className="mt-0">
                  {treeData ? (
                    <div className="min-h-[400px] max-h-[400px] overflow-auto border rounded-lg p-4">
                      {treeData.map((node, index) => (
                        <TreeNode key={`root-${index}`} node={node} onToggle={handleToggleNode} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                      <div className="text-4xl mb-2">🌳</div>
                      <p>No tree data</p>
                      <p className="text-sm">Process JSON to see tree view</p>
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