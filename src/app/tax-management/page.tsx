'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Typography from '@/components/ui/typography'
import { getTaxManagementText } from '@/config/brand'
import { layout, typography } from '@/config/constants'
import { FileText, Calculator, Building2, Clock } from 'lucide-react'
import { NewsletterForm } from '@/components/ui/newsletter-form'

export default function TaxManagementPage() {
  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <Typography variant="h2" className="text-2xl text-foreground mb-1">
                {getTaxManagementText.title('ko')}
              </Typography>
              <Typography variant="body1" className="text-muted-foreground">
                {getTaxManagementText.subtitle('ko')}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 안내 카드 */}
      <Card className="border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className={typography.title.pageSection}>{getTaxManagementText.serviceTitle('ko')}</CardTitle>
          <CardDescription className={`${typography.text.base} mt-3`}>
            {getTaxManagementText.serviceDescription('ko')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* 뉴스레터 섹션 */}
          <div className="mb-6 p-6 bg-background/50 rounded-lg border border-muted">
            <div className="text-center mb-4">
              <p className={`${typography.text.base} text-muted-foreground`}>
                세무 서비스 업데이트 소식을 가장 먼저 받아보세요
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <NewsletterForm
                placeholder="이메일 주소"
                buttonText="구독"
                source="tax_management"
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className={`font-semibold ${typography.title.subsection} mb-4`}>{getTaxManagementText.plannedServices.title('ko')}</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* 종합소득세 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{getTaxManagementText.plannedServices.comprehensiveTax.title('ko')}</p>
                  <p className={typography.text.description}>
                    {getTaxManagementText.plannedServices.comprehensiveTax.description('ko')}
                  </p>
                </div>
              </div>

              {/* 법인세 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{getTaxManagementText.plannedServices.corporateTax.title('ko')}</p>
                  <p className={typography.text.description}>
                    {getTaxManagementText.plannedServices.corporateTax.description('ko')}
                  </p>
                </div>
              </div>

              {/* 부가가치세 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{getTaxManagementText.plannedServices.vat.title('ko')}</p>
                  <p className={typography.text.description}>
                    {getTaxManagementText.plannedServices.vat.description('ko')}
                  </p>
                </div>
              </div>

              {/* 세무 상담 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{getTaxManagementText.plannedServices.consultation.title('ko')}</p>
                  <p className={typography.text.description}>
                    {getTaxManagementText.plannedServices.consultation.description('ko')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <div className="flex gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">!</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className={`${typography.text.small} font-medium`}>{getTaxManagementText.comingSoon.title('ko')}</p>
                <p className="text-sm text-muted-foreground">
                  {getTaxManagementText.comingSoon.description('ko')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 특징 카드들 */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className={typography.title.subsection}>{getTaxManagementText.features.partnership.title('ko')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {getTaxManagementText.features.partnership.description('ko')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={typography.title.subsection}>{getTaxManagementText.features.automation.title('ko')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {getTaxManagementText.features.automation.description('ko')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={typography.title.subsection}>{getTaxManagementText.features.optimization.title('ko')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {getTaxManagementText.features.optimization.description('ko')}
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}