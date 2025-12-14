export interface EnvLine {
    key: string
    value: string
    fullLine: string
}

export function parseEnvOutput(output: string): EnvLine[] {
    return output
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            const equalIndex = line.indexOf('=')
            if (equalIndex === -1) {
                // No equals sign, treat entire line as key with empty value
                return {
                    key: line.trim(),
                    value: '',
                    fullLine: line.trim()
                }
            }

            const key = line.substring(0, equalIndex).trim()
            const value = line.substring(equalIndex + 1).trim()

            return {
                key,
                value,
                fullLine: line.trim()
            }
        })
        .filter(line => line.key) // Filter out empty lines
}
