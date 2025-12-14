type FormatRules = {
  [key: string]: (param: string) => string
}

const defaultRules: FormatRules = {
  null: () => "NULL",
  true: () => "1",
  false: () => "0",
  default: (param: string) => `'${param}'`
}

// Regular expressions for different date-time formats
const timestampRegexes = {
  fullTimestamp: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
  isoDateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/
}

function formatParam(param: string, customRules: FormatRules = {}): string {
  const rules = { ...defaultRules, ...customRules }

  if (param === "null") return rules.null(param)
  if (param === "true") return rules.true(param)
  if (param === "false") return rules.false(param)

  // Check for timestamp formats
  if (timestampRegexes.fullTimestamp.test(param)) {
    return `TIMESTAMP '${param}'`
  }

  if (timestampRegexes.isoDateTime.test(param)) {
    return `TIMESTAMP '${param}'`
  }

  return customRules[param] ? customRules[param](param) : rules.default(param)
}

export function extractBindings(log: string): string[] {
  if (!log) return []

  const regex = /binding parameter \[(\d+)\] as \[\w+\] - \[(.*?)\]/g
  const bindings: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(log)) !== null) {
    const value = match[2]
    bindings[Number(match[1]) - 1] = value
  }

  return bindings
}

export function replaceQueryParams(
  query: string,
  params: string[],
  customRules?: FormatRules
): string {
  if (!query) return ""

  let index = 0
  return query.replace(/\?/g, () => {
    const value = params[index++]
    return formatParam(value || "", customRules)
  })
}

export function splitSQLAndLog(input: string): { sqlQuery: string; logHibernate: string } {
  const lines = input.split("\n")
  let sqlQuery: string[] = []
  let logHibernate: string[] = []
  let foundLog = false

  for (const line of lines) {
    if (line.includes("org.hibernate.orm.jdbc.bind")) {
      foundLog = true
    }
    if (foundLog) {
      logHibernate.push(line)
    } else {
      sqlQuery.push(line)
    }
  }

  return {
    sqlQuery: sqlQuery.join("\n").trim(),
    logHibernate: logHibernate.join("\n").trim()
  }
}