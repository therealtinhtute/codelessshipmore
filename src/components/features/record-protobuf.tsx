"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsyncOperation } from "@/hooks/use-async-operation"
import { downloadTextFile } from "@/lib/file-operations"
import {
  cleanJavaRecord,
  convertJavaRecordToProto,
  convertJavaInterfaceToProto,
  normalizeProtoFieldOrder,
  convertInterfaceToNewFormat,
  type ProtoType
} from "@/lib/protobuf-utils"
import { toast } from "sonner"

export function RecordProtobuf() {
  const [javaCode, setJavaCode] = useState("")
  const [cleanedJava, setCleanedJava] = useState("")
  const [protoCode, setProtoCode] = useState("")
  const asyncOperation = useAsyncOperation({
    successMessage: "Conversion successful!",
    errorMessage: "Failed to convert code"
  })

  const performConversion = (type: ProtoType): string => {
    switch (type) {
      case "clean":
        return cleanJavaRecord(javaCode)
      case "record":
        return convertJavaRecordToProto(cleanedJava || javaCode)
      case "interface":
        return convertJavaInterfaceToProto(javaCode)
      case "standardize":
        return convertInterfaceToNewFormat(javaCode)
      case "sort":
        return normalizeProtoFieldOrder(javaCode)
      default:
        throw new Error(`Invalid conversion type: ${type}`)
    }
  }

  const handleConvert = (type: ProtoType) => {
    if (!javaCode.trim()) {
      toast.error("Please enter Java code")
      return
    }

    asyncOperation.execute(async () => {
      const result = performConversion(type)

      if (type === "clean") {
        setCleanedJava(result)
      } else if (type === "record" || type === "interface" || type === "sort") {
        setProtoCode(result)
      } else {
        setCleanedJava(result)
      }

      return result
    })
  }

  const handleDownload = () => {
    if (!protoCode.trim()) {
      toast.error("No protobuf code to download")
      return
    }
    downloadTextFile(protoCode, "converted.proto")
    toast.success("Protobuf file downloaded!")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="claude-primary" onClick={() => handleConvert("clean")}>
          Clean
        </Button>
        <Button variant="claude" onClick={() => handleConvert("record")}>
          Convert Record
        </Button>
        <Button variant="claude" onClick={() => handleConvert("interface")}>
          Convert Interface
        </Button>
        <Button variant="claude" onClick={() => handleConvert("standardize")}>
          Standardize
        </Button>
        <Button variant="claude" onClick={() => handleConvert("sort")}>
          Sort
        </Button>
      </div>

      <div className="grid min-h-[600px] grid-cols-1 lg:grid-cols-2 gap-4">
        <Card variant="claude">
          <CardHeader>
            <CardTitle variant="serif">Java Record Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter Java 17 record class..."
              value={javaCode}
              className="min-h-[500px] font-mono text-sm"
              onChange={(e) => setJavaCode(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {cleanedJava && (
            <Card variant="claude">
              <CardHeader>
                <CardTitle variant="serif">Cleaned Java</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  value={cleanedJava}
                  readOnly
                />
                <Button variant="claude-primary" onClick={() => handleConvert("record")}>
                  Convert to Proto
                </Button>
              </CardContent>
            </Card>
          )}

          {protoCode && (
            <Card variant="claude">
              <CardHeader>
                <CardTitle variant="serif">Protocol Buffer Definition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  value={protoCode}
                  readOnly
                />
                <Button variant="claude-primary" onClick={handleDownload}>
                  Download .proto
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}