import { Suspense } from "react"
import { GithubDirectory } from "@/components/features/github-directory"
import { PageContainer } from "@/components/layout/page-container"

export default function GithubDirectoryPage() {
  return (
    <PageContainer
      title="GitHub Directory"
      description="Download a single folder from a GitHub repository as a ZIP — without cloning the whole repo"
    >
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <GithubDirectory />
      </Suspense>
    </PageContainer>
  )
}
