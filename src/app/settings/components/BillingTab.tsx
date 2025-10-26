"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { uiText } from '@/config/brand'

/**
 * 결제 탭 컴포넌트
 * 결제 수단 및 결제 내역 관리
 */
export default function BillingTab() {
  const lang = 'ko' as const

  return (
    <div className="space-y-6">
      {/* 결제 수단 - 준비중 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.billing.paymentMethod.title[lang]}</CardTitle>
          <CardDescription>
            {uiText.settings.billing.paymentMethod.pending[lang]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-sm">
              {uiText.settings.billing.paymentMethod.pendingBadge[lang]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {uiText.settings.billing.paymentMethod.pendingMessage[lang]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 결제 내역 - 준비중 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.billing.history.title[lang]}</CardTitle>
          <CardDescription>
            {uiText.settings.billing.history.pending[lang]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-sm">
              {uiText.settings.billing.history.pendingBadge[lang]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {uiText.settings.billing.history.pendingMessage[lang]}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
