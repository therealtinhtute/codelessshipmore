"use client"

import { useState } from "react"
import { IconCheck, IconCopy, IconSettings, IconSparkles } from "@tabler/icons-react"
import { toast } from "sonner"

import { useAISettings, type ExtendedProviderId } from "@/contexts/ai-settings-context"
import { useAI } from "@/hooks/use-ai"
import { useClipboard } from "@/hooks/use-clipboard"
import type { ProviderId } from "@/lib/ai/providers"
import { getPromptOutputFormats, getProviderDisplayName } from "@/lib/tool-ui-config"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface PromptEnhancerProps {
  className?: string
}

const targets = [
  "Creative Writing",
  "Coding",
  "Analysis",
  "Research",
  "General Tasks",
  "Business",
  "Education",
]

const availablePrinciples = [
  "Think step-by-step",
  "Use examples",
  "Be specific",
  "Chain of thought",
  "Role-play expert",
]

const tones = ["Professional", "Casual", "Technical", "Friendly"]

export default function PromptEnhancer({ className }: PromptEnhancerProps) {
  const [originalPrompt, setOriginalPrompt] = useState("")
  const [target, setTarget] = useState("General Tasks")
  const [providerId, setProviderId] = useState<ProviderId | undefined>(undefined)
  const [outputFormat, setOutputFormat] = useState("Step-by-step")
  const [principles, setPrinciples] = useState<string[]>([])
  const [tone, setTone] = useState("Professional")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [showExplanation, setShowExplanation] = useState(false)
  const { copy, isCopying } = useClipboard()
  const { settings } = useAISettings()
  const { generate, isLoading, error } = useAI({ providerId })

  const activeProviderId = providerId ?? settings.enabledProviders[0]
  const activeProviderConfig = activeProviderId ? settings.providers[activeProviderId] : undefined
  const outputFormats = getPromptOutputFormats(target)

  const handleTargetChange = (nextTarget: string) => {
    setTarget(nextTarget)

    const nextOutputFormats = getPromptOutputFormats(nextTarget)
    if (!nextOutputFormats.includes(outputFormat)) {
      setOutputFormat(nextOutputFormats[0])
    }
  }

  const enhancePrompt = async () => {
    if (!originalPrompt.trim()) {
      toast.error("Please enter a prompt to enhance.")
      setEnhancedPrompt("")
      return
    }

    try {
      const providerName = activeProviderId
        ? getProviderDisplayName(activeProviderId)
        : "Default AI Model"

      const systemPrompt = `You are an expert prompt engineer. Your task is to enhance prompts for AI models to get better results.

Target Use Case: ${target}
Target AI Model: ${providerName}
Desired Output Format: ${outputFormat}
Tone: ${tone}
${principles.length > 0 ? `Enhancement Principles: ${principles.join(", ")}` : ""}

Enhance the user's prompt by:
1. Adding clear context and role-based framing appropriate for ${target}
2. Incorporating the desired output format (${outputFormat})
3. Applying the selected tone (${tone})
4. Including any selected enhancement principles
5. Optimizing for the ${providerName}
6. Making the instructions clear, specific, and actionable

IMPORTANT: Keep the core intent of the original prompt intact. Only enhance and clarify, don't change what the user is asking for.

Return ONLY the enhanced prompt, nothing else.`

      const enhanced = await generate({
        prompt: `${systemPrompt}\n\nOriginal prompt to enhance:\n\n${originalPrompt.trim()}`,
        temperature: 0.3,
      })

      setEnhancedPrompt(enhanced)
      toast.success("Prompt enhanced successfully!")
    } catch {
      toast.error(error || "Failed to enhance prompt. Please try again.")
    }
  }

  return (
    <div className={cn("grid h-full gap-6 md:grid-cols-2", className)}>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>Refine the prompt intent, tone, and output structure before sending it to your selected provider.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <FieldGroup className="flex-1 gap-4">
            <Field>
              <FieldLabel htmlFor="original-prompt">Your Prompt</FieldLabel>
              <Textarea
                id="original-prompt"
                value={originalPrompt}
                onChange={(event) => setOriginalPrompt(event.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-[160px] resize-none"
              />
            </Field>

            <Field>
              <FieldLabel>Target Use Case</FieldLabel>
              <ToggleGroup
                type="single"
                value={target}
                onValueChange={(value) => value && handleTargetChange(value)}
                variant="outline"
                className="flex-wrap"
              >
                {targets.map((option) => (
                  <ToggleGroupItem key={option} value={option} aria-label={option}>
                    {option}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ai-provider">AI Provider</FieldLabel>
                <Select
                  value={activeProviderId || ""}
                  onValueChange={(value: ExtendedProviderId) => setProviderId(value as ProviderId)}
                >
                  <SelectTrigger id="ai-provider" className="w-full">
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(settings.providers)
                        .filter(([, config]) => config?.enabled)
                        .map(([id]) => (
                          <SelectItem key={id} value={id}>
                            {getProviderDisplayName(id)}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {settings.enabledProviders.length === 0 && (
                  <FieldDescription>
                    <IconSettings data-icon="inline-start" />
                    Configure AI providers in <a href="/settings" className="underline underline-offset-4">Settings</a>.
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="ai-model">Model</FieldLabel>
                <Select value={activeProviderConfig?.model || ""} disabled>
                  <SelectTrigger id="ai-model" className="w-full">
                    <SelectValue placeholder="Select provider first" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {activeProviderConfig?.model && (
                        <SelectItem value={activeProviderConfig.model}>
                          {activeProviderConfig.model}
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <Field>
              <FieldLabel>Output Format</FieldLabel>
              <ToggleGroup
                type="single"
                value={outputFormat}
                onValueChange={(value) => value && setOutputFormat(value)}
                variant="outline"
                className="flex-wrap"
              >
                {outputFormats.map((option) => (
                  <ToggleGroupItem key={option} value={option} aria-label={option}>
                    {option}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel>Enhancement Principles</FieldLabel>
              <ToggleGroup
                type="multiple"
                value={principles}
                onValueChange={setPrinciples}
                variant="outline"
                className="flex-wrap"
              >
                {availablePrinciples.map((option) => (
                  <ToggleGroupItem key={option} value={option} aria-label={option}>
                    {option}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel>Tone</FieldLabel>
              <ToggleGroup
                type="single"
                value={tone}
                onValueChange={(value) => value && setTone(value)}
                variant="outline"
                className="flex-wrap"
              >
                {tones.map((option) => (
                  <ToggleGroupItem key={option} value={option} aria-label={option}>
                    {option}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>

          <Button
            onClick={enhancePrompt}
            disabled={isLoading || !originalPrompt.trim() || settings.enabledProviders.length === 0}
            className="w-full"
          >
            <IconSparkles data-icon="inline-start" className={cn(isLoading && "animate-spin")} />
            {isLoading ? "Enhancing..." : "Enhance Prompt"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Enhanced Prompt</CardTitle>
            <CardDescription>Copy the refined prompt directly or review a short explanation of what changed.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => enhancedPrompt && copy(enhancedPrompt, "Enhanced prompt copied to clipboard!")} disabled={!enhancedPrompt || isCopying}>
            {isCopying ? <IconCheck data-icon="inline-start" /> : <IconCopy data-icon="inline-start" />}
            {isCopying ? "Copied!" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="min-h-[400px] flex-1 overflow-y-auto rounded-lg border bg-muted/30 p-4">
            {enhancedPrompt ? (
              <pre className="whitespace-pre-wrap font-mono text-sm">{enhancedPrompt}</pre>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center text-center text-muted-foreground">
                <p>Your enhanced prompt will appear here.</p>
              </div>
            )}
          </div>

          {enhancedPrompt && (
            <FieldGroup className="gap-3">
              <Field orientation="horizontal" className="items-center justify-between rounded-lg border bg-muted/30 p-3">
                <Label htmlFor="show-explanation-toggle">Show explanation of changes</Label>
                <Toggle
                  id="show-explanation-toggle"
                  aria-label="Show explanation of changes"
                  aria-pressed={showExplanation}
                  variant="outline"
                  pressed={showExplanation}
                  onPressedChange={setShowExplanation}
                >
                  {showExplanation ? "On" : "Off"}
                </Toggle>
              </Field>

              {showExplanation && (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <h3 className="font-semibold">What was enhanced</h3>
                  <ul className="mt-2 ml-4 flex list-disc flex-col gap-1 text-muted-foreground">
                    <li>Added role-based context for <strong className="text-foreground">{target}</strong></li>
                    <li>Optimized for <strong className="text-foreground">{activeProviderId ? getProviderDisplayName(activeProviderId) : "selected AI model"}</strong></li>
                    <li>Applied <strong className="text-foreground">{outputFormat}</strong> formatting</li>
                    <li>Set tone to <strong className="text-foreground">{tone}</strong></li>
                    {principles.length > 0 && <li>Included principles: {principles.join(", ")}</li>}
                  </ul>
                </div>
              )}
            </FieldGroup>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
