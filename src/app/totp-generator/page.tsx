import { TotpGenerator } from "@/components/features/totp-generator"
import { PageContainer } from "@/components/layout/page-container"

export default function TotpGeneratorPage() {
  return (
    <PageContainer
      title="TOTP Generator"
      description="Generate the current 6-digit 2FA code from a raw Base32 secret"
    >
      <TotpGenerator />
    </PageContainer>
  )
}
