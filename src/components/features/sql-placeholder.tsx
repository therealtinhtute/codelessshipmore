"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClipboard } from "@/hooks/use-clipboard"
import { extractBindings, replaceQueryParams, splitSQLAndLog } from "@/lib/sql-utils"
import { toast } from "sonner"
import { TextareaWithActions } from "./textarea-with-actions"

const defaultSqlQuery = `SELECT * FROM crash_scene_investigations WHERE accident_document_code = ? AND weather_condition_code = ? AND end_date_time >= ? AND end_date_time <= ?;`

export function SqlPlaceholder() {
  const [sqlQuery, setSqlQuery] = useState(defaultSqlQuery)
  const [paramText, setParamText] = useState("")
  const [filledQuery, setFilledQuery] = useState("")
  const { paste } = useClipboard()

  const fillQuery = () => {
    if (!sqlQuery || !paramText) {
      toast.error("Please provide both SQL query and parameters")
      return
    }

    try {
      const bindings = extractBindings(paramText)
      const result = replaceQueryParams(sqlQuery, bindings)
      setFilledQuery(result)
      toast.success("SQL query filled successfully!")
    } catch (error) {
      toast.error("Failed to fill SQL query")
      console.error(error)
    }
  }

  const handlePasteFromClipboard = async () => {
    const clipboardText = await paste()
    if (!clipboardText) return

    try {
      const { sqlQuery: sql, logHibernate } = splitSQLAndLog(clipboardText)

      if (sql) {
        setSqlQuery(sql)
        toast.success("SQL query extracted from clipboard")
      }

      if (logHibernate) {
        setParamText(logHibernate)
        const bindings = extractBindings(logHibernate)
        const result = replaceQueryParams(sql || sqlQuery, bindings)
        setFilledQuery(result)
        toast.success("Parameters extracted and SQL filled!")
      } else if (sql) {
        // If only SQL was pasted, just set the query
        setSqlQuery(sql)
      }
    } catch (error) {
      toast.error("Failed to process clipboard content")
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-screen gap-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePasteFromClipboard}>
          Paste then fill SQL
        </Button>
        <Button variant="outline" onClick={fillQuery}>
          Fill SQL Query
        </Button>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left Column - Input SQL (2/3) + Params SQL (1/3) */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Input SQL - 2/3 height */}
          <Card className="flex-[2] flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Input SQL</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <TextareaWithActions
                value={sqlQuery}
                onChange={setSqlQuery}
                showPaste={true}
                placeholder="Paste SQL script with ? placeholders"
              />
            </CardContent>
          </Card>

          {/* Params SQL - 1/3 height */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Params SQL</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <TextareaWithActions
                value={paramText}
                onChange={setParamText}
                showPaste={true}
                placeholder="Paste parameter list or Hibernate logs"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Result (100% height) */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Result</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <TextareaWithActions
              value={filledQuery}
              readOnly={true}
              placeholder="Filled SQL query will appear here..."
              className="max-h-full overflow-y-auto"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}