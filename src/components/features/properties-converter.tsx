"use client"

import { useState } from "react"
import { IconCloud, IconCopy, IconDownload, IconFileText, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAsyncOperation } from "@/hooks/use-async-operation"
import { useClipboard } from "@/hooks/use-clipboard"
import { convertProperties, type ConversionMode } from "@/lib/properties-utils"
import {
  canConvertToK8s,
  getConversionOutputFilename,
  getK8sConversionMode,
  getPropertiesExample,
} from "@/lib/tool-ui-config"

import { EnvOutputList } from "./env-output-list"

function ExampleButton({ content, label, onLoad }: { content: string; label: string; onLoad: (content: string) => void }) {
  return (
    <Button variant="outline" size="sm" onClick={() => onLoad(content)}>
      <IconFileText data-icon="inline-start" />
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
    errorMessage: "Conversion failed",
  })
  const { copy } = useClipboard()

  const handleLoadExample = (content: string) => {
    setInput(content)
    toast.success("Example loaded!")
  }

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
      const result = convertProperties(input, getK8sConversionMode())
      setK8sOutput(result)
      toast.success("K8s conversion successful!")
    } catch (error) {
      setK8sError(error instanceof Error ? error.message : "K8s conversion failed")
    }
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

  const selectedExample = getPropertiesExample(mode)
  const showK8sButton = canConvertToK8s(mode, input)
  const outputFilename = getConversionOutputFilename(mode)

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as ConversionMode)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="yaml-to-env">YAML to ENV</TabsTrigger>
          <TabsTrigger value="spring-to-env">Spring to ENV</TabsTrigger>
          <TabsTrigger value="yaml-to-properties">YAML to Properties</TabsTrigger>
          <TabsTrigger value="properties-to-yaml">Properties to YAML</TabsTrigger>
        </TabsList>

        <TabsContent value={mode} className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle>Input</CardTitle>
                    <CardDescription>Paste YAML, Spring annotations, or Java properties and convert them with one click.</CardDescription>
                  </div>
                  {selectedExample && (
                    <ExampleButton
                      content={selectedExample.content}
                      label={selectedExample.label}
                      onLoad={handleLoadExample}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="properties-input">Source content</FieldLabel>
                    <FieldDescription>
                      {mode === "spring-to-env"
                        ? "Enter Spring @Value annotations or property keys."
                        : mode === "properties-to-yaml"
                          ? "Enter Java properties."
                          : "Enter YAML or Java properties."}
                    </FieldDescription>
                    <Textarea
                      id="properties-input"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={
                        mode === "spring-to-env"
                          ? "Enter Spring @Value annotations or property keys..."
                          : mode === "properties-to-yaml"
                            ? "Enter Java properties..."
                            : "Enter YAML or properties..."
                      }
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </Field>
                </FieldGroup>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleConvert} disabled={!input.trim() || asyncOperation.isLoading}>
                    {asyncOperation.isLoading ? "Converting..." : "Convert"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInput("")
                      setOutput("")
                    }}
                  >
                    <IconTrash data-icon="inline-start" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Output</CardTitle>
                  <CardDescription>Copy the converted result or download it as a file when ready.</CardDescription>
                </div>
                {output && !asyncOperation.error && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => copy(output)}>
                      <IconCopy data-icon="inline-start" />
                      Copy All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(output, outputFilename)}>
                      <IconDownload data-icon="inline-start" />
                      Download
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!output && !asyncOperation.error && (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                    <IconFileText className="size-8" />
                    <p className="mt-3 font-medium text-foreground">No output yet</p>
                    <p className="text-sm">Convert properties to see results.</p>
                  </div>
                )}

                {asyncOperation.error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {asyncOperation.error.message}
                  </div>
                )}

                {output && !asyncOperation.error && (
                  mode === "yaml-to-env" || mode === "spring-to-env" ? (
                    <EnvOutputList output={output} />
                  ) : (
                    <Textarea
                      value={output}
                      readOnly
                      className="min-h-[400px] font-mono text-sm"
                    />
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showK8sButton && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex flex-col gap-1">
              <h3 className="font-medium">Kubernetes Format</h3>
              <p className="text-sm text-muted-foreground">
                Convert the current YAML input into Kubernetes environment variable entries.
              </p>
            </div>
            <Button onClick={handleK8sConversion}>
              <IconCloud data-icon="inline-start" />
              Convert to K8s
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showK8sModal} onOpenChange={setShowK8sModal}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle>Kubernetes Environment Variables</DialogTitle>
            <DialogDescription>Review the generated entries before copying or downloading the YAML file.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {k8sError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                {k8sError}
              </div>
            ) : (
              <>
                <Textarea
                  value={k8sOutput}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => copy(k8sOutput)}>
                    <IconCopy data-icon="inline-start" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload(k8sOutput, getConversionOutputFilename(getK8sConversionMode()))}>
                    <IconDownload data-icon="inline-start" />
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
