interface JsonNode {
  key: string
  value: any
  type: "object" | "array" | "string" | "number" | "boolean" | "null"
  children?: JsonNode[]
  expanded?: boolean
  path: string
  depth: number
}

export function validateJson(jsonString: string): { isValid: boolean; error?: string } {
  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { isValid: false, error: errorMessage }
  }
}

export function prettyPrintJson(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed, null, 2)
  } catch {
    throw new Error("Invalid JSON input")
  }
}

export function jsonToTree(jsonString: string): JsonNode[] {
  try {
    const parsed = JSON.parse(jsonString)
    return [buildTreeNode("", parsed, "", 0)]
  } catch {
    throw new Error("Invalid JSON input")
  }
}

function buildTreeNode(key: string, value: any, path: string, depth: number): JsonNode {
  let nodeType: "object" | "array" | "string" | "number" | "boolean" | "null"
  let children: JsonNode[] | undefined = undefined

  if (value === null) {
    nodeType = "null"
  } else if (typeof value === "boolean") {
    nodeType = "boolean"
  } else if (typeof value === "number") {
    nodeType = "number"
  } else if (typeof value === "string") {
    nodeType = "string"
  } else if (Array.isArray(value)) {
    nodeType = "array"
    children = value.map((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`
      return buildTreeNode(index.toString(), item, itemPath, depth + 1)
    })
  } else if (typeof value === "object") {
    nodeType = "object"
    children = Object.entries(value).map(([k, v]) => {
      const itemPath = path ? `${path}.${k}` : k
      return buildTreeNode(k, v, itemPath, depth + 1)
    })
  } else {
    nodeType = "string"
  }

  return {
    key: key || "root",
    value,
    type: nodeType,
    path,
    depth,
    expanded: depth < 2,
    children
  }
}

export function toggleTreeNode(nodes: JsonNode[], path: string): JsonNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return { ...node, expanded: !node.expanded }
    }
    if (node.children) {
      return { ...node, children: toggleTreeNode(node.children, path) }
    }
    return node
  })
}

export { type JsonNode }