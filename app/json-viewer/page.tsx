import { JsonViewer } from "@/components/features/json-viewer"
import { PageContainer } from "@/components/layout/page-container"

export default function JsonViewerPage() {
  return (
    <PageContainer
      title="JSON Viewer"
      description="Format and explore JSON data with interactive viewing"
    >
      <JsonViewer />
    </PageContainer>
  )
}