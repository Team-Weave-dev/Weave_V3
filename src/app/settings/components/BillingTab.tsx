"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { uiText } from '@/config/brand'
import type { PaymentMethod, BillingHistory, PaymentStatus } from '@/lib/types/settings.types'

/**
 * 결제 탭 컴포넌트
 * 결제 수단 및 결제 내역 관리
 */
export default function BillingTab() {
  const lang = 'ko' as const

  // Mock 데이터 (실제로는 API에서 가져옴)
  const paymentMethod: PaymentMethod | null = {
    id: '1',
    cardNumber: '**** **** **** 1234',
    expiryDate: '12/25',
    cardHolder: '홍길동',
    isDefault: true,
    createdAt: '2024-01-01'
  }

  const billingHistory: BillingHistory[] = [
    {
      id: '1',
      date: '2024-10-01',
      amount: 29700,
      plan: 'pro',
      status: 'paid',
      description: 'Pro 요금제 월간 구독'
    },
    {
      id: '2',
      date: '2024-09-01',
      amount: 29700,
      plan: 'pro',
      status: 'paid',
      description: 'Pro 요금제 월간 구독'
    }
  ]

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, "default" | "secondary" | "error" | "outline"> = {
      paid: "default",
      pending: "secondary",
      failed: "error",
      refunded: "outline"
    }
    return (
      <Badge variant={variants[status]}>
        {uiText.settings.billing.status[status][lang]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* 결제 수단 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.billing.paymentMethod.title[lang]}</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethod ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{uiText.settings.billing.paymentMethod.cardNumber[lang]}</p>
                  <p className="text-2xl font-bold">{paymentMethod.cardNumber}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">{uiText.settings.billing.paymentMethod.expiryDate[lang]}</p>
                  <p className="text-sm font-medium">{paymentMethod.expiryDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{uiText.settings.billing.paymentMethod.cardHolder[lang]}</p>
                <p className="text-sm font-medium">{paymentMethod.cardHolder}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  {uiText.settings.billing.paymentMethod.change[lang]}
                </Button>
                <Button variant="destructive" size="sm">
                  {uiText.settings.billing.paymentMethod.remove[lang]}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {uiText.settings.billing.paymentMethod.none[lang]}
              </p>
              <Button>
                {uiText.settings.billing.paymentMethod.add[lang]}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결제 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.billing.history.title[lang]}</CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{uiText.settings.billing.history.date[lang]}</TableHead>
                  <TableHead>{uiText.settings.billing.history.plan[lang]}</TableHead>
                  <TableHead>{uiText.settings.billing.history.amount[lang]}</TableHead>
                  <TableHead>{uiText.settings.billing.history.status[lang]}</TableHead>
                  <TableHead>{uiText.settings.billing.history.invoice[lang]}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="capitalize">{item.plan}</TableCell>
                    <TableCell>{item.amount.toLocaleString()}원</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        {uiText.settings.billing.history.download[lang]}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {uiText.settings.billing.history.none[lang]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
