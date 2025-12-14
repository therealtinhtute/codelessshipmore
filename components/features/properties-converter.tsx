"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAsyncOperation } from "@/hooks/use-async-operation"
import { useClipboard } from "@/hooks/use-clipboard"
import {
  convertProperties,
  type ConversionMode
} from "@/lib/properties-utils"
import { toast } from "sonner"
import { IconCopy, IconDownload, IconCloud } from "@tabler/icons-react"

const EXAMPLES = {
  yaml: `app:
  redis:
    host: localhost
    port: 6379
  database:
    connection-url: jdbc:mysql://localhost:3306/db
    username: admin
server:
  port: 8080`,
  spring: `@Value("\${app.redis.host}")
private String redisHost;

@Value("\${app.redis.port:6379}")
private int redisPort;

@Value("\${database.connection-url}")
private String dbUrl;`,
  properties: `abc.efg.gh-oo.makeNow
app.redis.hostName=localhost
server.connection-timeout=5000
database.pool.maxSize=10`
}

function ExampleButton({ content, label }: { content: string; label: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const event = new CustomEvent("loadExample", { detail: content })
        window.dispatchEvent(event)
      }}
    >
      Load {label}
    </Button>
  )
}

export function PropertiesConverter() {
  const [mode, setMode] = useState<ConversionMode>("yaml-to-env")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [k8sOutput, setK8sOutput] = useState("")
  const [k8sError, setK8sError] = useState<string | null>(null)
  const [showK8sModal, setShowK8sModal] = useState(false)

  const asyncOperation = useAsyncOperation({
    successMessage: "Conversion successful!",
    errorMessage: "Conversion failed"
  })
  const { copy } = useClipboard()

  // Listen for example load events
  useEffect(() => {
    const handleLoadExample = (e: CustomEvent) => {
      setInput(e.detail)
      toast.success("Example loaded!")
    }

    window.addEventListener("loadExample", handleLoadExample as EventListener)

    return () => {
      window.removeEventListener("loadExample", handleLoadExample as EventListener)
    }
  }, [])

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error("Please enter input text")
      return
    }

    asyncOperation.execute(async () => {
      const result = convertProperties(input, mode)
      setOutput(result)
      return result
    })
  }

  const handleK8sConversion = () => {
    if (!input.trim()) return

    setK8sError(null)
    setK8sOutput("")
    setShowK8sModal(true)

    try {
      const result = convertProperties(input, "yaml-to-k8s-env")
      setK8sOutput(result)
      toast.success("K8s conversion successful!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "K8s conversion failed"
      setK8sError(errorMessage)
    }
  }

  const handleCopy = async (text: string) => {
    await copy(text)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success(`${filename} downloaded!`)
  }

  const showK8sButton = (mode === "yaml-to-env" || mode === "spring-to-env") && input.trim()

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as ConversionMode)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="yaml-to-env">YAML to ENV</TabsTrigger>
          <TabsTrigger value="spring-to-env">Spring to ENV</TabsTrigger>
          <TabsTrigger value="yaml-to-properties">YAML to Properties</TabsTrigger>
          <TabsTrigger value="properties-to-yaml">Properties to YAML</TabsTrigger>
        </TabsList>

        <TabsContent value={mode} className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Input
                  <div className="flex gap-2">
                    {mode === "yaml-to-env" && (
                      <ExampleButton content={EXAMPLES.yaml} label="YAML Example" />
                    )}
                    {mode === "spring-to-env" && (
                      <ExampleButton content={EXAMPLES.spring} label="Spring Example" />
                    )}
                    {mode === "yaml-to-properties" && (
                      <ExampleButton content={EXAMPLES.yaml} label="YAML Example" />
                    )}
                    {mode === "properties-to-yaml" && (
                      <ExampleButton content={EXAMPLES.properties} label="Properties Example" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === "spring-to-env"
                      ? "Enter Spring @Value annotations or property keys..."
                      : mode === "properties-to-yaml"
                      ? "Enter Java properties..."
                      : "Enter YAML or properties..."
                  }
                  className="min-h-[400px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleConvert}
                    disabled={!input.trim() || asyncOperation.isLoading}
                  >
                    {asyncOperation.isLoading ? "Converting..." : "Convert"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInput("")
                      setOutput("")
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!output && !asyncOperation.error && (
                  <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                    <div className="text-4xl mb-2">🔄</div>
                    <p>No output yet</p>
                    <p className="text-sm">Convert properties to see results</p>
                  </div>
                )}

                {asyncOperation.error && (
                  <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <p className="text-sm text-destructive">{asyncOperation.error.message}</p>
                  </div>
                )}

                {output && !asyncOperation.error && (
                  <>
                    <Textarea
                      value={output}
                      readOnly
                      className="min-h-[400px] font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleCopy(output)}
                      >
                        <IconCopy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const filename = mode.includes("yaml") ? "output.yaml" : "output.properties"
                          handleDownload(output, filename)
                        }}
                      >
                        <IconDownload className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Kubernetes Conversion Button */}
      {showK8sButton && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Kubernetes Format</h3>
                <p className="text-sm text-muted-foreground">
                  Convert to Kubernetes environment variables format
                </p>
              </div>
              <Button onClick={handleK8sConversion}>
                <IconCloud className="h-4 w-4 mr-2" />
                Convert to K8s
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kubernetes Modal */}
      <Dialog open={showK8sModal} onOpenChange={setShowK8sModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Kubernetes Environment Variables</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {k8sError ? (
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                <p className="text-sm text-destructive">{k8sError}</p>
              </div>
            ) : (
              <>
                <Textarea
                  value={k8sOutput}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(k8sOutput)}
                  >
                    <IconCopy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(k8sOutput, "k8s-env.yaml")}
                  >
                    <IconDownload className="h-4 w-4 mr-2" />
                    Download YAML
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}