"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClipboard } from "@/hooks/use-clipboard"
import { extractBindings, replaceQueryParams, splitSQLAndLog } from "@/lib/sql-utils"
import { toast } from "sonner"

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">SQL Query</label>
              <Textarea
                className="min-h-[120px] font-mono text-sm"
                placeholder="Paste SQL script with ? placeholders"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parameters</label>
              <Textarea
                className="min-h-[120px] font-mono text-sm"
                placeholder="Paste parameter list or Hibernate logs"
                value={paramText}
                onChange={(e) => setParamText(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePasteFromClipboard}>
              Paste then fill SQL
            </Button>
            <Button variant="outline" onClick={fillQuery}>
              Fill SQL Query
            </Button>
          </div>
        </CardContent>
      </Card>

      {filledQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[120px] font-mono text-sm"
              value={filledQuery}
              readOnly
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}