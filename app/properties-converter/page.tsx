import { PropertiesConverter } from "@/components/features/properties-converter"
import { PageContainer } from "@/components/layout/page-container"

export default function PropertiesConverterPage() {
  return (
    <PageContainer
      title="Properties Converter"
      description="Convert between YAML, Properties, Spring @Value, and Environment variables"
    >
      <PropertiesConverter />
    </PageContainer>
  )
}