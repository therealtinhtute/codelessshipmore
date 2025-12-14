import { RecordProtobuf } from "@/components/features/record-protobuf"
import { PageContainer } from "@/components/layout/page-container"

export default function RecordProtobufPage() {
  return (
    <PageContainer
      title="Record to Protobuf"
      description="Convert Java record classes to Protocol Buffer definitions"
    >
      <RecordProtobuf />
    </PageContainer>
  )
}