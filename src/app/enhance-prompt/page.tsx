"use client"

import { PageContainer } from "@/components/layout/page-container"
import { AuthGate } from "@/components/auth/auth-gate"

export default function EnhancePromptPage() {
  return (
    <AuthGate>
      <PageContainer
        title="Enhance Prompt"
        description="AI-powered prompt enhancement tool"
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium text-muted-foreground">
              Coming Soon
            </h2>
            <p className="text-sm text-muted-foreground/70 mt-1">
              This feature is under development.
            </p>
          </div>
        </div>
      </PageContainer>
    </AuthGate>
  )
}
