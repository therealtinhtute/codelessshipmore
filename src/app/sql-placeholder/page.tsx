import { SqlPlaceholder } from "@/components/features/sql-placeholder"
import { PageContainer } from "@/components/layout/page-container"

export default function SqlPlaceholderPage() {
  return (
    <PageContainer
      title="SQL Placeholder"
      description="Fill SQL query placeholders with parameter values from logs"
    >
      <SqlPlaceholder />
    </PageContainer>
  )
}